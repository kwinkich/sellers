import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(fileURLToPath(new URL("./src", import.meta.url))) },
    // Ключевая строка:
    preserveSymlinks: true,
  },
  server: {
    // На виртуальных/сетевых дисках наблюдение файлов иногда ломается
    watch: { usePolling: true, interval: 300 },
  },
});