"use client";

import { useState, useCallback } from "react";
import { BeepPublicClient } from "@beep-it/sdk-core";
import { cn } from "@/lib/utils";

const BEEP_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY || "";

interface LookupResult {
    paid: boolean;
    status?: string;
    error?: string;
}

export function ReferenceKeyLookup() {
    const [referenceKey, setReferenceKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<LookupResult | null>(null);

    const handleLookup = useCallback(async () => {
        if (!referenceKey.trim()) return;
        if (!BEEP_PUBLISHABLE_KEY) {
            setResult({ paid: false, error: "Publishable key not configured" });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const beepClient = new BeepPublicClient({
                publishableKey: BEEP_PUBLISHABLE_KEY,
            });

            const status = await beepClient.widget.getPaymentStatus(referenceKey.trim());
            setResult({
                paid: (status as { paid?: boolean })?.paid === true,
                status: (status as { status?: string })?.status,
            });
        } catch (error) {
            setResult({
                paid: false,
                error: error instanceof Error ? error.message : "Lookup failed",
            });
        } finally {
            setIsLoading(false);
        }
    }, [referenceKey]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleLookup();
        }
    };

    return (
        <div className="bg-black/50 rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-black/30 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs font-medium text-white">Reference Key Lookup</span>
            </div>

            {/* Input */}
            <div className="p-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={referenceKey}
                        onChange={(e) => setReferenceKey(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste a referenceKey..."
                        className="flex-1 px-3 py-2 bg-black/50 border border-border rounded-lg text-xs font-mono text-white placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleLookup}
                        disabled={isLoading || !referenceKey.trim()}
                        className={cn(
                            "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                            isLoading || !referenceKey.trim()
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        )}
                    >
                        {isLoading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            "Check"
                        )}
                    </button>
                </div>

                {/* Result */}
                {result && (
                    <div className={cn(
                        "mt-3 p-3 rounded-lg text-xs",
                        result.error
                            ? "bg-red-500/10 border border-red-500/30"
                            : result.paid
                                ? "bg-green-500/10 border border-green-500/30"
                                : "bg-yellow-500/10 border border-yellow-500/30"
                    )}>
                        <div className="flex items-center gap-2">
                            {result.error ? (
                                <>
                                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span className="text-red-400">{result.error}</span>
                                </>
                            ) : result.paid ? (
                                <>
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-green-400 font-medium">Paid</span>
                                    {result.status && (
                                        <span className="text-muted-foreground">• Status: {result.status}</span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-yellow-400 font-medium">Not Paid</span>
                                    {result.status && (
                                        <span className="text-muted-foreground">• Status: {result.status}</span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Tip */}
            <div className="px-3 pb-3">
                <p className="text-[10px] text-muted-foreground/50">
                    💡 Paste any referenceKey from a Beep payment session to check its status
                </p>
            </div>
        </div>
    );
}
