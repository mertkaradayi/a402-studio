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
      signature: `demo:${challenge.nonce}`,
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
        <div className="text-center max-w-sm">
          {/* Payment Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-yellow/20 border border-neon-green/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">
            Ready to Pay
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Load a challenge first, then you can simulate or make a real payment.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-neon-green">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Get a challenge from the left panel
          </div>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-center">
          {/* Payment Amount Card */}
          <div className="bg-gradient-to-br from-neon-green/10 to-neon-yellow/10 border border-neon-green/30 rounded-2xl p-6 mb-4">
            <div className="text-xs text-muted-foreground mb-1">Amount to Pay</div>
            <div className="text-3xl font-bold text-neon-green">
              {challenge.amount} <span className="text-lg text-neon-green/70">{challenge.asset}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-neon-yellow rounded-full animate-pulse" />
              on {challenge.chain}
            </div>
          </div>
        </div>
        <button
          onClick={handleSimulatePayment}
          disabled={isLoading}
          className="px-8 py-3 bg-neon-green text-black font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-green flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Simulate Beep Payment
            </>
          )}
        </button>
        <p className="text-xs text-muted-foreground max-w-sm text-center">
          This simulates a Beep payment. Connect your wallet for real payments.
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
