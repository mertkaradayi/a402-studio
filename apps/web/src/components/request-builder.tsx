"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PaymentConfig {
    amount: string;
    description: string;
    paymentLabel?: string;
}

interface RequestBuilderProps {
    config: PaymentConfig;
    onChange: (config: PaymentConfig) => void;
    onSubmit: () => void;
    isLoading?: boolean;
    submitLabel?: string;
    mode?: "simulation" | "live";
}

export function RequestBuilder({
    config,
    onChange,
    onSubmit,
    isLoading,
    submitLabel = "Submit",
    mode = "simulation",
}: RequestBuilderProps) {
    const [viewMode, setViewMode] = useState<"form" | "json">("form");
    const [jsonText, setJsonText] = useState("");
    const [jsonError, setJsonError] = useState<string | null>(null);

    // Sync config to JSON text
    useEffect(() => {
        if (viewMode === "json") {
            setJsonText(JSON.stringify(config, null, 2));
        }
    }, [config, viewMode]);

    const handleJsonChange = (text: string) => {
        setJsonText(text);
        setJsonError(null);

        try {
            const parsed = JSON.parse(text);
            if (parsed.amount !== undefined && parsed.description !== undefined) {
                onChange({
                    amount: String(parsed.amount),
                    description: String(parsed.description),
                    paymentLabel: parsed.paymentLabel,
                });
            }
        } catch {
            setJsonError("Invalid JSON");
        }
    };

    const handleFormChange = (field: keyof PaymentConfig, value: string) => {
        onChange({ ...config, [field]: value });
    };

    return (
        <div className="space-y-4">
            {/* View Toggle */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Request</span>
                <div className="flex items-center border border-border rounded-md overflow-hidden text-xs">
                    <button
                        onClick={() => setViewMode("form")}
                        className={cn(
                            "px-2.5 py-1 transition-colors",
                            viewMode === "form"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Form
                    </button>
                    <div className="w-px h-4 bg-border" />
                    <button
                        onClick={() => setViewMode("json")}
                        className={cn(
                            "px-2.5 py-1 transition-colors",
                            viewMode === "json"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        JSON
                    </button>
                </div>
            </div>

            {/* Form View */}
            {viewMode === "form" && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount (USDC)</label>
                        <div className="relative">
                            <Input
                                type="text"
                                value={config.amount}
                                onChange={(e) => handleFormChange("amount", e.target.value)}
                                className="h-12 text-lg font-mono pl-4 pr-16"
                                placeholder="0.01"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                                USDC
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input
                            type="text"
                            value={config.description}
                            onChange={(e) => handleFormChange("description", e.target.value)}
                            className="h-10"
                            placeholder="What's this payment for?"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            Payment Label
                            <span className="text-[10px] text-muted-foreground">(optional)</span>
                        </label>
                        <Input
                            type="text"
                            value={config.paymentLabel || ""}
                            onChange={(e) => handleFormChange("paymentLabel", e.target.value)}
                            className="h-10"
                            placeholder="Your Store Name"
                        />
                    </div>
                </div>
            )}

            {/* JSON View */}
            {viewMode === "json" && (
                <div className="space-y-2">
                    <div className="relative">
                        <textarea
                            value={jsonText}
                            onChange={(e) => handleJsonChange(e.target.value)}
                            className={cn(
                                "w-full h-40 p-3 rounded-lg border font-mono text-sm resize-none",
                                "bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/50",
                                jsonError && "border-destructive focus:ring-destructive/50"
                            )}
                            placeholder='{"amount": "0.01", "description": "Payment"}'
                        />
                        {jsonError && (
                            <p className="text-xs text-destructive mt-1">{jsonError}</p>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        Edit the JSON directly. Changes sync to the form view.
                    </p>
                </div>
            )}

            {/* Submit Button */}
            <Button
                onClick={onSubmit}
                disabled={isLoading || !!jsonError}
                size="lg"
                className={cn(
                    "w-full font-medium",
                    mode === "live" && "bg-neon-green hover:bg-neon-green/90 text-black"
                )}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        Processing...
                    </span>
                ) : (
                    submitLabel
                )}
            </Button>
        </div>
    );
}
