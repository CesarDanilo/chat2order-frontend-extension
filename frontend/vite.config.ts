import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite"
// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
})
