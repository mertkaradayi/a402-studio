"use client";

import { useFlowStore } from "@/stores/flow-store";

export function ReceiptTab() {
  const { challenge, receipt, rawReceipt, setReceipt, addDebugLog, isLoading, setLoading } =
    useFlowStore();

  const handleSimulatePayment = async () => {
    if (!challenge) return;

    setLoading(true);
    addDebugLog("info", "Simulating Beep payment...");

    // Simulate payment delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockReceipt = {
      id: `rcpt_${Date.now()}`,
      requestNonce: challenge.nonce,
      payer: "0x9a8b7c6d5e4f3210fedcba9876543210abcdef12",
      merchant: challenge.recipient,
      amount: challenge.amount,
      asset: challenge.asset,
      chain: challenge.chain,
      txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      signature: `0xsig_${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      issuedAt: Math.floor(Date.now() / 1000),
    };

    const mockRawReceipt = JSON.stringify(mockReceipt, null, 2);

    addDebugLog("info", `Payment successful! Receipt ID: ${mockReceipt.id}`);
    setReceipt(mockReceipt, mockRawReceipt);
    setLoading(false);
  };

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4 opacity-20">$</div>
          <p className="text-muted-foreground text-sm">
            No challenge to pay yet.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Request a 402 challenge first.
          </p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-neon-green mb-2">
            {challenge.amount} {challenge.asset}
          </div>
          <p className="text-muted-foreground text-sm">
            Ready to pay on {challenge.chain}
          </p>
        </div>
        <button
          onClick={handleSimulatePayment}
          disabled={isLoading}
          className="px-8 py-3 bg-neon-green text-black font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed glow-green"
        >
          {isLoading ? "Processing..." : "Simulate Beep Payment"}
        </button>
        <p className="text-xs text-muted-foreground max-w-sm text-center">
          This simulates a Beep payment on Sui testnet. Real integration coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Raw Receipt */}
      <div>
        <h3 className="text-xs font-semibold text-neon-yellow uppercase tracking-wide mb-3">
          Raw Receipt
        </h3>
        <div className="bg-black rounded-lg border border-border overflow-hidden">
          <pre className="p-4 text-xs font-mono text-muted-foreground overflow-auto max-h-48">
            {rawReceipt}
          </pre>
        </div>
      </div>

      {/* Decoded Fields Table */}
      <div>
        <h3 className="text-xs font-semibold text-neon-yellow uppercase tracking-wide mb-3">
          Decoded Fields
        </h3>
        <div className="bg-black rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2 text-muted-foreground">payer</td>
                <td className="px-4 py-2 font-mono text-xs text-white break-all">
                  {receipt.payer}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-muted-foreground">recipient</td>
                <td className="px-4 py-2 font-mono text-xs text-white break-all">
                  {receipt.merchant}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-muted-foreground">amount</td>
                <td className="px-4 py-2 font-mono text-neon-green">
                  {receipt.amount} {receipt.asset}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-muted-foreground">chain</td>
                <td className="px-4 py-2 font-mono text-xs text-white">
                  {receipt.chain}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-muted-foreground">nonce</td>
                <td className="px-4 py-2 font-mono text-xs text-white break-all">
                  {receipt.requestNonce}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-muted-foreground">signature</td>
                <td className="px-4 py-2 font-mono text-xs text-neon-cyan break-all">
                  {receipt.signature}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
