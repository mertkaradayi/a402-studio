"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorScenario {
    id: string;
    name: string;
    description: string;
    type: "client" | "server" | "network";
    error: {
        code: string;
        message: string;
        details?: string;
    };
}

const ERROR_SCENARIOS: ErrorScenario[] = [
    {
        id: "invalid_key",
        name: "Invalid API Key",
        description: "What happens with an invalid or missing API key",
        type: "client",
        error: {
            code: "INVALID_API_KEY",
            message: "The provided API key is invalid or expired",
            details: "Ensure your publishable key starts with 'beep_pk_' and is active",
        },
    },
    {
        id: "insufficient_funds",
        name: "Insufficient Funds",
        description: "When the payer doesn't have enough USDC",
        type: "client",
        error: {
            code: "INSUFFICIENT_BALANCE",
            message: "Insufficient USDC balance in wallet",
            details: "Wallet balance: 0.50 USDC, Required: 1.00 USDC",
        },
    },
    {
        id: "payment_timeout",
        name: "Payment Timeout",
        description: "When payment isn't completed in time",
        type: "server",
        error: {
            code: "PAYMENT_TIMEOUT",
            message: "Payment session expired after 5 minutes",
            details: "The user did not complete the payment within the allowed time",
        },
    },
    {
        id: "network_error",
        name: "Network Error",
        description: "When the Beep API is unreachable",
        type: "network",
        error: {
            code: "NETWORK_ERROR",
            message: "Failed to connect to Beep API",
            details: "Check your internet connection and try again",
        },
    },
    {
        id: "invalid_amount",
        name: "Invalid Amount",
        description: "When amount format is incorrect",
        type: "client",
        error: {
            code: "INVALID_AMOUNT",
            message: "Amount must be a positive number",
            details: "Received: '-5.00', Expected: '0.01' or greater",
        },
    },
];

interface ErrorScenariosProps {
    onSelectScenario: (scenario: ErrorScenario) => void;
}

export function ErrorScenarios({ onSelectScenario }: ErrorScenariosProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleSelect = (scenario: ErrorScenario) => {
        setSelectedId(scenario.id);
        onSelectScenario(scenario);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                    Simulate Error Scenarios
                </span>
                {selectedId && (
                    <button
                        onClick={() => setSelectedId(null)}
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                    >
                        Clear
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 gap-2">
                {ERROR_SCENARIOS.map((scenario) => (
                    <button
                        key={scenario.id}
                        onClick={() => handleSelect(scenario)}
                        className={cn(
                            "p-2 rounded-lg border text-left transition-all",
                            "hover:border-primary/50 hover:bg-muted/30",
                            selectedId === scenario.id
                                ? "border-destructive bg-destructive/10"
                                : "border-border"
                        )}
                    >
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    scenario.type === "client" && "bg-neon-yellow",
                                    scenario.type === "server" && "bg-destructive",
                                    scenario.type === "network" && "bg-muted-foreground"
                                )}
                            />
                            <span className="text-xs font-medium">{scenario.name}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {scenario.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}

interface ErrorDisplayProps {
    error: ErrorScenario["error"];
    onDismiss?: () => void;
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(JSON.stringify(error, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-mono text-xs font-medium text-destructive">{error.code}</p>
                        <p className="text-sm">{error.message}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 px-2 text-xs"
                    >
                        {copied ? "Copied!" : "Copy"}
                    </Button>
                    {onDismiss && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDismiss}
                            className="h-7 px-2"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    )}
                </div>
            </div>
            {error.details && (
                <div className="bg-background/50 rounded-md p-2 mt-2">
                    <p className="text-xs text-muted-foreground font-mono">{error.details}</p>
                </div>
            )}
            <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>This is a simulated error for demonstration</span>
            </div>
        </div>
    );
}
