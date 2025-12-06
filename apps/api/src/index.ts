import express from "express";
import cors from "cors";
import { a402Router } from "./routes/a402.js";
import { proxyRouter } from "./routes/proxy.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
  console.log(`API server running on http://localhost:${PORT}`);
});
