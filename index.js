import express from "express";
import markoMiddleware from "@marko/express";
import compressionMiddleware from "compression";

const devEnv = "development";
const { NODE_ENV = devEnv, PORT = 3000 } = process.env;

const app = express().use(compressionMiddleware()).use(markoMiddleware());

if (NODE_ENV === devEnv) {
  const { once } = await import("events"); // Import 'once' only when needed for listen
  console.time("DevServerStart");
  const { createServer } = await import("vite");
  const devServer = await createServer({
    appType: "custom",
    server: { middlewareMode: true },
  });
  app.use(devServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const { router } = await devServer.ssrLoadModule("./src/index.js");
      // Express Router instances should be called with .handle() when used directly
      router.handle(req, res, next);
    } catch (err) {
      next(err);
    }
  });
  await once(app.listen(PORT), "listening");
  console.timeEnd("DevServerStart");
  console.log(`Env: ${NODE_ENV}`);
  console.log(`Address: http://localhost:${PORT}`);
} else {
  // Production mode (Vercel)
  console.log(`Production mode. NODE_ENV: ${NODE_ENV}`);

  // Log file existence before trying to import
  try {
    const fs = await import("fs");
    const path = await import("path");

    // Get current directory
    const currentDir = process.cwd();
    console.log(`Current working directory: ${currentDir}`);

    // Log contents of the current directory (/var/task)
    try {
      const rootDirContents = fs.readdirSync(currentDir);
      console.log(
        `Root (/var/task) directory contents: ${JSON.stringify(
          rootDirContents
        )}`
      );
    } catch (readErr) {
      console.error(
        `Error reading root directory contents: ${readErr.message}`
      );
    }

    // Check if dist directory exists
    const distPath = path.join(currentDir, "dist");
    const distExists = fs.existsSync(distPath);
    console.log(`Dist directory exists: ${distExists}`);

    // Check if dist/index.js exists
    const ssrPath = path.join(distPath, "index.js");
    const ssrExists = fs.existsSync(ssrPath);
    console.log(`SSR bundle exists: ${ssrExists}`);

    if (distExists) {
      // Log contents of dist directory
      const distFiles = fs.readdirSync(distPath);
      console.log(`Dist directory contents: ${JSON.stringify(distFiles)}`);
    }
  } catch (fsError) {
    console.error("Error checking file system:", fsError);
  }

  // Serve static assets
  app.use("/assets", express.static("dist/assets"));
  app.use(express.static("dist")); // Serves files from 'dist' (e.g., marko.svg)

  let ssrBundlePath; // Declare here for accessibility in catch block
  try {
    // Dynamically import the SSR bundle.
    const path = await import("path");
    const currentDir = process.cwd(); // Should be /var/task on Vercel
    ssrBundlePath = path.join(currentDir, "dist", "index.js"); // Assign value here
    console.log(
      `Attempting to import SSR bundle from absolute path: ${ssrBundlePath}`
    );

    const ssrModule = await import(ssrBundlePath); // Using absolute path
    if (ssrModule && ssrModule.router) {
      app.use(ssrModule.router);
    } else {
      // This case should ideally not happen if the build is correct.
      console.error(
        "CRITICAL: SSR router not found in ./dist/index.js. Module content:",
        ssrModule
      );
      app.use((req, res) => {
        res
          .status(500)
          .type("text/plain")
          .send(
            "Server Error: SSR module loaded but router is missing. Check server logs."
          );
      });
    }
  } catch (error) {
    const pathAttempted =
      ssrBundlePath ||
      "./dist/index.js (path could not be determined prior to error)";
    console.error(
      `CRITICAL: Failed to load or use SSR router from ${pathAttempted}`,
      error.stack || error
    );
    app.use((req, res) => {
      res
        .status(500)
        .type("text/plain")
        .send(
          "Server Error: SSR module failed to load. Check server logs for details."
        );
    });
  }

  // Generic error handler for any unhandled errors in the Express app on Vercel
  app.use((err, req, res, next) => {
    console.error(
      "Unhandled error in Express app (production):",
      err.stack || err
    );
    // Avoid using res.marko here if Marko itself could be the source of errors
    res
      .status(500)
      .type("text/plain")
      .send("Internal Server Error. An unexpected error occurred.");
  });
}

export default app;
