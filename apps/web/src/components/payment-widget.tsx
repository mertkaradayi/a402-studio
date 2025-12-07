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

// Mock data generator for simulation
function generateMockData(amount: string, description: string, network: string) {
    const nonce = `ref_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const recipient = "0xa8c3e5f2d1b4c3e5f2d1b4a8c3e5f2d1b4c3e5f2";
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    return {
        challenge: {
            amount,
            asset: "USDC",
            recipient,
            chain: network,
            nonce,
            expiry: Math.floor(Date.now() / 1000) + 3600,
            description,
        },
        payment: {
            method: "wallet",
            txHash,
            sender: "0x9b8d7c6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c",
            amount,
            asset: "USDC",
            network,
            timestamp: new Date().toISOString(),
        },
        receipt: {
            id: `rcpt_${Date.now()}`,
            requestNonce: nonce,
            payer: "0x9b8d7c6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c",
            merchant: recipient,
            amount,
            asset: "USDC",
            chain: network,
            txHash,
            signature: `sig_${Date.now().toString(36)}`,
            issuedAt: Math.floor(Date.now() / 1000),
        },
        verification: {
            valid: true,
            checks: {
                amountMatch: true,
                chainMatch: true,
                nonceValid: true,
                recipientMatch: true,
                signatureValid: true,
                notExpired: true,
            },
            verifiedAt: new Date().toISOString(),
        },
        complete: {
            status: "paid",
            totalAmount: parseFloat(amount),
            referenceKey: nonce,
            destinationAddress: recipient,
            txHash,
            completedAt: new Date().toISOString(),
        },
    };
}

export function PaymentWidget() {
    const {
        addDebugLog,
        setChallenge,
        setReceipt,
        resetFlow,
        paymentMode,
        setCurrentStep,
        setStepData,
        resetSteps,
    } = useFlowStore();

    const [step, setStep] = useState<"config" | "paying" | "simulating" | "complete" | "error">("config");
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const [amount, setAmount] = useState("0.01");
    const [description, setDescription] = useState("Beep Payment");

    const network = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "sui-mainnet" : "sui-testnet";

    // Run simulation with auto-advancing steps
    const runSimulation = useCallback(async () => {
        if (isSimulating) return;

        setIsSimulating(true);
        resetFlow();
        resetSteps();
        setStep("simulating");

        const mockData = generateMockData(amount, description, network);
        const stepDelay = 1200;

        addDebugLog("info", "🎮 Starting simulation...");

        setCurrentStep(0);
        setStepData(0, { title: "Challenge Generated", data: mockData.challenge, timestamp: Date.now() });
        addDebugLog("info", "📋 Challenge generated");
        await new Promise((r) => setTimeout(r, stepDelay));

        setCurrentStep(1);
        setStepData(1, { title: "Payment Sent", data: mockData.payment, timestamp: Date.now() });
        addDebugLog("info", "💸 Payment transaction sent");
        await new Promise((r) => setTimeout(r, stepDelay));

        setCurrentStep(2);
        setStepData(2, { title: "Receipt Received", data: mockData.receipt, timestamp: Date.now() });
        addDebugLog("info", "🧾 Receipt received from network");
        await new Promise((r) => setTimeout(r, stepDelay));

        setCurrentStep(3);
        setStepData(3, { title: "Verification Complete", data: mockData.verification, timestamp: Date.now() });
        addDebugLog("success", "✅ Payment verified successfully");
        await new Promise((r) => setTimeout(r, stepDelay));

        setCurrentStep(4);
        setStepData(4, { title: "Payment Complete", data: mockData.complete, timestamp: Date.now() });
        addDebugLog("success", "🎉 Payment flow complete!");

        setChallenge(mockData.challenge, JSON.stringify(mockData.challenge, null, 2));
        setReceipt(mockData.receipt, JSON.stringify(mockData.receipt, null, 2));

        setPaymentResult({
            referenceKey: mockData.complete.referenceKey,
            totalAmount: mockData.complete.totalAmount,
            destinationAddress: mockData.complete.destinationAddress,
            status: "paid",
        });

        setStep("complete");
        setIsSimulating(false);
    }, [amount, description, network, isSimulating, addDebugLog, resetFlow, resetSteps, setCurrentStep, setStepData, setChallenge, setReceipt]);

    // Live payment start
    const handleStartPayment = useCallback(() => {
        if (!BEEP_PUBLISHABLE_KEY) {
            setError("NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY is not configured");
            addDebugLog("error", "Missing BEEP_PUBLISHABLE_KEY environment variable");
            return;
        }

        resetFlow();
        resetSteps();

        setCurrentStep(0);
        const challenge = {
            amount,
            asset: "USDC",
            recipient: "Beep (assigned on session)",
            chain: network,
            nonce: `session_${Date.now()}`,
            expiry: Math.floor(Date.now() / 1000) + 3600,
        };
        setStepData(0, { title: "Challenge Generated", data: challenge, timestamp: Date.now() });
        setChallenge(challenge, JSON.stringify(challenge, null, 2));

        addDebugLog("info", "🚀 Starting Beep payment...");
        addDebugLog("info", `Amount: ${amount} USDC`);

        setStep("paying");
    }, [amount, network, addDebugLog, setChallenge, resetFlow, resetSteps, setCurrentStep, setStepData]);

    const handlePaymentSuccess = useCallback((paymentData: PaymentResult) => {
        setCurrentStep(1);
        setStepData(1, {
            title: "Payment Sent",
            data: { status: "confirmed", ...paymentData },
            timestamp: Date.now(),
        });

        addDebugLog("success", "🎉 Payment confirmed by Beep!");

        setTimeout(() => {
            const referenceKey = paymentData.referenceKey || "";
            const destinationAddress = paymentData.destinationAddress || "";
            const finalAmount = String(paymentData.totalAmount || amount);

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

            setCurrentStep(2);
            setStepData(2, { title: "Receipt Received", data: receipt, timestamp: Date.now() });
            setReceipt(receipt, JSON.stringify(receipt, null, 2));

            setTimeout(() => {
                setCurrentStep(3);
                setStepData(3, {
                    title: "Verification Complete",
                    data: { valid: true, method: "beep_api", verifiedAt: new Date().toISOString() },
                    timestamp: Date.now(),
                });
                addDebugLog("success", "✅ Payment verified by Beep");

                setTimeout(() => {
                    setCurrentStep(4);
                    setStepData(4, {
                        title: "Payment Complete",
                        data: { status: "paid", ...paymentData },
                        timestamp: Date.now(),
                    });

                    setPaymentResult(paymentData);
                    setStep("complete");
                }, 500);
            }, 500);
        }, 500);
    }, [amount, network, addDebugLog, setReceipt, setCurrentStep, setStepData]);

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
        resetSteps();
    };

    // Missing API key error (only for live mode)
    if (!BEEP_PUBLISHABLE_KEY && paymentMode === "live") {
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
                            Set <code className="text-primary bg-muted px-1.5 py-0.5 rounded">NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY</code> for live payments.
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
                            <h1 className="text-xl font-bold tracking-tight">
                                {paymentMode === "simulation" ? "Payment Simulation" : "Beep Payments"}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {paymentMode === "simulation" ? "See the full payment flow" : "Pay with USDC on Sui"}
                            </p>
                        </div>
                    </div>

                    <div className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border",
                        paymentMode === "simulation"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : network === "sui-mainnet"
                                ? "bg-neon-green/10 text-neon-green border-neon-green/30"
                                : "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30"
                    )}>
                        {paymentMode === "simulation" ? "Demo Mode" : network === "sui-mainnet" ? "Mainnet" : "Testnet"}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {step === "config" && (
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Amount (USDC)</label>
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-12"
                                placeholder="What's this payment for?"
                            />
                        </div>

                        {paymentMode === "simulation" ? (
                            <Button
                                onClick={runSimulation}
                                size="lg"
                                className="w-full text-lg font-bold shadow-lg shadow-primary/20"
                            >
                                🎮 Run Simulation
                            </Button>
                        ) : (
                            <Button
                                onClick={handleStartPayment}
                                size="lg"
                                className="w-full text-lg font-bold bg-neon-green hover:bg-neon-green/90 text-black shadow-lg shadow-neon-green/20"
                            >
                                💳 Start Live Payment
                            </Button>
                        )}

                        <p className="text-xs text-muted-foreground text-center">
                            {paymentMode === "simulation"
                                ? "Watch the full payment flow with mock data"
                                : "You'll be able to pay via QR code or connect your wallet"}
                        </p>
                    </div>
                )}

                {step === "simulating" && (
                    <div className="max-w-md mx-auto space-y-6 text-center">
                        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 animate-pulse">
                            <svg className="w-10 h-10 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">Simulation Running...</h2>
                            <p className="text-muted-foreground text-sm">
                                Watch the step indicator above and the data panel on the right
                            </p>
                        </div>
                        <Button variant="ghost" onClick={handleReset} className="text-muted-foreground">
                            Cancel
                        </Button>
                    </div>
                )}

                {step === "paying" && (
                    <div className="max-w-md mx-auto space-y-6">
                        <Card className="overflow-hidden shadow-xl border-border bg-white">
                            <div className="p-1 bg-white">
                                <CheckoutWidget
                                    publishableKey={BEEP_PUBLISHABLE_KEY}
                                    primaryColor="#FF00ED"
                                    labels={{
                                        scanQr: "Scan QR or connect wallet",
                                        paymentLabel: description,
                                    }}
                                    assets={[{ name: description, price: amount, quantity: 1 }]}
                                    onPaymentSuccess={handlePaymentSuccess}
                                    onPaymentError={handlePaymentError}
                                />
                            </div>
                        </Card>
                        <Button variant="ghost" onClick={handleReset} className="w-full">
                            Cancel
                        </Button>
                    </div>
                )}

                {step === "complete" && paymentResult && (
                    <div className="max-w-md mx-auto space-y-6 text-center">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-neon-green/20 to-primary/20 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center border border-neon-green/30">
                                <svg className="w-8 h-8 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                {paymentMode === "simulation" ? "Simulation Complete!" : "Payment Complete!"}
                            </h2>
                            <p className="text-muted-foreground">
                                {paymentMode === "simulation"
                                    ? "All 5 steps completed successfully"
                                    : "Your payment has been verified by Beep"}
                            </p>
                        </div>

                        <Card className="bg-muted/30 border-neon-green/20">
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
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neon-green/10 text-neon-green uppercase">
                                        {paymentResult.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Button onClick={handleReset} variant="secondary" className="w-full">
                            {paymentMode === "simulation" ? "Run Again" : "Make Another Payment"}
                        </Button>
                    </div>
                )}

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
                        <Button onClick={handleReset} variant="outline" className="w-full">
                            Try Again
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
