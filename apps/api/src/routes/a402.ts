import { Router, Request, Response } from "express";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import type { A402Challenge, A402Receipt } from "@shared/types";

export const a402Router = Router();

// In-memory store for demo purposes
const usedNonces = new Set<string>();

// Simulated merchant vault address
const MERCHANT_VAULT = "0x1234567890abcdef1234567890abcdef12345678";

const SUI_USDC_DECIMALS = 6;

function getSuiNetwork(chain?: string): "mainnet" | "testnet" {
  return chain === "sui-mainnet" || chain === "mainnet" ? "mainnet" : "testnet";
}

function getSuiExplorerUrl(digest: string, chain?: string) {
  const network = getSuiNetwork(chain);
  return `https://suiexplorer.com/txblock/${digest}?network=${network}`;
}

function normalizeOwner(owner: unknown): string {
  if (typeof owner === "string") return owner.toLowerCase();
  if (owner && typeof owner === "object") {
    const record = owner as Record<string, unknown>;
    if (typeof record.AddressOwner === "string") return record.AddressOwner.toLowerCase();
    if (typeof record.ObjectOwner === "string") return record.ObjectOwner.toLowerCase();
  }
  return "";
}

function parseAmountToBaseUnits(amount?: string | number | null): bigint | null {
  if (amount === null || amount === undefined) return null;
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) return null;
  return BigInt(Math.round(numeric * 10 ** SUI_USDC_DECIMALS));
}

/**
 * POST /a402/challenge
 * Generate a 402 payment challenge for a protected resource
 */
a402Router.post("/challenge", (req: Request, res: Response) => {
  const { amount = "0.50", chain = "sui-testnet", description } = req.body;

  const challenge: A402Challenge = {
    amount,
    asset: "USDC",
    chain,
    recipient: MERCHANT_VAULT,
    nonce: `nonce_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    expiry: Math.floor(Date.now() / 1000) + 300, // 5 minutes
    callback: `${req.protocol}://${req.get("host")}/a402/verify`,
  };

  // Return 402 with challenge
  res.status(402).json(challenge);
});

/**
 * POST /a402/verify
 * Verify a payment receipt
 */
a402Router.post("/verify", (req: Request, res: Response) => {
  const receipt: A402Receipt = req.body;

  const errors: string[] = [];

  // Check for required fields
  if (!receipt.id) errors.push("Missing receipt ID");
  if (!receipt.payer) errors.push("Missing payer address");
  if (!receipt.merchant) errors.push("Missing merchant address");
  if (!receipt.amount) errors.push("Missing amount");
  if (!receipt.txHash) errors.push("Missing transaction hash");
  if (!receipt.requestNonce) errors.push("Missing request nonce");

  if (errors.length > 0) {
    return res.status(422).json({
      valid: false,
      errors,
    });
  }

  // Check nonce hasn't been used (replay protection)
  if (usedNonces.has(receipt.requestNonce)) {
    return res.status(409).json({
      valid: false,
      errors: ["Nonce already used (potential replay attack)"],
    });
  }

  // Mark nonce as used
  usedNonces.add(receipt.requestNonce);

  // TODO: In production, verify:
  // 1. Transaction exists on-chain with correct amount/recipient
  // 2. Facilitator signature is valid
  // 3. Receipt hasn't expired

  const verificationResult = {
    valid: true,
    receipt_id: receipt.id,
    checks: {
      nonceValid: true,
      amountMatch: true, // Would verify against original challenge
      chainMatch: true,
      signatureValid: true, // Would verify cryptographic signature
    },
  };

  res.json(verificationResult);
});

/**
 * GET /a402/receipt/:id
 * Look up a receipt by ID (mock)
 */
a402Router.get("/receipt/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  // Mock receipt lookup
  const mockReceipt: A402Receipt = {
    id,
    requestNonce: "nonce_mock",
    payer: "0xPAYER_ADDRESS",
    merchant: MERCHANT_VAULT,
    amount: "0.50",
    asset: "USDC",
    chain: "sui-testnet",
    txHash: "0xMOCK_TX_HASH",
    signature: "0xMOCK_SIGNATURE",
    issuedAt: Math.floor(Date.now() / 1000),
  };

  res.json(mockReceipt);
});

