"use client";

import { useState } from "react";
import { useFlowStore } from "@/stores/flow-store";
import { cn } from "@/lib/utils";
import { CodeSnippets } from "../code-snippets";
import { APIInspector } from "../api-inspector";
import { ReferenceKeyLookup } from "../reference-key-lookup";
import { StepDetail } from "../step-detail";
import { Card, CardContent } from "@/components/ui/card";

// Helper component for copiable values
function CopyableValue({ value, displayValue, className }: { value: string; displayValue?: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            onClick={handleCopy}
            className={cn(
                "group flex items-center gap-1.5 font-mono transition-colors hover:text-primary cursor-pointer",
                className
            )}
            title={`Click to copy: ${value}`}
        >
            <span className="truncate max-w-[120px]">{displayValue || value}</span>
            {copied ? (
                <svg className="w-3 h-3 text-neon-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )}
        </button>
    );
}

export function ResultsPanel() {
    const { receipt, challenge, debugLogs, apiCalls, currentStep } = useFlowStore();

    // Get recent logs (last 10)
    const recentLogs = debugLogs.slice(-10).reverse();

    return (
        <div className="h-full flex flex-col bg-muted/20 border-l border-border">
            {/* Header */}
            <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0">
                <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2 text-foreground">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Status
                </h2>
            </div>

            {/* Status Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                {/* Payment Status Card */}
                {receipt ? (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Payment Complete</p>
                                    <p className="text-xs text-primary/80">Verified by Beep</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1.5 border-b border-primary/10">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-mono text-neon-green">{receipt.amount} {receipt.asset}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-primary/10">
                                    <span className="text-muted-foreground">Reference</span>
                                    <CopyableValue
                                        value={receipt.requestNonce || ""}
                                        displayValue={`${receipt.requestNonce?.slice(0, 12)}...`}
                                        className="text-primary"
                                    />
                                </div>
                                <div className="flex justify-between items-center py-1.5 border-b border-primary/10">
                                    <span className="text-muted-foreground">Recipient</span>
                                    <CopyableValue
                                        value={receipt.merchant || ""}
                                        displayValue={`${receipt.merchant?.slice(0, 8)}...${receipt.merchant?.slice(-6)}`}
                                    />
                                </div>
                                <div className="flex justify-between py-1.5">
                                    <span className="text-muted-foreground">Network</span>
                                    <span className="font-mono text-accent">{receipt.chain}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : challenge ? (
                    <Card className="bg-accent/5 border-accent/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/20">
                                    <svg className="w-5 h-5 text-accent animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Awaiting Payment</p>
                                    <p className="text-xs text-accent/80">Scan QR or connect wallet</p>
                                </div>
                            </div>

                            {/* Challenge Details */}
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1.5 border-b border-accent/10">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-mono text-neon-green">{challenge.amount} {challenge.asset}</span>
                                </div>
                                <div className="flex justify-between py-1.5">
                                    <span className="text-muted-foreground">Network</span>
                                    <span className="font-mono text-accent">{challenge.chain}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-muted/10 border-dashed">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-foreground">No payment yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Configure and start a payment to see results here
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Step-by-Step Data - Show during simulation or live payment */}
                {currentStep >= 0 && (
                    <div className="mt-6">
                        <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 px-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Step Data
                        </h3>
                        <StepDetail />
                    </div>
                )}

                {/* Code Snippets - Show after payment */}
                {receipt && (
                    <div className="mt-6">
                        <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 px-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="mt-6">
                        <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 px-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            API Responses
                        </h3>
                        <APIInspector calls={apiCalls} />
                    </div>
                )}

                {/* Debug Logs */}
                <div className="mt-6">
                    <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 px-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Activity Log
                    </h3>
                    <div className="bg-card rounded-lg border border-border p-3 max-h-48 overflow-y-auto font-mono text-xs shadow-inner bg-muted/20">
                        {recentLogs.length > 0 ? (
                            <div className="space-y-2">
                                {recentLogs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <span className={cn(
                                            "flex-shrink-0 mt-0.5",
                                            log.type === "success" && "text-neon-green",
                                            log.type === "error" && "text-destructive",
                                            log.type === "warning" && "text-neon-yellow",
                                            log.type === "info" && "text-accent"
                                        )}>
                                            {log.type === "success" && "✓"}
                                            {log.type === "error" && "✗"}
                                            {log.type === "warning" && "!"}
                                            {log.type === "info" && "ℹ"}
                                        </span>
                                        <span className={cn(
                                            "leading-relaxed break-all",
                                            log.type === "error" ? "text-destructive" : "text-muted-foreground"
                                        )}>
                                            {log.message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground/50 text-center py-4 italic">
                                No activity yet
                            </p>
                        )}
                    </div>
                </div>

                {/* Reference Key Lookup - Developer Tool */}
                <div className="mt-6">
                    <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 px-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Developer Tools
                    </h3>
                    <ReferenceKeyLookup />
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border bg-card/20">
                <p className="text-[10px] text-muted-foreground/60 text-center">
                    Powered by Beep 🐝 • Sui Network ◆
                </p>
            </div>
        </div>
    );
}

