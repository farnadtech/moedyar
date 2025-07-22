import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import subscriptionRoutes from "./routes/subscriptions";

// Load environment variables
dotenv.config();

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
