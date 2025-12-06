"use client";

import { useState } from "react";
import { useFlowStore, type A402Receipt } from "@/stores/flow-store";

const CODE_SNIPPET = `// Express middleware for verifying a402 receipts
import { verifyReceipt } from '@beep-it/sdk-core';

async function a402Middleware(req, res, next) {
  const receiptHeader = req.headers['x-a402-receipt'];

  // If no receipt, return 402 with payment requirements
  if (!receiptHeader) {
    return res.status(402).json({
      amount: '0.50',
      asset: 'USDC',
      chain: 'sui-testnet',
      recipient: process.env.MERCHANT_VAULT,
      nonce: crypto.randomUUID(),
      expiry: Math.floor(Date.now() / 1000) + 300,
    });
  }

  // Verify the receipt
  try {
    const receipt = JSON.parse(receiptHeader);
    const isValid = await verifyReceipt(receipt, {
      expectedAmount: '0.50',
      expectedRecipient: process.env.MERCHANT_VAULT,
    });

    if (!isValid) {
      return res.status(422).json({
        error: 'Invalid receipt'
      });
    }

    // Receipt is valid, proceed
    next();
  } catch (err) {
    return res.status(422).json({
      error: 'Invalid receipt format'
    });
  }
}

// Usage
app.get('/protected', a402Middleware, (req, res) => {
  res.json({ data: 'Protected resource!' });
});`;

export function RightPanel() {
  const [copied, setCopied] = useState(false);
  const [pastedReceipt, setPastedReceipt] = useState("");
  const [inspectedReceipt, setInspectedReceipt] = useState<A402Receipt | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const { addDebugLog } = useFlowStore();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInspect = () => {
    if (!pastedReceipt.trim()) {
      setParseError("Please paste a receipt first");
      return;
    }

    try {
      const parsed = JSON.parse(pastedReceipt);

      const requiredFields = ["payer", "merchant", "amount", "txHash"];
      const missing = requiredFields.filter((f) => !(f in parsed));

      if (missing.length > 0) {
        setParseError(`Missing fields: ${missing.join(", ")}`);
        addDebugLog("error", `Paste inspector: Missing fields - ${missing.join(", ")}`);
        return;
      }

      const receipt: A402Receipt = {
        id: parsed.id || parsed.receipt_id || "unknown",
        requestNonce: parsed.requestNonce || parsed.request_nonce || "",
        payer: parsed.payer,
        merchant: parsed.merchant || parsed.recipient,
        amount: parsed.amount,
        asset: parsed.asset || "USDC",
        chain: parsed.chain || "sui-testnet",
        txHash: parsed.txHash || parsed.tx_hash,
        signature: parsed.signature || "",
        issuedAt: parsed.issuedAt || parsed.issued_at || Math.floor(Date.now() / 1000),
      };

      setInspectedReceipt(receipt);
      setParseError(null);
      addDebugLog("info", `Paste inspector: Parsed receipt ${receipt.id}`);
    } catch {
      setParseError("Invalid JSON format");
      addDebugLog("error", "Paste inspector: Invalid JSON");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Code Snippets - Top */}
      <div className="flex-1 border-b border-border overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xs font-semibold text-neon-pink uppercase tracking-wide">
            Code Snippets
          </h2>
          <span className="text-xs text-muted-foreground">Node/TS</span>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="relative">
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-2 py-1 text-xs bg-card border border-border rounded hover:border-neon-pink transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <pre className="p-4 text-xs font-mono text-muted-foreground overflow-auto">
              <code>{CODE_SNIPPET}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Paste Inspector - Bottom */}
      <div className="h-80 flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-xs font-semibold text-neon-yellow uppercase tracking-wide">
            Paste-in Receipt Inspector
          </h2>
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-auto">
          <textarea
            value={pastedReceipt}
            onChange={(e) => {
              setPastedReceipt(e.target.value);
              setParseError(null);
              setInspectedReceipt(null);
            }}
            placeholder='{"payer": "0x...", "merchant": "0x...", ...}'
            className="w-full h-24 px-3 py-2 bg-input border border-border rounded-md text-xs font-mono text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-yellow focus:border-neon-yellow resize-none"
          />

          {parseError && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
              {parseError}
            </div>
          )}

          <button
            onClick={handleInspect}
            className="w-full px-3 py-2 bg-neon-yellow text-black text-sm font-semibold rounded-md hover:opacity-90 transition-opacity"
          >
            Inspect & Verify
          </button>

          {inspectedReceipt && (
            <div className="bg-black rounded border border-border overflow-hidden">
              <div className="divide-y divide-border text-xs">
                <div className="flex justify-between px-3 py-2">
                  <span className="text-muted-foreground">payer</span>
                  <span className="font-mono text-white truncate max-w-[180px]">
                    {inspectedReceipt.payer}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-muted-foreground">amount</span>
                  <span className="font-mono text-neon-green">
                    {inspectedReceipt.amount} {inspectedReceipt.asset}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2">
                  <span className="text-muted-foreground">tx_hash</span>
                  <span className="font-mono text-neon-cyan truncate max-w-[180px]">
                    {inspectedReceipt.txHash}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
