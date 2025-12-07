import "dotenv/config";
import express from "express";
import cors from "cors";
import { a402Router } from "./routes/a402.js";
import { proxyRouter } from "./routes/proxy.js";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:3000"];

// Always allow ngrok domains for development
const isNgrokOrigin = (origin: string) => origin?.includes(".ngrok") || origin?.includes(".ngrok-free.app");

console.log("[CORS] Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      // Allow if origin matches or wildcard is set
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      // Always allow ngrok domains for development testing
      if (isNgrokOrigin(origin)) {
        console.log(`[CORS] Allowing ngrok origin: ${origin}`);
        return callback(null, true);
      }
      // Reject by passing false (not throwing error)
      console.log(`[CORS] Blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// a402 routes
app.use("/a402", a402Router);

// Proxy route for CORS bypass
app.use("/proxy", proxyRouter);

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});
