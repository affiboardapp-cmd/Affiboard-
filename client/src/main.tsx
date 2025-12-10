import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("[MAIN] Starting AffiBoard application...");

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("[MAIN] Root element not found!");
  throw new Error("Root element not found");
}

console.log("[MAIN] Root element found, creating React app...");

try {
  createRoot(rootElement).render(<App />);
  console.log("[MAIN] React app rendered successfully");
} catch (error) {
  console.error("[MAIN] Error rendering app:", error);
  throw error;
}
