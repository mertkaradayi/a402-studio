import { Router, Request, Response } from "express";
import { BeepClient } from "@beep-it/sdk-core";

const BEEP_SECRET_KEY = process.env.BEEP_SECRET_KEY || process.env.BEEP_API_KEY || "";
const BEEP_SERVER_URL = process.env.BEEP_API_URL || "https://api.justbeep.it";

export const beepRouter = Router();

// Guard: refuse to run without secret key
if (!BEEP_SECRET_KEY) {
  console.warn("[beep] Missing BEEP_SECRET_KEY. /beep routes will return 500 until configured.");
}

// Shared client (secret key only; do NOT expose to frontend)
const beepClient = BEEP_SECRET_KEY
  ? new BeepClient({ apiKey: BEEP_SECRET_KEY, serverUrl: BEEP_SERVER_URL })
  : null;

/**
 * POST /beep/pay
 * Minimal wrapper around requestAndPurchaseAsset to create/check a 402 payment.
 * - For phase 1, omit paymentReference to get referenceKey + paymentUrl (possibly 402).
 * - For phase 2, pass the same paymentReference to check completion.
 *
 * Body:
 * {
 *   assets: [{ assetId: string; quantity: number; name?: string }],
 *   paymentReference?: string,
 *   paymentLabel?: string,
 *   generateQrCode?: boolean
 * }
 */
beepRouter.post("/pay", async (req: Request, res: Response) => {
  if (!beepClient) {
    return res.status(500).json({ error: "BEEP_SECRET_KEY not configured" });
  }

  const { assets, paymentReference, paymentLabel, generateQrCode = false } = req.body as {
    assets?: Array<{ assetId: string; quantity: number; name?: string }>;
    paymentReference?: string;
    paymentLabel?: string;
    generateQrCode?: boolean;
  };

  if (!paymentReference && (!assets || !Array.isArray(assets) || assets.length === 0)) {
    return res.status(400).json({ error: "assets array required for initial request" });
  }

  try {
    const data = await beepClient.payments.requestAndPurchaseAsset({
      assets: assets || [],
      paymentReference,
      paymentLabel,
      generateQrCode,
    });

    return res.json({
      ok: true,
      data,
    });
  } catch (error: any) {
    console.error("[beep/pay] Error:", error?.response?.data || error?.message || error);
    return res.status(500).json({
      error: error?.response?.data || error?.message || "Beep payment request failed",
    });
  }
});

