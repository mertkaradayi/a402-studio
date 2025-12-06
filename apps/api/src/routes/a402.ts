import { Router, Request, Response } from "express";
import type { A402Challenge, A402Receipt } from "@shared/types";

export const a402Router = Router();

// In-memory store for demo purposes
const usedNonces = new Set<string>();

// Simulated merchant vault address
const MERCHANT_VAULT = "0x1234567890abcdef1234567890abcdef12345678";

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
