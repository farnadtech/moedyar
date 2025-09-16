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

// Marketplace routes
import marketplaceAuthRoutes from "./routes/marketplace-auth";
import productsRoutes from "./routes/products";
import categoriesRoutes from "./routes/categories";
import ordersRoutes from "./routes/orders";

import { startNotificationScheduler } from "./lib/scheduler";

// Load environment variables
dotenv.config();

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Set UTF-8 charset for all responses
  app.use((req, res, next) => {
    res.charset = "utf-8";
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    next();
  });

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Moedyar Marketplace API!" });
  });

  app.get("/api/demo", handleDemo);

  // Legacy routes (for backward compatibility)
  app.use("/api/auth", authRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/subscriptions", subscriptionRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/config", configRoutes);
  app.use("/api/teams", teamRoutes);

  // Marketplace routes
  app.use("/api/marketplace/auth", marketplaceAuthRoutes);
  app.use("/api/marketplace/products", productsRoutes);
  app.use("/api/marketplace/categories", categoriesRoutes);
  app.use("/api/marketplace/orders", ordersRoutes);

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