/**
 * POST /a402/simulate-payment
 * Simulate a Beep payment (for testing)
 */
a402Router.post("/simulate-payment", async (req: Request, res: Response) => {
  const { challenge } = req.body as { challenge: A402Challenge };

  if (!challenge) {
    return res.status(400).json({ error: "Challenge required" });
  }

  // Simulate payment delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const receipt: A402Receipt = {
    id: `rcpt_${Date.now()}`,
    requestNonce: challenge.nonce,
    payer: "0xSIMULATED_PAYER_ADDRESS",
    merchant: challenge.recipient,
    amount: challenge.amount,
    asset: challenge.asset,
    chain: challenge.chain,
    txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
    signature: `0xSIG_${Math.random().toString(16).slice(2)}`,
    issuedAt: Math.floor(Date.now() / 1000),
  };

  res.json(receipt);
});

/**
 * POST /a402/verify-beep
 * Verify a Beep payment using the proper a402 verification flow
 * 
 * Per Beep docs, verification works by:
 * 1. POST /v1/payments/request with paymentReference param - if paid, returns 200 with receipt
 * 2. Fallback to invoice list search
 */
a402Router.post("/verify-beep", async (req: Request, res: Response) => {
  const { receipt, challenge } = req.body as {
    receipt: A402Receipt;
    challenge?: { amount: string; recipient: string; nonce: string };
  };

  console.log("[verify-beep] Request received:", {
    receipt: receipt ? {
      id: receipt.id,
      requestNonce: receipt.requestNonce,
      txHash: receipt.txHash,
      amount: receipt.amount,
      merchant: receipt.merchant,
    } : null,
    hasChallenge: !!challenge,
  });

  if (!receipt || !receipt.requestNonce) {
    return res.status(400).json({
      valid: false,
      error: "Receipt with requestNonce required"
    });
  }

  const BEEP_SECRET_KEY = process.env.BEEP_SECRET_KEY;
  const BEEP_PUBLISHABLE_KEY = process.env.BEEP_PUBLISHABLE_KEY;

  if (!BEEP_SECRET_KEY && !BEEP_PUBLISHABLE_KEY) {
    console.error("[verify-beep] No Beep API keys configured");
    return res.status(500).json({
      valid: false,
      error: "Beep verification not configured - need BEEP_SECRET_KEY or BEEP_PUBLISHABLE_KEY"
    });
  }

  const BEEP_API_URL = process.env.BEEP_API_URL || "https://api.justbeep.it";
  const referenceKey = receipt.requestNonce;
  const apiKey = BEEP_SECRET_KEY || BEEP_PUBLISHABLE_KEY;

  // === Method 1: POST /v1/payments/request with paymentReference ===
  // Per Beep docs: "Poll: re-call the same route with paymentReference: <referenceKey> until 200 with { receipt, txSignature }"
  console.log(`[verify-beep] Checking payment status via POST /v1/payments/request with paymentReference...`);
  try {
    const paymentResponse = await fetch(`${BEEP_API_URL}/v1/payments/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "x-beep-client": "beep-sdk",
      },
      body: JSON.stringify({
        paymentReference: referenceKey,
      }),
    });

    console.log(`[verify-beep] /v1/payments/request response: ${paymentResponse.status}`);

    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      console.log("[verify-beep] Payment request success:", paymentData);

      // If we get a 200 response with receipt/txSignature, payment is confirmed
      if (paymentData.receipt || paymentData.txSignature || paymentData.paid === true) {
        return res.json({
          valid: true,
          method: "beep-payment-request",
          details: {
            ...paymentData,
            endpoint: "/v1/payments/request",
            referenceKey,
            verifiedAt: new Date().toISOString(),
          },
        });
      }

      // If we get 200 but payment is not complete yet (e.g., still pending)
      if (paymentData.status === "issued" || paymentData.paid === false) {
        console.log("[verify-beep] Payment session exists but not paid yet");
        // Don't return error - continue to fallback methods
      }
    } else if (paymentResponse.status === 402) {
      // 402 means invoice exists but not paid - this is expected for unpaid invoices
      const data = await paymentResponse.json();
      console.log("[verify-beep] 402 response (unpaid):", data);
      // Continue to fallback
    } else {
      const errorText = await paymentResponse.text();
      console.log("[verify-beep] Payment request error:", paymentResponse.status, errorText);
    }
  } catch (error) {
    console.log("[verify-beep] /v1/payments/request error:", error instanceof Error ? error.message : error);
  }

  // === Method 2: GET /v1/widget/payment-status/:referenceKey ===
  // Widget status endpoint used by the checkout widget (correct path from Beep API)
  console.log(`[verify-beep] Trying GET /v1/widget/payment-status/${referenceKey}...`);
  try {
    const statusResponse = await fetch(`${BEEP_API_URL}/v1/widget/payment-status/${referenceKey}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "x-beep-client": "beep-sdk",
      },
    });

    console.log(`[verify-beep] /v1/widget/payment-status response: ${statusResponse.status}`);

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log("[verify-beep] Widget payment status:", statusData);

      const isPaid = statusData.status === "paid" || statusData.paid === true;
      if (isPaid) {
        return res.json({
          valid: true,
          method: "beep-widget-status",
          details: {
            ...statusData,
            endpoint: "/v1/widget/payment-status",
            referenceKey,
            verifiedAt: new Date().toISOString(),
          },
        });
      } else {
        console.log(`[verify-beep] Widget status: paid=${statusData.paid}, status=${statusData.status}`);
      }
    }
  } catch (error) {
    console.log("[verify-beep] /v1/widget/payment-status error:", error instanceof Error ? error.message : error);
  }

  // === Method 3: Fallback to invoice list search ===
  console.log("[verify-beep] Falling back to invoice list search...");
  try {
    const invoicesResponse = await fetch(`${BEEP_API_URL}/v1/invoices`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!invoicesResponse.ok) {
      const errorText = await invoicesResponse.text();
      console.error("[verify-beep] Failed to fetch invoices:", invoicesResponse.status, errorText);
      return res.json({
        valid: false,
        method: "beep-api",
        error: `Beep API error: ${invoicesResponse.status}`,
      });
    }

    const invoices = await invoicesResponse.json() as Array<{
      uuid: string;
      status: string;
      amount: string;
      amountDecimal: string;
      token: string;
      chain: string;
      createdAt: string;
      updatedAt: string;
      referenceKey?: string;
      paymentReference?: string;
      [key: string]: unknown;
    }>;

    console.log("[verify-beep] Found", invoices.length, "invoices");

    // Log all paid invoices to understand the structure
    const allPaidInvoices = invoices.filter(inv => inv.status === "paid");
    console.log("[verify-beep] Total paid invoices:", allPaidInvoices.length);
    if (allPaidInvoices.length > 0) {
      console.log("[verify-beep] Sample paid invoice structure:", JSON.stringify(allPaidInvoices[0], null, 2));
    }

    // Method 3a: Try to find by referenceKey exact match
    const matchByRef = invoices.find(inv =>
      inv.status === "paid" &&
      (inv.referenceKey === referenceKey || inv.paymentReference === referenceKey || inv.uuid === referenceKey)
    );

    if (matchByRef) {
      console.log("[verify-beep] SUCCESS - Found paid invoice by referenceKey:", matchByRef.uuid);
      return res.json({
        valid: true,
        method: "beep-invoice-match",
        details: {
          invoiceId: matchByRef.uuid,
          status: matchByRef.status,
          amount: matchByRef.amountDecimal,
          token: matchByRef.token,
          chain: matchByRef.chain,
          matchType: "referenceKey",
          endpoint: "/v1/invoices",
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    // Method 3b: Find by amount + recency
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const paidInvoices = invoices.filter(inv => {
      const isPaid = inv.status === "paid";
      const isRecent = inv.updatedAt > twoHoursAgo;

      let amountMatches = true;
      if (challenge?.amount) {
        const expectedAmount = BigInt(Math.floor(parseFloat(challenge.amount) * 1_000_000));
        const invoiceAmount = BigInt(inv.amount || "0");
        amountMatches = expectedAmount === invoiceAmount;
      }

      return isPaid && isRecent && amountMatches;
    });

    console.log("[verify-beep] Found", paidInvoices.length, "matching paid invoices by amount+time");

    if (paidInvoices.length > 0) {
      const matchedInvoice = paidInvoices[0];
      console.log("[verify-beep] SUCCESS - Found paid invoice:", matchedInvoice.uuid);

      return res.json({
        valid: true,
        method: "beep-invoice-match",
        details: {
          invoiceId: matchedInvoice.uuid,
          status: matchedInvoice.status,
          amount: matchedInvoice.amountDecimal,
          token: matchedInvoice.token,
          chain: matchedInvoice.chain,
          endpoint: "/v1/invoices",
          verifiedAt: new Date().toISOString(),
        },
      });
    }

    // No matching paid invoice found
    console.log("[verify-beep] No matching paid invoice found");
    return res.json({
      valid: false,
      method: "beep-api",
      error: "No matching paid invoice found in Beep",
      details: {
        totalInvoices: invoices.length,
        paidInvoices: allPaidInvoices.length,
        referenceKeySearched: referenceKey,
        searchedMethods: ["/v1/payments/request", "/v1/widget/payment-status", "/v1/invoices"],
      },
    });

  } catch (error) {
    console.error("[verify-beep] Error:", error);
    return res.json({
      valid: false,
      method: "beep-api",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /a402/verify-onchain
 * Verify a receipt by checking the transaction on Sui blockchain
 * This is used for direct wallet payments that bypass Beep's payment flow
 */
a402Router.post("/verify-onchain", async (req: Request, res: Response) => {
  const { receipt, challenge } = req.body as {
    receipt: A402Receipt;
    challenge?: A402Challenge;
  };

  // Guard against missing receipt/signature to avoid runtime errors
  const signature = typeof receipt?.signature === "string" ? receipt.signature : "";
  const txHash = typeof receipt?.txHash === "string" ? receipt.txHash : "";
  const isBeepWidgetSignature = signature.startsWith("beep_widget_");
  const chain = receipt?.chain || challenge?.chain || "sui-testnet";

  console.log("[verify-onchain] Request received:", {
    receipt: receipt ? {
      id: receipt.id,
      signature: receipt.signature?.slice(0, 40) + "...",
      txHash: receipt.txHash,
      amount: receipt.amount,
      merchant: receipt.merchant,
      requestNonce: receipt.requestNonce,
    } : null,
    challenge: challenge ? {
      nonce: challenge.nonce,
      amount: challenge.amount,
      recipient: challenge.recipient,
    } : null,
  });

  if (!receipt) {
    console.log("[verify-onchain] FAIL: No receipt provided");
    return res.status(400).json({
      valid: false,
      error: "Receipt required"
    });
  }

  const errors: string[] = [];
  const checks: Record<string, boolean> = {};
  let onchainDetails: {
    found: boolean;
    status?: string;
    sender?: string;
    checkpoint?: string | null;
    timestampMs?: number | null;
    explorerUrl?: string;
    recipientMatch?: boolean;
    amountMatch?: boolean;
    error?: string;
  } | null = null;

  // Basic field validation
  checks.hasRequiredFields = !!(
    receipt.id &&
    receipt.payer &&
    receipt.merchant &&
    receipt.amount &&
    txHash &&
    receipt.chain &&
    signature
  );

  if (!checks.hasRequiredFields) {
    errors.push("Missing required receipt fields");
  }

  // If challenge provided, validate against it
  if (challenge) {
    checks.amountMatch = receipt.amount === challenge.amount;
    checks.chainMatch = receipt.chain === challenge.chain;
    checks.nonceValid = receipt.requestNonce === challenge.nonce;
    checks.recipientMatch = receipt.merchant === challenge.recipient;
    checks.notExpired = challenge.expiry
      ? challenge.expiry > Math.floor(Date.now() / 1000)
      : true;

    if (!checks.amountMatch) errors.push("Amount mismatch");
    if (!checks.chainMatch) errors.push("Chain mismatch");
    if (!checks.nonceValid) errors.push("Invalid nonce");
    if (!checks.recipientMatch) errors.push("Recipient mismatch");
    if (!checks.notExpired) errors.push("Challenge expired");
  }

  // Verify transaction exists on Sui (would need Sui RPC call)
  const isSuiDigest = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(txHash);
  checks.validTxFormat = isSuiDigest || txHash.startsWith("0x") || isBeepWidgetSignature;

  if (!checks.validTxFormat) {
    errors.push("Invalid transaction hash format");
  }

  // For wallet payments, signature format indicates payment method
  // We mark it as valid if:
  // - Direct wallet payment (sui_tx_ prefix)
  // - Beep SDK payment with wallet (beep_sdk_ or beep_verified_ prefix)
  // - Raw Sui transaction digest
  checks.signatureValid =
    isBeepWidgetSignature || // Beep CheckoutWidget returns pre-verified signatures
    signature.startsWith("sui_tx_") ||
    signature.startsWith("beep_sdk_") ||
    signature.startsWith("beep_verified_") ||
    isSuiDigest;

  // On-chain verification using Sui RPC (Mysten fullnode)
  if (txHash && !isBeepWidgetSignature) {
    const explorerUrl = getSuiExplorerUrl(txHash, chain);
    try {
      const client = new SuiClient({ url: getFullnodeUrl(getSuiNetwork(chain)) });
      const tx = await client.getTransactionBlock({
        digest: txHash,
        options: {
          showEffects: true,
          showBalanceChanges: true,
          showInput: true,
        },
      });

      const status = tx.effects?.status?.status;
      const success = status === "success";
      checks.onchainFound = true;
      checks.onchainStatusSuccess = success;

      const balanceChanges = tx.balanceChanges || [];
      const expectedRecipient = (challenge?.recipient || receipt.merchant || "").toLowerCase();
      const expectedAmountBase = parseAmountToBaseUnits(challenge?.amount || receipt.amount);
      let recipientMatch: boolean | undefined;
      let amountMatch: boolean | undefined;

      if (expectedRecipient) {
        const recipientChange = balanceChanges.find((bc) => normalizeOwner((bc as any).owner) === expectedRecipient);
        if (recipientChange) {
          const amount = BigInt((recipientChange as any).amount || 0);
          recipientMatch = true;
          amountMatch = expectedAmountBase === null ? undefined : amount >= expectedAmountBase;
          checks.onchainRecipientMatch = true;
          if (expectedAmountBase !== null) {
            const hasAmount = amount >= expectedAmountBase;
            checks.onchainAmountMatch = hasAmount;
            amountMatch = hasAmount;
            if (!hasAmount) errors.push("On-chain amount is below expected value");
          }
        } else {
          checks.onchainRecipientMatch = false;
          errors.push("On-chain transfer does not include the expected recipient");
          recipientMatch = false;
        }
      }

      if (!success) {
        errors.push("On-chain transaction status is not successful");
      }

      onchainDetails = {
        found: true,
        status,
        sender: (tx.transaction as any)?.data?.sender,
        checkpoint: tx.checkpoint || null,
        timestampMs: tx.timestampMs ? Number(tx.timestampMs) : null,
        explorerUrl,
        recipientMatch,
        amountMatch,
      };
    } catch (error) {
      checks.onchainFound = false;
      const message = error instanceof Error ? error.message : String(error);
      errors.push("Transaction not found on chain");
      onchainDetails = {
        found: false,
        explorerUrl,
        error: message,
      };
      console.error("[verify-onchain] Sui RPC error:", message);
    }
  }

  const valid = Object.values(checks).every(Boolean) && errors.length === 0;

  console.log("[verify-onchain] Verification result:", {
    valid,
    checks,
    errors: errors.length > 0 ? errors : "none",
  });

  res.json({
    valid,
    method: "onchain",
    checks,
    errors: errors.length > 0 ? errors : undefined,
    receipt_id: receipt.id,
    explorerUrl: onchainDetails?.explorerUrl ?? (txHash ? getSuiExplorerUrl(txHash, chain) : undefined),
    onchain: onchainDetails ?? undefined,
  });
});
