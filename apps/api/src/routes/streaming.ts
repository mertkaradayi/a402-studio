import { Router, Request, Response } from "express";
import { BeepClient } from "@beep-it/sdk-core";

export const streamingRouter = Router();

// Initialize Beep Client
const beepClient = new BeepClient({
  apiKey: process.env.BEEP_API_KEY || "",
});

// Simple in-memory cache for status checks (optional, but good for UI responsiveness)
// In production, you might want to rely on webhooks or database
interface LocalSessionState {
  invoiceId: string;
  state: "issued" | "active" | "paused" | "stopped";
  merchantId: string;
  assets: any[];
}
const sessionCache = new Map<string, LocalSessionState>();

/**
 * POST /streaming/issue
 * Issue a new streaming payment request (creates invoice)
 */
streamingRouter.post("/issue", async (req: Request, res: Response) => {
  try {
    const { assetChunks, payingMerchantId, invoiceId: existingInvoiceId } = req.body;

    if (!assetChunks || !Array.isArray(assetChunks) || assetChunks.length === 0) {
      return res.status(400).json({ error: "assetChunks array required" });
    }

    if (!payingMerchantId) {
      return res.status(400).json({ error: "payingMerchantId required" });
    }

    // Call Beep SDK to issue payment
    const result = await beepClient.payments.issuePayment({
      assetChunks,
      payingMerchantId,
      invoiceId: existingInvoiceId,
    });

    console.log(`[streaming/issue] Created session ${result.invoiceId} for merchant ${payingMerchantId}`);

    // Update local cache
    sessionCache.set(result.invoiceId, {
      invoiceId: result.invoiceId,
      state: "issued",
      merchantId: payingMerchantId,
      assets: assetChunks,
    });

    res.json({
      invoiceId: result.invoiceId,
      referenceKey: result.referenceKey,
    });
  } catch (error: any) {
    console.error("Failed to issue payment:", error);
    res.status(500).json({ error: error.message || "Failed to issue payment" });
  }
});

/**
 * POST /streaming/start
 * Start a streaming session (begin charging)
 */
streamingRouter.post("/start", async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ error: "invoiceId required" });
    }

    // Call Beep SDK to start streaming
    const result = await beepClient.payments.startStreaming({
      invoiceId,
    });

    console.log(`[streaming/start] Started session ${invoiceId}`);

    // Update local cache
    const session = sessionCache.get(invoiceId);
    if (session) {
      session.state = "active";
    }

    res.json({
      invoiceId: result.invoiceId,
    });
  } catch (error: any) {
    console.error("Failed to start stream:", error);
    res.status(500).json({ error: error.message || "Failed to start stream" });
  }
});

/**
 * POST /streaming/pause
 * Pause a streaming session
 */
streamingRouter.post("/pause", async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ error: "invoiceId required" });
    }

    // Call Beep SDK to pause streaming
    const result = await beepClient.payments.pauseStreaming({
      invoiceId,
    });

    console.log(`[streaming/pause] Paused session ${invoiceId}`);

    // Update local cache
    const session = sessionCache.get(invoiceId);
    if (session) {
      session.state = "paused";
    }

    res.json({
      success: result.success,
    });
  } catch (error: any) {
    console.error("Failed to pause stream:", error);
    res.status(500).json({ error: error.message || "Failed to pause stream" });
  }
});

/**
 * POST /streaming/stop
 * Stop a streaming session permanently
 */
streamingRouter.post("/stop", async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ error: "invoiceId required" });
    }

    // Call Beep SDK to stop streaming
    const result = await beepClient.payments.stopStreaming({
      invoiceId,
    });

    console.log(`[streaming/stop] Stopped session ${invoiceId}, total refs: ${result.referenceKeys.length}`);

    // Update local cache
    const session = sessionCache.get(invoiceId);
    if (session) {
      session.state = "stopped";
    }

    res.json({
      invoiceId: result.invoiceId,
      referenceKeys: result.referenceKeys,
    });
  } catch (error: any) {
    console.error("Failed to stop stream:", error);
    res.status(500).json({ error: error.message || "Failed to stop stream" });
  }
});

/**
 * GET /streaming/status/:invoiceId
 * Get status (combined local cache + SDK status if possible)
 */
streamingRouter.get("/status/:invoiceId", (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  const session = sessionCache.get(invoiceId);

  if (!session) {
    return res.status(404).json({ error: "Session not found in local cache" });
  }

  // Note: For a real app, you might want to fetch latest status from Beep API if available,
  // or rely on webhooks to keep local state in sync.
  res.json({
    invoiceId: session.invoiceId,
    state: session.state,
    merchantId: session.merchantId,
    assets: session.assets,
    // We don't have charges history in local cache for this shim,
    // but the frontend handles that mostly via simulation or result of stop()
    charges: [],
    referenceKeys: [],
  });
});

