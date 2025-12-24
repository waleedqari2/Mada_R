import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

// Import database connection
import { testConnection } from "./database/connection.js";

// Import routes
import authRoutes from "./routes/auth.js";
import requestsRoutes from "./routes/requests.js";
import reportsRoutes from "./routes/reports.js";
import auditLogsRoutes from "./routes/auditLogs.js";
import notificationsRoutes from "./routes/notifications.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Test database connection
  await testConnection();

  // Middleware
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    message: "Too many requests from this IP, please try again later.",
  });

  app.use("/api/", limiter);

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/requests", requestsRoutes);
  app.use("/api/reports", reportsRoutes);
  app.use("/api/audit-logs", auditLogsRoutes);
  app.use("/api/notifications", notificationsRoutes);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(staticPath, "index.html"));
    } else {
      res.status(404).json({ error: "API endpoint not found" });
    }
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}/`);
    console.log(`📊 API available at http://localhost:${port}/api`);
  });
}

startServer().catch(console.error);
