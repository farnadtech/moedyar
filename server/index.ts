import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import subscriptionRoutes from "./routes/subscriptions";
import notificationRoutes from "./routes/notifications";
import adminRoutes from "./routes/admin";
import configRoutes from "./routes/config";
import teamRoutes from "./routes/teams";
import { startNotificationScheduler } from "./lib/scheduler";

// Load environment variables
dotenv.config();

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ charset: 'utf-8' }));
  app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

  // Set UTF-8 charset for all responses
  app.use((req, res, next) => {
    res.charset = 'utf-8';
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.use("/api/auth", authRoutes);

  // Event routes
  app.use("/api/events", eventRoutes);

  // Subscription routes
  app.use("/api/subscriptions", subscriptionRoutes);

  // Notification routes
  app.use("/api/notifications", notificationRoutes);

  // Admin routes
  app.use("/api/admin", adminRoutes);

  // Config routes
  app.use("/api/config", configRoutes);

  // Team routes
  app.use("/api/teams", teamRoutes);

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("API Error:", err);
    res.status(500).json({
      success: false,
      message: "خطای داخلی سرور",
    });
  });

  // Start notification scheduler
  if (process.env.NODE_ENV !== "test") {
    startNotificationScheduler();
  }

  return app;
}
