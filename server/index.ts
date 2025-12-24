import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { testConnection } from "./config/database.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// Import routes
import authRoutes from "./routes/auth.js";
import requestsRoutes from "./routes/requests.js";
import searchRoutes from "./routes/search.js";
import reportsRoutes from "./routes/reports.js";
import auditLogsRoutes from "./routes/auditLogs.js";
import notificationsRoutes from "./routes/notifications.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Test database connection
  await testConnection();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  }));

  // CORS configuration
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  };
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "تم تجاوز عدد الطلبات المسموح به، يرجى المحاولة لاحقاً",
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 attempts per 15 minutes
    message: "تم تجاوز عدد محاولات تسجيل الدخول، يرجى المحاولة بعد 15 دقيقة",
  });

  // API routes
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/requests", limiter, requestsRoutes);
  app.use("/api/requests", limiter, searchRoutes);
  app.use("/api/reports", limiter, reportsRoutes);
  app.use("/api/audit-logs", limiter, auditLogsRoutes);
  app.use("/api/notifications", limiter, notificationsRoutes);

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
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return notFoundHandler(req, res);
    }
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}/`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 API Base URL: http://localhost:${port}/api`);
  });
}

startServer().catch(console.error);
