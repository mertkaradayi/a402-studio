const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface BeepPayParams {
  assets: Array<{ assetId: string; quantity: number; name?: string }>;
  paymentReference?: string;
  paymentLabel?: string;
  generateQrCode?: boolean;
}

export interface BeepPayResponse {
  ok: boolean;
  data: any;
}

/**
 * Call backend /beep/pay to create/check a Beep payment.
 * - Phase 1: omit paymentReference to get referenceKey/paymentUrl
 * - Phase 2: include paymentReference to check completion
 */
export async function requestBeepPayment(params: BeepPayParams): Promise<BeepPayResponse> {
  const res = await fetch(`${API_BASE}/beep/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Beep pay failed (${res.status}): ${text}`);
  }

  return res.json();
}

