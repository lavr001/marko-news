import { defineConfig } from "vite";
import marko from "@marko/vite";

// Plugin to stub .less imports in SSR
function stubLessInSSR() {
  return {
    name: "stub-less-in-ssr",
    resolveId(source, importer, options) {
      if (options?.ssr && source.endsWith(".less")) {
        return this.resolve("/empty-style-module.js", undefined, {
          skipSelf: true,
        });
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [marko(), stubLessInSSR()],
  build: {
    sourcemap: true, // Generate sourcemaps for all builds.
    emptyOutDir: false, // Avoid server & client deleting files from each other.
  },
});
