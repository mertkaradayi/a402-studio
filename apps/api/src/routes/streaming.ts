import { Router, Request, Response } from "express";
import { BeepClient } from "@beep-it/sdk-core";

export const streamingRouter = Router();

// Initialize Beep Client with secret key (required for streaming APIs)
const BEEP_SECRET_KEY = process.env.BEEP_SECRET_KEY || process.env.BEEP_API_KEY || "";
const BEEP_SERVER_URL = process.env.BEEP_API_URL || "https://api.justbeep.it";

if (!BEEP_SECRET_KEY) {
  console.warn("[streaming] Missing BEEP_SECRET_KEY. Live streaming endpoints will fail.");
}

let beepClient: BeepClient | null = null;

try {
  beepClient = new BeepClient({
    apiKey: BEEP_SECRET_KEY,
    serverUrl: BEEP_SERVER_URL,
  });
} catch (error: any) {
  console.warn("[streaming] Failed to initialize BeepClient:", error?.message || error);
}

const ensureBeepClient = () => {
  if (!beepClient) {
    throw new Error("BEEP_SECRET_KEY not configured; live streaming is unavailable.");
  }
  return beepClient;
};

const resolveMerchantId = async (explicitId?: string) => {
  if (explicitId?.trim()) return explicitId.trim();

  const client = ensureBeepClient();
  const profile = await client.user.getCurrentUser();

  if (!profile?.merchantId) {
    throw new Error("Unable to resolve merchantId for streaming from the configured API key.");
  }

  return profile.merchantId;
};

const looksLikeUuid = (value: string) => /^[0-9a-f-]{16,}$/i.test(value);

const normalizeAssetChunks = async (
  assetChunks: Array<Record<string, any>>
): Promise<Array<{ assetId: string; quantity: number; name?: string }>> => {
  const client = ensureBeepClient();
  const normalized: Array<{ assetId: string; quantity: number; name?: string }> = [];

  for (const chunk of assetChunks) {
    const quantity = Number(chunk.quantity) || 1;
    const providedId = typeof chunk.assetId === "string" ? chunk.assetId.trim() : "";

    if (providedId && looksLikeUuid(providedId)) {
      normalized.push({
        assetId: providedId,
        quantity,
        name: chunk.name,
      });
      continue;
    }

    const price = typeof chunk.unitPrice === "string" && chunk.unitPrice.trim() ? chunk.unitPrice.trim() : "0.01";
    const name = chunk.name || providedId || "Streaming asset";
    const product = await client.products.createProduct({
      name,
      description: chunk.description ?? null,
      price,
      quantity,
    });

    normalized.push({
      assetId: product.uuid,
      quantity,
      name: chunk.name || product.name,
    });
  }

  return normalized;
};

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

    if (!beepClient) {
      return res.status(500).json({ error: "BEEP_SECRET_KEY not configured; live streaming is disabled." });
    }

    if (!assetChunks || !Array.isArray(assetChunks) || assetChunks.length === 0) {
      return res.status(400).json({ error: "assetChunks array required" });
    }

    const resolvedMerchantId = await resolveMerchantId(payingMerchantId);
    const normalizedAssetChunks = await normalizeAssetChunks(assetChunks);

    // Call Beep SDK to issue payment
    const result = await ensureBeepClient().payments.issuePayment({
      assetChunks: normalizedAssetChunks,
      payingMerchantId: resolvedMerchantId,
      invoiceId: existingInvoiceId,
    });

    console.log(`[streaming/issue] Created session ${result.invoiceId} for merchant ${resolvedMerchantId}`);

    // Update local cache
    sessionCache.set(result.invoiceId, {
      invoiceId: result.invoiceId,
      state: "issued",
      merchantId: resolvedMerchantId,
      assets: normalizedAssetChunks,
    });

    res.json({
      invoiceId: result.invoiceId,
      referenceKey: result.referenceKey,
      merchantId: resolvedMerchantId,
      assets: normalizedAssetChunks,
    });
  } catch (error: any) {
    console.error("Failed to issue payment:", error);
    res.status(500).json({ error: error.message || "Failed to issue payment" });
  }
});

/**
 * GET /streaming/merchant
 * Resolve merchantId tied to the configured API key
 */
streamingRouter.get("/merchant", async (_req: Request, res: Response) => {
  try {
    if (!beepClient) {
      return res.status(500).json({ error: "BEEP_SECRET_KEY not configured; live streaming is disabled." });
    }

    const merchantId = await resolveMerchantId();
    res.json({ merchantId });
  } catch (error: any) {
    console.error("Failed to resolve merchant id:", error);
    res.status(500).json({ error: error.message || "Failed to resolve merchant id" });
  }
});

/**
 * POST /streaming/start
 * Start a streaming session (begin charging)
 */
streamingRouter.post("/start", async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.body;

    if (!beepClient) {
      return res.status(500).json({ error: "BEEP_SECRET_KEY not configured; live streaming is disabled." });
    }

    if (!invoiceId) {
      return res.status(400).json({ error: "invoiceId required" });
    }

    // Call Beep SDK to start streaming
    const result = await ensureBeepClient().payments.startStreaming({
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

    if (!beepClient) {
      return res.status(500).json({ error: "BEEP_SECRET_KEY not configured; live streaming is disabled." });
    }

    if (!invoiceId) {
      return res.status(400).json({ error: "invoiceId required" });
    }

    // Call Beep SDK to pause streaming
    const result = await ensureBeepClient().payments.pauseStreaming({
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

    if (!beepClient) {
      return res.status(500).json({ error: "BEEP_SECRET_KEY not configured; live streaming is disabled." });
    }

    if (!invoiceId) {
      return res.status(400).json({ error: "invoiceId required" });
    }

    // Call Beep SDK to stop streaming
    const result = await ensureBeepClient().payments.stopStreaming({
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

