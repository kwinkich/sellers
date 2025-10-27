import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Generate build timestamp for cache busting
const BUILD_TIMESTAMP = Date.now().toString();

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Custom plugin to inject build timestamp into HTML
    {
      name: "inject-build-timestamp",
      transformIndexHtml(html) {
        return html
          .replace(
            /(<link[^>]*href=")([^"]*\.css)("[^>]*>)/g,
            `$1$2?v=${BUILD_TIMESTAMP}$3`
          )
          .replace(
            /(<script[^>]*src=")([^"]*\.js)("[^>]*>)/g,
            `$1$2?v=${BUILD_TIMESTAMP}$3`
          );
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(fileURLToPath(new URL("./src", import.meta.url))),
    },
    preserveSymlinks: true,
  },
  server: { watch: { usePolling: true, interval: 300 } },
  build: {
    // keeps CSS split so each chunk gets its own hashed css name
    cssCodeSplit: true,
    // optional: emit manifest for servers to map hashed files
    manifest: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash][extname]`,
      },
    },
  },
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(BUILD_TIMESTAMP),
  },
});
