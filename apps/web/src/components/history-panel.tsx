"use client";

import { useState } from "react";
import { useFlowStore, PaymentHistoryEntry } from "@/stores/flow-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HistoryPanel() {
    const { paymentHistory, clearPaymentHistory } = useFlowStore();

    if (paymentHistory.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-sm font-medium">No Payment History</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Completed payments will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    {paymentHistory.length} payment{paymentHistory.length !== 1 ? "s" : ""} this session
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearPaymentHistory}
                    className="h-6 px-2 text-[10px] text-muted-foreground"
                >
                    Clear
                </Button>
            </div>

            {paymentHistory.map((entry) => (
                <HistoryEntry key={entry.id} entry={entry} />
            ))}
        </div>
    );
}

interface HistoryEntryProps {
    entry: PaymentHistoryEntry;
}

function HistoryEntry({ entry }: HistoryEntryProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const statusColors = {
        pending: "text-neon-yellow bg-neon-yellow/10",
        completed: "text-neon-green bg-neon-green/10",
        failed: "text-destructive bg-destructive/10",
    };

    const statusIcons = {
        pending: "⏳",
        completed: "✓",
        failed: "✕",
    };

    return (
        <Card className={cn(
            "transition-all",
            entry.status === "completed" && "border-neon-green/20",
            entry.status === "failed" && "border-destructive/20"
        )}>
            <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center justify-between text-xs">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <svg
                            className={cn(
                                "w-3 h-3 text-muted-foreground transition-transform",
                                isExpanded ? "rotate-90" : ""
                            )}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-bold text-primary">${entry.amount}</span>
                        <span className="text-muted-foreground font-normal truncate max-w-[150px]">
                            {entry.description}
                        </span>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-medium",
                            statusColors[entry.status]
                        )}>
                            {statusIcons[entry.status]} {entry.status}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
                            {entry.mode === "simulation" ? "sandbox" : "live"}
                        </span>
                    </div>
                </CardTitle>
            </CardHeader>

            {isExpanded && (
                <CardContent className="px-3 pb-3 space-y-2 animate-in slide-in-from-top-2">
                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2 rounded bg-muted/30">
                            <span className="text-muted-foreground">Time</span>
                            <p className="font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                        </div>
                        {entry.referenceKey && (
                            <div className="p-2 rounded bg-muted/30">
                                <span className="text-muted-foreground">Reference</span>
                                <p className="font-mono truncate">{entry.referenceKey}</p>
                            </div>
                        )}
                    </div>

                    {/* Step data */}
                    {Object.keys(entry.stepData).length > 0 && (
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-medium">Steps</p>
                            <div className="bg-muted/20 rounded-lg p-2 max-h-32 overflow-y-auto scrollbar-thin">
                                {Object.entries(entry.stepData).map(([step, data]) => (
                                    <div key={step} className="flex items-center gap-2 text-[10px] py-0.5">
                                        <span className="w-4 h-4 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center text-[8px] font-bold">
                                            ✓
                                        </span>
                                        <span className="text-muted-foreground">{data.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
