"use client";

import { useFlowStore } from "@/stores/flow-store";

export function SuiTab() {
  const { receipt } = useFlowStore();

  if (!receipt) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4 opacity-20">⛓</div>
          <p className="text-muted-foreground text-sm">No transaction yet.</p>
          <p className="text-muted-foreground text-xs mt-1">
            Complete a payment to see Sui settlement.
          </p>
        </div>
      </div>
    );
  }

  const explorerUrl =
    receipt.chain === "sui-mainnet"
      ? `https://suiexplorer.com/txblock/${receipt.txHash}`
      : `https://suiexplorer.com/txblock/${receipt.txHash}?network=testnet`;

  return (
    <div className="space-y-6">
      {/* Transaction Object */}
      <div>
        <h3 className="text-xs font-semibold text-neon-yellow uppercase tracking-wide mb-3">
          Sui Transaction
        </h3>
        <div className="bg-black rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 text-muted-foreground w-28">tx_hash</td>
                <td className="px-4 py-3 font-mono text-xs text-neon-cyan break-all">
                  {receipt.txHash}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted-foreground">from</td>
                <td className="px-4 py-3 font-mono text-xs text-white break-all">
                  {receipt.payer}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted-foreground">to</td>
                <td className="px-4 py-3 font-mono text-xs text-white break-all">
                  {receipt.merchant}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted-foreground">amount</td>
                <td className="px-4 py-3 font-mono text-neon-green">
                  {receipt.amount} {receipt.asset}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted-foreground">timestamp</td>
                <td className="px-4 py-3 font-mono text-xs text-white">
                  {new Date(receipt.issuedAt * 1000).toISOString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Explorer Link */}
      <div className="flex justify-center">
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-md text-sm font-medium text-white hover:border-neon-cyan hover:text-neon-cyan transition-colors"
        >
          Open in Sui Explorer
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      {/* Info Note */}
      <div className="bg-card/50 rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground">
          <span className="text-neon-yellow font-medium">Note:</span> In this
          demo, the transaction hash is simulated. With real Beep integration,
          this will link to an actual on-chain transaction on Sui.
        </p>
      </div>
    </div>
  );
}
