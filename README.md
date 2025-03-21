Marko Widgets: UI Components Playground w/ Vite
# Marko Vite News

A demo news application built with **Marko 5**, **Vite**, and **Express** that showcases UI components, responsive design, and accessibility best practices.

## Features

- **Semantic HTML:** Uses proper headings, `<main>`, `<nav>`, and `<footer>` to improve structure for screen readers and other assistive technologies.
- **Responsive Design:** The layout adapts to different screen sizes.
- **Fetch Logic & State Management:** News articles are fetched from an API based on user queries, with loading and error states.
- **Pagination & Per Page Selection:** Users can navigate through articles and choose how many articles to see per page.
- **Accessibility:** Includes ARIA attributes where appropriate, meaningful alt text, and consistent keyboard focus outlines.

## Setup

1. **Install Dependencies:**

  ```bash
  npm install
  ```
2. **Development Server:**

  ```bash
  npm run dev
  ``` 

This launches the Express server in development mode, then runs Vite with HMR (hot module replacement).

3. **Build for Production**

  ```bash
  npm run build
  npm run start
  ```
Compiles the client and server bundles, then starts the Express server serving production assets.

4. **Testing**

  ```bash
  npm run test
  ```
I added Jest and `@marko/testing-library` for comprehensive tests.

