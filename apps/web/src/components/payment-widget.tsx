"use client";

import { useState, useCallback } from "react";
import { CheckoutWidget } from "@beep-it/checkout-widget";
import { useFlowStore } from "@/stores/flow-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BEEP_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY || "";

interface PaymentResult {
    referenceKey?: string;
    totalAmount?: number;
    destinationAddress?: string;
    paymentUrl?: string;
    paid?: boolean;
    status?: string;
}

export function PaymentWidget() {
    const { addDebugLog, setChallenge, setReceipt, resetFlow } = useFlowStore();

    const [step, setStep] = useState<"config" | "paying" | "complete" | "error">("config");
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Configuration
    const [amount, setAmount] = useState("0.01");
    const [description, setDescription] = useState("Beep Payment");

    const network = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "sui-mainnet" : "sui-testnet";

    const handleStartPayment = useCallback(() => {
        if (!BEEP_PUBLISHABLE_KEY) {
            setError("NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY is not configured");
            addDebugLog("error", "Missing BEEP_PUBLISHABLE_KEY environment variable");
            return;
        }

        // Reset previous state
        resetFlow();

        addDebugLog("info", "🚀 Starting Beep payment...");
        addDebugLog("info", `Amount: ${amount} USDC`);
        addDebugLog("info", `Description: ${description}`);

        // Set initial challenge for display
        const challenge = {
            amount,
            asset: "USDC",
            recipient: "Beep (assigned on session)",
            chain: network,
            nonce: `session_${Date.now()}`,
            expiry: Math.floor(Date.now() / 1000) + 3600,
        };
        setChallenge(challenge, JSON.stringify(challenge, null, 2));

        setStep("paying");
    }, [amount, description, network, addDebugLog, setChallenge, resetFlow]);

    const handlePaymentSuccess = useCallback((paymentData: PaymentResult) => {
        addDebugLog("success", "🎉 Payment confirmed by Beep!");
        addDebugLog("info", `Reference: ${paymentData.referenceKey}`);
        addDebugLog("info", `Status: ${paymentData.status}`);

        setPaymentResult(paymentData);

        // Get the real values from Beep's response
        const referenceKey = paymentData.referenceKey || "";
        const destinationAddress = paymentData.destinationAddress || "";
        const finalAmount = String(paymentData.totalAmount || amount);

        // Update challenge with REAL values from Beep
        const updatedChallenge = {
            amount: finalAmount,
            asset: "USDC",
            recipient: destinationAddress,
            chain: network,
            nonce: referenceKey,
            expiry: Math.floor(Date.now() / 1000) + 3600,
        };
        setChallenge(updatedChallenge, JSON.stringify(updatedChallenge, null, 2));

        // Create receipt from payment data
        const receipt = {
            id: `rcpt_${Date.now()}`,
            requestNonce: referenceKey,
            payer: "Verified by Beep",
            merchant: destinationAddress,
            amount: finalAmount,
            asset: "USDC",
            chain: network,
            txHash: `beep_widget_${referenceKey}`,
            signature: `beep_widget_verified_${referenceKey}`,
            issuedAt: Math.floor(Date.now() / 1000),
        };

        setReceipt(receipt, JSON.stringify(receipt, null, 2));
        addDebugLog("success", "✅ Payment verified by Beep");

        setStep("complete");
    }, [amount, network, addDebugLog, setChallenge, setReceipt]);

    const handlePaymentError = useCallback((err: unknown) => {
        const message = err instanceof Error ? err.message :
            typeof err === "object" && err !== null && "message" in err ?
                String((err as { message: unknown }).message) : "Unknown error";

        addDebugLog("error", `Payment error: ${message}`);
        setError(message);
        setStep("error");
    }, [addDebugLog]);

    const handleReset = () => {
        setStep("config");
        setPaymentResult(null);
        setError(null);
        resetFlow();
    };

    // Missing API key error
    if (!BEEP_PUBLISHABLE_KEY) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <Card className="max-w-md text-center border-destructive/50 bg-destructive/10">
                    <CardHeader>
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/20 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <CardTitle className="text-foreground">Configuration Required</CardTitle>
                        <CardDescription>
                            Set <code className="text-primary bg-muted px-1.5 py-0.5 rounded">NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY</code> in your environment.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border bg-card/40 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Beep Payments</h1>
                            <p className="text-sm text-muted-foreground">Pay with USDC on Sui</p>
                        </div>
                    </div>

                    {/* Network Badge */}
                    <div className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border",
                        network === "sui-mainnet"
                            ? "bg-neon-green/10 text-neon-green border-neon-green/30"
                            : "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30"
                    )}>
                        {network === "sui-mainnet" ? "Mainnet" : "Testnet"}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {/* Configuration Step */}
                {step === "config" && (
                    <div className="max-w-md mx-auto space-y-6">
                        {/* Amount Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Amount (USDC)
                            </label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="h-14 text-lg font-mono pl-4 pr-16"
                                    placeholder="0.01"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                                    USDC
                                </span>
                            </div>
                        </div>

                        {/* Description Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Description
                            </label>
                            <Input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-12"
                                placeholder="What's this payment for?"
                            />
                        </div>

                        {/* Start Button */}
                        <Button
                            onClick={handleStartPayment}
                            size="lg"
                            className="w-full text-lg font-bold shadow-lg shadow-primary/20"
                        >
                            Start Payment
                        </Button>

                        {/* Info */}
                        <p className="text-xs text-muted-foreground text-center">
                            You&apos;ll be able to pay via QR code or connect your wallet
                        </p>
                    </div>
                )}

                {/* Payment Step - Show CheckoutWidget */}
                {step === "paying" && (
                    <div className="max-w-md mx-auto space-y-6">
                        {/* Widget Container */}
                        <Card className="overflow-hidden shadow-xl border-border bg-white">
                            {/* Beep Widget needs white background usually or configured colors, let's keep it clean */}
                            <div className="p-1 bg-white">
                                <CheckoutWidget
                                    publishableKey={BEEP_PUBLISHABLE_KEY}
                                    primaryColor="#FF00ED" // Neon Pink
                                    labels={{
                                        scanQr: "Scan QR or connect wallet",
                                        paymentLabel: description,
                                    }}
                                    assets={[
                                        {
                                            name: description,
                                            price: amount,
                                            quantity: 1,
                                        },
                                    ]}
                                    onPaymentSuccess={handlePaymentSuccess}
                                    onPaymentError={handlePaymentError}
                                />
                            </div>
                        </Card>

                        {/* Cancel Button */}
                        <Button
                            variant="ghost"
                            onClick={handleReset}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </div>
                )}

                {/* Complete Step */}
                {step === "complete" && paymentResult && (
                    <div className="max-w-md mx-auto space-y-6 text-center">
                        {/* Success Animation */}
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-2">Payment Complete!</h2>
                            <p className="text-muted-foreground">
                                Your payment has been verified by Beep
                            </p>
                        </div>

                        {/* Payment Summary */}
                        <Card className="bg-muted/30 border-primary/20">
                            <CardContent className="p-4 space-y-3 text-sm pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-mono text-neon-green font-medium">{paymentResult.totalAmount} USDC</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Reference</span>
                                    <span className="font-mono text-primary truncate max-w-[180px]" title={paymentResult.referenceKey}>
                                        {paymentResult.referenceKey?.slice(0, 16)}...
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary uppercase">
                                        {paymentResult.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* New Payment Button */}
                        <Button
                            onClick={handleReset}
                            variant="secondary"
                            className="w-full"
                        >
                            Make Another Payment
                        </Button>
                    </div>
                )}

                {/* Error Step */}
                {step === "error" && (
                    <div className="max-w-md mx-auto space-y-6 text-center">
                        <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Payment Failed</h2>
                            <p className="text-sm text-destructive mt-2 bg-destructive/5 p-2 rounded border border-destructive/20">{error}</p>
                        </div>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="w-full"
                        >
                            Try Again
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
