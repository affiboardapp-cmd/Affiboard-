#!/usr/bin/env node

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";
const envPath = resolve(process.cwd(), ".env");

if (existsSync(envPath)) {
  config({ path: envPath });
  console.log("[Server] ✅ Arquivo .env carregado de:", envPath);
} else {
  console.warn("[Server] ⚠️ Arquivo .env não encontrado em:", envPath);
  console.warn("[Server] Carregando variáveis de ambiente do sistema...");
  config(); // Tenta carregar do sistema (já que pode estar em .env de outras pastas)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "..", "server", "index.ts");
const projectRoot = path.join(__dirname, "..");

console.log("Starting AffiBoard MVP server...");

const child = spawn("npx", ["tsx", serverPath], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || "development",
  },
  cwd: projectRoot,
});

child.on("error", (err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

child.on("close", (code) => {
  process.exit(code ?? 1);
});

process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGINT", () => child.kill("SIGINT"));
