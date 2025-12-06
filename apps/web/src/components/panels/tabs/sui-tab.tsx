"use client";

import { useEffect, useState } from "react";
import { useFlowStore } from "@/stores/flow-store";
import { cn } from "@/lib/utils";
import {
  getTransaction,
  getExplorerUrl,
  formatGas,
  type SuiTransactionDetails,
} from "@/lib/sui-client";

type LookupStatus = "idle" | "loading" | "success" | "error" | "mock";

export function SuiTab() {
  const { receipt } = useFlowStore();
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const [txDetails, setTxDetails] = useState<SuiTransactionDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMock = receipt
    ? receipt.txHash.includes("MOCK") || receipt.txHash.length < 60
    : false;

  // Fetch transaction details when receipt changes
  useEffect(() => {
    if (!receipt) {
      setLookupStatus("idle");
      setTxDetails(null);
      setErrorMessage(null);
      return;
    }

    if (isMock) {
      setLookupStatus("mock");
      setTxDetails(null);
      setErrorMessage(null);
      return;
    }

    // Lookup real transaction
    const fetchTransaction = async () => {
      setLookupStatus("loading");
      setErrorMessage(null);

      const result = await getTransaction(receipt.txHash, receipt.chain);

      if (result.found && result.transaction) {
        setTxDetails(result.transaction);
        setLookupStatus("success");
      } else {
        setErrorMessage(result.error || "Transaction not found");
        setLookupStatus("error");
      }
    };

    fetchTransaction();
  }, [receipt, isMock]);

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

  const explorerUrl = getExplorerUrl(receipt.txHash, receipt.chain);

  return (
    <div className="space-y-6">
      {/* Transaction Status Card */}
      <div className="bg-gradient-to-br from-blue-500/10 to-neon-cyan/10 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              lookupStatus === "loading" ? "bg-blue-500/20" :
              lookupStatus === "success" ? "bg-neon-green/20" :
              lookupStatus === "error" ? "bg-red-500/20" :
              "bg-neon-yellow/20"
            )}>
              {lookupStatus === "loading" ? (
                <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : lookupStatus === "success" ? (
                <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : lookupStatus === "error" ? (
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-neon-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-white">
                {lookupStatus === "loading" ? "Looking up transaction..." :
                 lookupStatus === "success" ? "Transaction Verified" :
                 lookupStatus === "error" ? "Lookup Failed" :
                 "Transaction Settled"}
              </div>
              <div className="text-xs text-muted-foreground">
                {txDetails?.timestamp
                  ? new Date(txDetails.timestamp).toLocaleString()
                  : new Date(receipt.issuedAt * 1000).toLocaleString()}
              </div>
            </div>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            lookupStatus === "success"
              ? txDetails?.status === "success"
                ? "bg-neon-green/20 text-neon-green"
                : "bg-red-500/20 text-red-400"
              : lookupStatus === "error"
              ? "bg-red-500/20 text-red-400"
              : "bg-neon-yellow/20 text-neon-yellow"
          )}>
            {lookupStatus === "success"
              ? txDetails?.status === "success"
                ? "Confirmed"
                : "Failed"
              : lookupStatus === "error"
              ? "Not Found"
              : "Simulated"}
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

        {/* On-chain stats (only when verified) */}
        {lookupStatus === "success" && txDetails && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Gas Used</div>
              <div className="text-sm font-mono text-white">
                {formatGas(txDetails.gasUsed.total)} SUI
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Checkpoint</div>
              <div className="text-sm font-mono text-white">
                {txDetails.checkpoint || "—"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Events</div>
              <div className="text-sm font-mono text-white">
                {txDetails.events}
              </div>
            </div>
          </div>
        )}
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
                  {txDetails?.sender || receipt.payer}
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
                  {txDetails?.timestamp
                    ? new Date(txDetails.timestamp).toISOString()
                    : new Date(receipt.issuedAt * 1000).toISOString()}
                </td>
              </tr>
              {/* Show gas details for verified transactions */}
              {lookupStatus === "success" && txDetails && (
                <>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                        gas_used
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white">
                      {formatGas(txDetails.gasUsed.total)} SUI
                      <span className="text-muted-foreground ml-2">
                        (compute: {formatGas(txDetails.gasUsed.computationCost)}, storage: {formatGas(txDetails.gasUsed.storageCost)})
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        status
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        txDetails.status === "success"
                          ? "bg-neon-green/20 text-neon-green"
                          : "bg-red-500/20 text-red-400"
                      )}>
                        {txDetails.status === "success" ? "Success" : "Failed"}
                      </span>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Changes (for verified transactions) */}
      {lookupStatus === "success" && txDetails && txDetails.balanceChanges.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-neon-cyan uppercase tracking-wide mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Balance Changes
          </h3>
          <div className="bg-black rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Owner</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Asset</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txDetails.balanceChanges.map((change, idx) => {
                  const isPositive = !change.amount.startsWith("-");
                  const displayAmount = isPositive ? `+${change.amount}` : change.amount;
                  const coinName = change.coinType.split("::").pop() || change.coinType;
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-white truncate max-w-[200px]">
                        {change.owner.slice(0, 8)}...{change.owner.slice(-6)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {coinName}
                      </td>
                      <td className={cn(
                        "px-4 py-3 font-mono text-xs text-right",
                        isPositive ? "text-neon-green" : "text-red-400"
                      )}>
                        {displayAmount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
          View on SuiScan
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

      {/* Info Note for Mock Transactions */}
      {isMock && (
        <div className="bg-neon-yellow/5 rounded-lg border border-neon-yellow/20 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-neon-yellow flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-neon-yellow">Simulated Transaction</p>
            <p className="text-xs text-muted-foreground mt-1">
              This is a mock transaction for testing. Connect your wallet and enable real Beep payments
              to see actual on-chain settlements with verified transaction data.
            </p>
          </div>
        </div>
      )}

      {/* Error Note */}
      {lookupStatus === "error" && errorMessage && (
        <div className="bg-red-500/5 rounded-lg border border-red-500/20 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-400">Transaction Lookup Failed</p>
            <p className="text-xs text-muted-foreground mt-1">
              {errorMessage}. The transaction may not exist on chain yet, or the digest may be invalid.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
