import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Tema segue o navegador: a classe `dark` ativa os tokens escuros de index.css.
const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");

function applyColorScheme() {
  document.documentElement.classList.toggle("dark", darkScheme.matches);
}

applyColorScheme();
darkScheme.addEventListener("change", applyColorScheme);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
