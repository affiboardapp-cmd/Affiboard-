// Carregar variáveis de ambiente PRIMEIRO, antes de qualquer outro import
import { config } from "dotenv";
import { resolve, dirname, join } from "path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "url";

// Definir __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env da raiz do projeto
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  config({ path: envPath });
  console.log("[Server] ✅ Arquivo .env carregado de:", envPath);
} else {
  console.warn("[Server] ⚠️ Arquivo .env não encontrado em:", envPath);
  console.warn("[Server] Carregando variáveis de ambiente do sistema...");
  config(); // Tenta carregar do sistema (já que pode estar em .env de outras pastas)
}

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import path from "path";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

const app = express();

// ============================================
// CLOUD RUN HEALTH CHECK - INSTANT RESPONSE
// ============================================

// Health check routes FIRST - before ANY middleware
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// ============================================
// MIDDLEWARE
// ============================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false, limit: "10mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  const pathStr = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathStr.startsWith("/api")) {
      let logLine = `${req.method} ${pathStr} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && res.statusCode >= 400) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      console.log(
        `${new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })} [express] ${logLine}`
      );
    }
  });

  next();
});

// ============================================
// ROUTES
// ============================================

registerRoutes(null as any, app);

// ============================================
// STATIC & FALLBACK
// ============================================

app.use(express.static(join(__dirname, "../public")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/webhooks")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(join(__dirname, "../public/index.html"));
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Error]", err.message || err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ success: false, error: message });
});

// ============================================
// LISTEN - ASYNC INIT AFTER THIS
// ============================================

const PORT = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[express] Server ready on 0.0.0.0:${PORT}`);

  // Initialize async operations AFTER listening
  setImmediate(async () => {
    try {
      const { registerLemonWebhook } = await import("./routes");
      await registerLemonWebhook();
    } catch (err) {
      console.error("[Init] Webhook init error:", err);
    }
  });
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
