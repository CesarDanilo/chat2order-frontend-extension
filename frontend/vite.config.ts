import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

const REQUIRED_URLS = ["VITE_API_URL", "VITE_DASHBOARD_URL"] as const;

// O build de produção vai para a loja: precisa apontar para HTTPS público, nunca para a máquina local.
function assertProductionUrls(env: Record<string, string>) {
  for (const name of REQUIRED_URLS) {
    const value = env[name];

    if (!value) throw new Error(`${name} não definida para o build de produção.`);

    const url = new URL(value);
    const isLocal = ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"].includes(url.hostname);

    if (url.protocol !== "https:" || isLocal) {
      throw new Error(`${name} precisa ser uma URL https pública no build de produção.`);
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === "production") assertProductionUrls(loadEnv(mode, process.cwd(), "VITE_"));

  return {
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
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
