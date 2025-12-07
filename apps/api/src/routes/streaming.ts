import { Router, Request, Response } from "express";

export const streamingRouter = Router();

// In-memory store for streaming sessions (demo purposes)
interface StreamingSession {
  invoiceId: string;
  merchantId: string;
  assets: Array<{ assetId: string; quantity: number; name?: string }>;
  state: "issued" | "active" | "paused" | "stopped";
  referenceKeys: string[];
  charges: Array<{
    referenceKey: string;
    amount: string;
    timestamp: number;
  }>;
  createdAt: number;
  startedAt: number | null;
  pausedAt: number | null;
  stoppedAt: number | null;
}

const sessions = new Map<string, StreamingSession>();

/**
 * POST /streaming/issue
 * Issue a new streaming payment request (creates invoice)
 *
 * Maps to Beep SDK: payments.issuePayment()
 */
streamingRouter.post("/issue", (req: Request, res: Response) => {
  const { assetChunks, payingMerchantId, invoiceId: existingInvoiceId } = req.body;

  if (!assetChunks || !Array.isArray(assetChunks) || assetChunks.length === 0) {
    return res.status(400).json({ error: "assetChunks array required" });
  }

  if (!payingMerchantId) {
    return res.status(400).json({ error: "payingMerchantId required" });
  }

  // Use existing invoice or create new one
  const invoiceId = existingInvoiceId || `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const referenceKey = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const session: StreamingSession = {
    invoiceId,
    merchantId: payingMerchantId,
    assets: assetChunks,
    state: "issued",
    referenceKeys: [referenceKey],
    charges: [],
    createdAt: Date.now(),
    startedAt: null,
    pausedAt: null,
    stoppedAt: null,
  };

  sessions.set(invoiceId, session);

  console.log(`[streaming/issue] Created session ${invoiceId} for merchant ${payingMerchantId}`);

  res.json({
    invoiceId,
    referenceKey,
  });
});

/**
 * POST /streaming/start
 * Start a streaming session (begin charging)
 *
 * Maps to Beep SDK: payments.startStreaming()
 */
streamingRouter.post("/start", (req: Request, res: Response) => {
  const { invoiceId } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ error: "invoiceId required" });
  }

  const session = sessions.get(invoiceId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (session.state === "stopped") {
    return res.status(400).json({ error: "Cannot start a stopped session" });
  }

  if (session.state === "active") {
    return res.status(400).json({ error: "Session already active" });
  }

  session.state = "active";
  session.startedAt = session.startedAt || Date.now();
  session.pausedAt = null;

  console.log(`[streaming/start] Started session ${invoiceId}`);

  res.json({
    invoiceId: session.invoiceId,
  });
});

/**
 * POST /streaming/pause
 * Pause a streaming session (stop charging temporarily)
 *
 * Maps to Beep SDK: payments.pauseStreaming()
 */
streamingRouter.post("/pause", (req: Request, res: Response) => {
  const { invoiceId } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ error: "invoiceId required" });
  }

  const session = sessions.get(invoiceId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (session.state !== "active") {
    return res.status(400).json({ error: "Can only pause active sessions" });
  }

  session.state = "paused";
  session.pausedAt = Date.now();

  console.log(`[streaming/pause] Paused session ${invoiceId}`);

  res.json({
    success: true,
  });
});

/**
 * POST /streaming/stop
 * Stop a streaming session permanently and finalize charges
 *
 * Maps to Beep SDK: payments.stopStreaming()
 */
streamingRouter.post("/stop", (req: Request, res: Response) => {
  const { invoiceId } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ error: "invoiceId required" });
  }

  const session = sessions.get(invoiceId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (session.state === "stopped") {
    return res.status(400).json({ error: "Session already stopped" });
  }

  session.state = "stopped";
  session.stoppedAt = Date.now();

  console.log(`[streaming/stop] Stopped session ${invoiceId}, total refs: ${session.referenceKeys.length}`);

  res.json({
    invoiceId: session.invoiceId,
    referenceKeys: session.referenceKeys,
  });
});

/**
 * POST /streaming/charge
 * Add a charge to a streaming session (for simulation)
 * In production, this would be handled by Beep's backend
 */
streamingRouter.post("/charge", (req: Request, res: Response) => {
  const { invoiceId, amount, asset = "USDC" } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ error: "invoiceId required" });
  }

  if (!amount) {
    return res.status(400).json({ error: "amount required" });
  }

  const session = sessions.get(invoiceId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (session.state !== "active") {
    return res.status(400).json({ error: "Can only charge active sessions" });
  }

  const referenceKey = `ref_charge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  session.charges.push({
    referenceKey,
    amount,
    timestamp: Date.now(),
  });
  session.referenceKeys.push(referenceKey);

  console.log(`[streaming/charge] Added charge to ${invoiceId}: ${amount} ${asset}`);

  res.json({
    referenceKey,
    amount,
    asset,
    timestamp: Date.now(),
  });
});

/**
 * GET /streaming/status/:invoiceId
 * Get the current status of a streaming session
 *
 * Maps to Beep SDK: payments.checkPaymentStatus()
 */
streamingRouter.get("/status/:invoiceId", (req: Request, res: Response) => {
  const { invoiceId } = req.params;

  const session = sessions.get(invoiceId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  // Calculate total charged
  const totalCharged = session.charges.reduce(
    (sum, charge) => sum + parseFloat(charge.amount),
    0
  );

  res.json({
    invoiceId: session.invoiceId,
    state: session.state,
    merchantId: session.merchantId,
    assets: session.assets,
    referenceKeys: session.referenceKeys,
    charges: session.charges,
    totalCharged: totalCharged.toFixed(6),
    createdAt: session.createdAt,
    startedAt: session.startedAt,
    pausedAt: session.pausedAt,
    stoppedAt: session.stoppedAt,
  });
});

/**
 * GET /streaming/sessions
 * List all streaming sessions (for debugging)
 */
streamingRouter.get("/sessions", (_req: Request, res: Response) => {
  const allSessions = Array.from(sessions.values()).map((session) => ({
    invoiceId: session.invoiceId,
    state: session.state,
    merchantId: session.merchantId,
    assetCount: session.assets.length,
    chargeCount: session.charges.length,
    createdAt: session.createdAt,
  }));

  res.json(allSessions);
});
