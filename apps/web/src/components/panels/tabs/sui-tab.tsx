"use client";

import { useFlowStore } from "@/stores/flow-store";
import { cn } from "@/lib/utils";

export function SuiTab() {
  const { receipt, challenge } = useFlowStore();

  if (!receipt) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-sm">
          {/* Chain Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-neon-cyan/20 border border-blue-500/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-neon-cyan rounded-full flex items-center justify-center">
              <span className="text-black text-xs font-bold">Sui</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">
            On-Chain Transaction
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Complete a payment to see the Sui blockchain transaction details.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-blue-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Make a payment first
          </div>
        </div>
      </div>
    );
  }

  const explorerUrl =
    receipt.chain === "sui-mainnet"
      ? `https://suiexplorer.com/txblock/${receipt.txHash}`
      : `https://suiexplorer.com/txblock/${receipt.txHash}?network=testnet`;

  const isMock = receipt.txHash.includes("MOCK") || receipt.txHash.length < 60;

  return (
    <div className="space-y-6">
      {/* Transaction Status Card */}
      <div className="bg-gradient-to-br from-blue-500/10 to-neon-cyan/10 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-white">Transaction Settled</div>
              <div className="text-xs text-muted-foreground">
                {new Date(receipt.issuedAt * 1000).toLocaleString()}
              </div>
            </div>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            isMock
              ? "bg-neon-yellow/20 text-neon-yellow"
              : "bg-neon-green/20 text-neon-green"
          )}>
            {isMock ? "Simulated" : "Confirmed"}
          </div>
        </div>

        {/* Amount */}
        <div className="text-center py-4 border-y border-border/50">
          <div className="text-3xl font-bold text-neon-green">
            {receipt.amount} <span className="text-lg text-neon-green/70">{receipt.asset}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            on {receipt.chain}
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div>
        <h3 className="text-xs font-semibold text-neon-yellow uppercase tracking-wide mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Transaction Details
        </h3>
        <div className="bg-black rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-muted-foreground w-28">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    tx_hash
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-neon-cyan break-all">
                  {receipt.txHash}
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    from
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-white break-all">
                  {receipt.payer}
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    to
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-white break-all">
                  {receipt.merchant}
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    amount
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-neon-green font-medium">
                  {receipt.amount} {receipt.asset}
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    timestamp
                  </div>
                </td>
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
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm font-medium text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all group"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          View on Sui Explorer
          <svg
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
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
      {isMock && (
        <div className="bg-neon-yellow/5 rounded-lg border border-neon-yellow/20 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-neon-yellow flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-neon-yellow">Simulated Transaction</p>
            <p className="text-xs text-muted-foreground mt-1">
              This is a mock transaction for testing. Connect your wallet and enable real Beep payments
              to see actual on-chain settlements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
