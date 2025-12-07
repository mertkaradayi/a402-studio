"use client";

import { useState, useCallback } from "react";
import { BeepPublicClient } from "@beep-it/sdk-core";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BEEP_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY || "";
const BEEP_SERVER_URL = process.env.NEXT_PUBLIC_BEEP_SERVER_URL || "https://api.justbeep.it";

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
                serverUrl: BEEP_SERVER_URL,
            });

            console.log("[ReferenceKeyLookup] Checking status for:", referenceKey.trim());
            console.log("[ReferenceKeyLookup] Using server:", BEEP_SERVER_URL);

            const status = await beepClient.widget.getPaymentStatus(referenceKey.trim());
            console.log("[ReferenceKeyLookup] API Response:", status);

            setResult({
                paid: status.paid === true,
                status: status.status,
            });
        } catch (error) {
            console.error("[ReferenceKeyLookup] Error:", error);
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
        <Card className="overflow-hidden border-border bg-card">
            {/* Header */}
            <div className="px-3 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs font-medium text-foreground">Reference Key Lookup</span>
            </div>

            {/* Input */}
            <div className="p-3 space-y-3">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={referenceKey}
                        onChange={(e) => setReferenceKey(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste a referenceKey..."
                        className="flex-1 h-8 text-xs font-mono"
                    />
                    <Button
                        onClick={handleLookup}
                        disabled={isLoading || !referenceKey.trim()}
                        size="sm"
                        className="h-8 text-xs bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                        {isLoading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            "Check"
                        )}
                    </Button>
                </div>

                {/* Result */}
                {result && (
                    <div className={cn(
                        "p-2.5 rounded-lg text-xs border animate-in slide-in-from-top-2 duration-200",
                        result.error
                            ? "bg-destructive/10 border-destructive/20 text-destructive"
                            : result.paid
                                ? "bg-neon-green/10 border-neon-green/20 text-neon-green"
                                : "bg-neon-yellow/10 border-neon-yellow/20 text-neon-yellow"
                    )}>
                        <div className="flex items-center gap-2">
                            {result.error ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>{result.error}</span>
                                </>
                            ) : result.paid ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-medium">Paid</span>
                                    {result.status && (
                                        <span className="text-muted-foreground">• Status: {result.status}</span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">Not Paid</span>
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
                <p className="text-[10px] text-muted-foreground/60">
                    💡 Paste any referenceKey from a Beep payment session to check its status
                </p>
            </div>
        </Card>
    );
}
