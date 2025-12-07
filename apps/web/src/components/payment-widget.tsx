"use client";

import { useState, useCallback } from "react";
import { CheckoutWidget } from "@beep-it/checkout-widget";
import { useFlowStore } from "@/stores/flow-store";
import { cn } from "@/lib/utils";

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
                <div className="max-w-md text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2">Configuration Required</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Set <code className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY</code> in your environment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Beep Payments</h1>
                            <p className="text-sm text-muted-foreground">Pay with USDC on Sui</p>
                        </div>
                    </div>

                    {/* Network Badge */}
                    <div className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium",
                        network === "sui-mainnet"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                    )}>
                        {network === "sui-mainnet" ? "Mainnet" : "Testnet"}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Configuration Step */}
                {step === "config" && (
                    <div className="max-w-md mx-auto space-y-6">
                        {/* Amount Input */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Amount (USDC)
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/50 border border-border rounded-xl text-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="0.01"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                    USDC
                                </span>
                            </div>
                        </div>

                        {/* Description Input */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Description
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-black/50 border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="What's this payment for?"
                            />
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={handleStartPayment}
                            className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
                        >
                            Start Payment
                        </button>

                        {/* Info */}
                        <p className="text-xs text-muted-foreground text-center">
                            You&apos;ll be able to pay via QR code or connect your wallet
                        </p>
                    </div>
                )}

                {/* Payment Step - Show CheckoutWidget */}
                {step === "paying" && (
                    <div className="space-y-4">
                        {/* Widget Container */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
                            <CheckoutWidget
                                publishableKey={BEEP_PUBLISHABLE_KEY}
                                primaryColor="#a855f7"
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

                        {/* Cancel Button */}
                        <button
                            onClick={handleReset}
                            className="w-full px-4 py-2 border border-border text-muted-foreground rounded-xl hover:bg-muted/10 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Complete Step */}
                {step === "complete" && paymentResult && (
                    <div className="max-w-md mx-auto space-y-6 text-center">
                        {/* Success Animation */}
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Payment Complete!</h2>
                            <p className="text-muted-foreground">
                                Your payment has been verified by Beep
                            </p>
                        </div>

                        {/* Payment Summary */}
                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl text-left">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-mono text-green-400">{paymentResult.totalAmount} USDC</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Reference</span>
                                    <span className="font-mono text-purple-400 truncate max-w-[180px]" title={paymentResult.referenceKey}>
                                        {paymentResult.referenceKey?.slice(0, 16)}...
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="text-purple-400 font-medium">{paymentResult.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* New Payment Button */}
                        <button
                            onClick={handleReset}
                            className="w-full px-6 py-3 bg-purple-500/20 text-purple-400 font-medium rounded-xl border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                        >
                            Make Another Payment
                        </button>
                    </div>
                )}

                {/* Error Step */}
                {step === "error" && (
                    <div className="max-w-md mx-auto space-y-4 text-center">
                        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white">Payment Failed</h2>
                        <p className="text-sm text-red-400">{error}</p>
                        <button
                            onClick={handleReset}
                            className="w-full px-4 py-2 border border-border text-muted-foreground rounded-xl hover:bg-muted/10 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
