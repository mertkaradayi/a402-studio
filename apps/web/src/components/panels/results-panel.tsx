"use client";

import { useFlowStore } from "@/stores/flow-store";
import { cn } from "@/lib/utils";
import { CodeSnippets } from "../code-snippets";
import { APIInspector } from "../api-inspector";
import { ReferenceKeyLookup } from "../reference-key-lookup";

export function ResultsPanel() {
    const { receipt, challenge, debugLogs, apiCalls } = useFlowStore();

    // Get recent logs (last 10)
    const recentLogs = debugLogs.slice(-10).reverse();

    return (
        <div className="h-full flex flex-col bg-card/30">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Status
                </h2>
            </div>

            {/* Status Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Payment Status Card */}
                {receipt ? (
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Payment Complete</p>
                                <p className="text-xs text-purple-400">Verified by Beep</p>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-mono text-green-400">{receipt.amount} {receipt.asset}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                                <span className="text-muted-foreground">Reference</span>
                                <span className="font-mono text-purple-400 truncate max-w-[140px]" title={receipt.requestNonce}>
                                    {receipt.requestNonce?.slice(0, 12)}...
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                                <span className="text-muted-foreground">Recipient</span>
                                <span className="font-mono text-white truncate max-w-[140px]" title={receipt.merchant}>
                                    {receipt.merchant?.slice(0, 8)}...{receipt.merchant?.slice(-6)}
                                </span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-muted-foreground">Network</span>
                                <span className="font-mono text-blue-400">{receipt.chain}</span>
                            </div>
                        </div>
                    </div>
                ) : challenge ? (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Awaiting Payment</p>
                                <p className="text-xs text-blue-400">Scan QR or connect wallet</p>
                            </div>
                        </div>

                        {/* Challenge Details */}
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-border/50">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-mono text-green-400">{challenge.amount} {challenge.asset}</span>
                            </div>
                            <div className="flex justify-between py-1.5">
                                <span className="text-muted-foreground">Network</span>
                                <span className="font-mono text-blue-400">{challenge.chain}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">No payment yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Configure and start a payment to see results here
                        </p>
                    </div>
                )}

                {/* Code Snippets - Show after payment */}
                {receipt && (
                    <div className="mt-4">
                        <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Integration Code
                        </h3>
                        <CodeSnippets
                            amount={receipt.amount}
                            description="Your Product"
                            referenceKey={receipt.requestNonce}
                        />
                    </div>
                )}

                {/* API Inspector - Show when there are API calls */}
                {apiCalls.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            API Responses
                        </h3>
                        <APIInspector calls={apiCalls} />
                    </div>
                )}

                {/* Debug Logs */}
                <div className="mt-4">
                    <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Activity Log
                    </h3>
                    <div className="bg-black/50 rounded-lg border border-border p-3 max-h-48 overflow-y-auto">
                        {recentLogs.length > 0 ? (
                            <div className="space-y-1.5">
                                {recentLogs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs">
                                        <span className={cn(
                                            "flex-shrink-0",
                                            log.type === "success" && "text-green-400",
                                            log.type === "error" && "text-red-400",
                                            log.type === "warning" && "text-yellow-400",
                                            log.type === "info" && "text-blue-400"
                                        )}>
                                            {log.type === "success" && "✓"}
                                            {log.type === "error" && "✗"}
                                            {log.type === "warning" && "!"}
                                            {log.type === "info" && "•"}
                                        </span>
                                        <span className="text-muted-foreground font-mono break-all">
                                            {log.message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground/50 text-center py-4">
                                No activity yet
                            </p>
                        )}
                    </div>
                </div>

                {/* Reference Key Lookup - Developer Tool */}
                <div className="mt-4">
                    <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Developer Tools
                    </h3>
                    <ReferenceKeyLookup />
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-black/30">
                <p className="text-[10px] text-muted-foreground/50 text-center">
                    Powered by Beep 🐝 • Sui Network ◆
                </p>
            </div>
        </div>
    );
}

