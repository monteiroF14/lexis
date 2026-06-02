import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    dedupe: ["pdfjs-dist"],
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        dashboard: resolve(root, "html/dashboard.html"),
      },
    },
  },
  base: "/lexis/",
});
