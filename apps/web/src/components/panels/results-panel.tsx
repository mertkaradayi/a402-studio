"use client";

import { useEffect, useState } from "react";
import { useFlowStore } from "@/stores/flow-store";
import { cn } from "@/lib/utils";
import { CodeSnippets } from "../code-snippets";
import { APIInspector } from "../api-inspector";
import { ReferenceKeyLookup } from "../reference-key-lookup";
import { StepDetail } from "../step-detail";
import { HistoryPanel } from "../history-panel";
import { CodeExport } from "../code-export";
import { WebhookPreview } from "../webhook-preview";
import { Card, CardContent } from "@/components/ui/card";
import { fetchTransaction } from "@/lib/sui-client";

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
    const { receipt, challenge, debugLogs, apiCalls, currentStep, paymentHistory } = useFlowStore();
    const [activeTab, setActiveTab] = useState<"status" | "history">("status");
    const [txData, setTxData] = useState<any | null>(null);
    const [txLoading, setTxLoading] = useState(false);
    const [txError, setTxError] = useState<string | null>(null);

    // Get recent logs (last 10)
    const recentLogs = debugLogs.slice(-10).reverse();

    // Fetch Sui transaction details when a real digest is available
    useEffect(() => {
        const digest = receipt?.txHash;
        const isSuiDigest = digest && /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(digest);
        if (!isSuiDigest) {
            setTxData(null);
            setTxError(null);
            return;
        }

        setTxLoading(true);
        setTxError(null);
        fetchTransaction(digest)
            .then((data) => setTxData(data))
            .catch((err) => setTxError(err instanceof Error ? err.message : String(err)))
            .finally(() => setTxLoading(false));
    }, [receipt?.txHash]);

    return (
        <div className="h-full flex flex-col bg-[#0c0c12]/60 border-l border-white/8 backdrop-blur-sm">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0">
                <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2 text-white">
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
                    <Card className="bg-primary/5 border-primary/25">
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
                                {/* Sui transaction details */}
                                {receipt.txHash && (
                                    <div className="mt-3 space-y-1 text-[11px]">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Tx Hash</span>
                                            <CopyableValue
                                                value={receipt.txHash}
                                                displayValue={
                                                    receipt.txHash.length > 18
                                                        ? `${receipt.txHash.slice(0, 10)}...${receipt.txHash.slice(-6)}`
                                                        : receipt.txHash
                                                }
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">On-chain Status</span>
                                            {txLoading ? (
                                                <span className="text-xs text-muted-foreground">Loading...</span>
                                            ) : txError ? (
                                                <span className="text-xs text-destructive">Unavailable</span>
                                            ) : txData ? (
                                                <span className="text-xs text-neon-green">
                                                    {txData.effects?.status?.status || "success"}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Not fetched</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : challenge ? (
                    <Card className="bg-accent/5 border-accent/25">
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
                    <Card className="bg-[#0f0f12]/60 border-dashed border-white/15">
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

                {/* Tabs for different views */}
                <div className="mb-6 flex space-x-1 border-b border-white/12">
                    <button
                        onClick={() => setActiveTab("status")}
                        className={cn(
                            "px-4 py-2 text-xs font-medium border-b-2 transition-all",
                            activeTab === "status"
                                ? "border-neon-cyan text-neon-cyan"
                                : "border-transparent text-muted-foreground hover:text-white"
                        )}
                    >
                        Status
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={cn(
                            "px-4 py-2 text-xs font-medium border-b-2 transition-all",
                            activeTab === "history"
                                ? "border-neon-cyan text-neon-cyan"
                                : "border-transparent text-muted-foreground hover:text-white"
                        )}
                    >
                        History
                        {paymentHistory.length > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] text-white">
                                {paymentHistory.length}
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === "history" ? (
                    <HistoryPanel />
                ) : (
                    <div className="space-y-6">
                        {/* Step-by-Step Data */}
                        {currentStep >= 0 && (
                            <div>
                                <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 px-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Step Data
                                </h3>
                                <div className="space-y-3">
                                    <StepDetail />
                                    {/* Webhook Preview in Step Data */}
                                    {receipt && (
                                        <WebhookPreview
                                            referenceKey={receipt.requestNonce}
                                            amount={receipt.amount}
                                            status="completed"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Code Export & Snippets */}
                        {receipt && (
                            <div>
                                <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 px-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    Integration Code
                                </h3>
                                <div className="space-y-4">
                                    <CodeExport
                                        amount={receipt.amount}
                                        description="Your Product"
                                        referenceKey={receipt.requestNonce}
                                    />
                                </div>
                            </div>
                        )}

                        {/* API Inspector */}
                        {apiCalls.length > 0 && (
                            <div>
                                <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 px-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    API Responses
                                </h3>
                                <APIInspector calls={apiCalls} />
                            </div>
                        )}

                        {/* Developer Tools */}
                        <div>
                            <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 px-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Developer Tools
                            </h3>
                            <ReferenceKeyLookup />
                        </div>
                    </div>
                )}
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
