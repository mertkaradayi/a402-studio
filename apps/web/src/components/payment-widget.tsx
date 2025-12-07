"use client";

import { useState, useCallback, useEffect } from "react";
import { CheckoutWidget } from "@beep-it/checkout-widget";
import { useFlowStore } from "@/stores/flow-store";
import { getSuiExplorerUrl, verifyOnChainPayment, type SuiTransactionDetails } from "@/lib/sui-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorScenarios, ErrorDisplay, ErrorScenario } from "./error-scenarios";
import { QuickActions } from "./quick-actions";

const BEEP_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY || "";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface PaymentResult {
    referenceKey?: string;
    totalAmount?: number;
    destinationAddress?: string;
    paymentUrl?: string;
    paid?: boolean;
    status?: string;
    txHash?: string;
    explorerUrl?: string;
    onChainVerified?: boolean;
    onChainMessage?: string;
}

type OnChainState =
    | { status: "idle" }
    | { status: "pending"; txHash: string; explorerUrl?: string }
    | { status: "verified"; txHash: string; explorerUrl?: string; message?: string }
    | { status: "failed"; txHash?: string; explorerUrl?: string; message?: string }
    | { status: "skipped"; message: string };

function isValidSuiTxHash(hash?: string | null): boolean {
    return typeof hash === "string" && /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(hash);
}

function extractTxHashFromAny(data: unknown): string | undefined {
    if (!data || typeof data !== "object") return undefined;
    const record = data as Record<string, unknown>;

    const candidates: Array<unknown> = [
        record.txHash,
        record.tx_hash,
        record.transactionHash,
        record.transactionDigest,
        record.digest,
        record.tx,
        record.txSignature,
        record.tx_signature,
        (record.receipt as Record<string, unknown> | undefined)?.txHash,
        (record.receipt as Record<string, unknown> | undefined)?.tx_hash,
        (record.details as Record<string, unknown> | undefined)?.txHash,
        (record.details as Record<string, unknown> | undefined)?.tx_hash,
    ];

    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.length > 0) {
            return candidate;
        }
    }

    return undefined;
}

function extractTxHash(data: PaymentResult): string | undefined {
    return extractTxHashFromAny(data);
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
        addPaymentHistoryEntry,
        stepData,
    } = useFlowStore();

    const [step, setStep] = useState<"config" | "paying" | "simulating" | "complete" | "error">("config");
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
    const [onChainState, setOnChainState] = useState<OnChainState>({ status: "idle" });
    const [onChainDetails, setOnChainDetails] = useState<SuiTransactionDetails | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatedError, setSimulatedError] = useState<ErrorScenario | null>(null);

    const [amount, setAmount] = useState("0.000001");
    const [description, setDescription] = useState("Beep Payment");

    const network = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "sui-mainnet" : "sui-testnet";

    const fetchBackendTxHash = useCallback(async (referenceKey: string) => {
        if (!referenceKey) {
            return { txHash: undefined, error: "Missing reference key" };
        }

        try {
            const response = await fetch(`${API_URL}/a402/verify-beep`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    receipt: { requestNonce: referenceKey },
                }),
            });

            const data = await response.json().catch(() => ({}));
            const txHash = extractTxHashFromAny(data) || extractTxHashFromAny((data as Record<string, unknown> | undefined)?.details);

            if (txHash) {
                addDebugLog("info", `📦 Retrieved tx hash from backend: ${txHash.slice(0, 14)}...`);
            }

            return { txHash: txHash ?? undefined };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            addDebugLog("warning", `⚠️ Could not fetch tx hash from backend: ${message}`);
            return { txHash: undefined, error: message };
        }
    }, [addDebugLog]);

    // Run simulation with auto-advancing steps
    const runSimulation = useCallback(async () => {
        if (isSimulating) return;

        setIsSimulating(true);
        setOnChainState({ status: "idle" });
        setOnChainDetails(null);
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

        // Add to payment history
        addPaymentHistoryEntry({
            mode: paymentMode,
            amount,
            description,
            status: "completed",
            referenceKey: mockData.complete.referenceKey,
            stepData: { ...stepData },
        });

        setStep("complete");
        setIsSimulating(false);
    }, [amount, description, network, isSimulating, addDebugLog, resetFlow, resetSteps, setCurrentStep, setStepData, setChallenge, setReceipt, addPaymentHistoryEntry, paymentMode, stepData]);

    // Live payment start
    const handleStartPayment = useCallback(() => {
        if (!BEEP_PUBLISHABLE_KEY) {
            setError("NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY is not configured");
            addDebugLog("error", "Missing BEEP_PUBLISHABLE_KEY environment variable");
            return;
        }

        setOnChainState({ status: "idle" });
        setOnChainDetails(null);
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

    const runOnChainVerification = useCallback(async (txHash?: string, destinationAddress?: string, finalAmount?: string) => {
        if (!txHash) {
            setOnChainState({ status: "skipped", message: "No transaction hash was returned by the payment gateway." });
            return;
        }

        const explorerUrl = getSuiExplorerUrl(txHash, network);
        setOnChainState({ status: "pending", txHash, explorerUrl });
        addDebugLog("info", "🔍 Verifying payment on-chain via Sui RPC...");

        try {
            const result = await verifyOnChainPayment({
                txHash,
                chain: network,
                expectedAmount: finalAmount ? Number(finalAmount) : undefined,
                expectedRecipient: destinationAddress,
            });

            setOnChainDetails(result.transaction);
            setOnChainState({
                status: result.verified ? "verified" : "failed",
                txHash,
                explorerUrl: result.explorerUrl,
                message: result.message,
            });

            setStepData(3, {
                title: "Verification Complete",
                data: {
                    valid: true,
                    method: "beep_api",
                    verifiedAt: new Date().toISOString(),
                    onChain: {
                        verified: result.verified,
                        status: result.status,
                        message: result.message,
                        checks: result.checks,
                        explorerUrl: result.explorerUrl,
                    },
                },
                timestamp: Date.now(),
            });

            setPaymentResult((prev) => prev ? {
                ...prev,
                txHash,
                explorerUrl: result.explorerUrl,
                onChainVerified: result.verified,
                onChainMessage: result.message,
            } : prev);

            addDebugLog(result.verified ? "success" : "warning", result.verified ? "✅ On-chain verification succeeded" : "⚠️ On-chain verification failed");
        } catch (err) {
            const message = err instanceof Error ? err.message : "On-chain verification failed";
            setOnChainState({ status: "failed", txHash, explorerUrl, message });
            addDebugLog("error", `On-chain verification error: ${message}`);
        }
    }, [network, addDebugLog, setStepData, setPaymentResult]);

    const handlePaymentSuccess = useCallback((paymentData: PaymentResult) => {
        setCurrentStep(1);
        setStepData(1, {
            title: "Payment Sent",
            data: { status: "confirmed", ...paymentData },
            timestamp: Date.now(),
        });

        addDebugLog("success", "🎉 Payment confirmed by Beep!");

        setTimeout(() => {
            void (async () => {
                const referenceKey = paymentData.referenceKey || "";
                const destinationAddress = paymentData.destinationAddress || "";
                const finalAmount = String(paymentData.totalAmount || amount);
                const initialTxHash = extractTxHash(paymentData);

                // Try to obtain a real Sui tx hash from backend if the widget didn't return one
                const backendLookup = referenceKey ? await fetchBackendTxHash(referenceKey) : { txHash: undefined };
                const resolvedTxHash = isValidSuiTxHash(initialTxHash)
                    ? initialTxHash
                    : (isValidSuiTxHash(backendLookup.txHash) ? backendLookup.txHash : undefined);

                const displayTxHash = resolvedTxHash || initialTxHash || backendLookup.txHash || (referenceKey ? `beep_widget_${referenceKey}` : undefined);
                const safeTxHash = displayTxHash ?? `beep_widget_${referenceKey || "unknown"}`;
                const explorerUrl = resolvedTxHash ? getSuiExplorerUrl(resolvedTxHash, network) : undefined;

                const receipt = {
                    id: `rcpt_${Date.now()}`,
                    requestNonce: referenceKey,
                    payer: "Verified by Beep",
                    merchant: destinationAddress,
                    amount: finalAmount,
                    asset: "USDC",
                    chain: network,
                    txHash: safeTxHash,
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

                    if (resolvedTxHash) {
                        void runOnChainVerification(resolvedTxHash, destinationAddress, finalAmount);
                    } else {
                        const reason = backendLookup.txHash
                            ? "Payment gateway did not return a Sui transaction hash. On-chain verification is not available for this checkout session."
                            : "No on-chain transaction hash is available yet from the payment gateway.";
                        setOnChainState({ status: "skipped", message: reason });
                        addDebugLog("warning", reason);
                    }

                    setTimeout(() => {
                        setCurrentStep(4);
                        setStepData(4, {
                            title: "Payment Complete",
                                data: { status: "paid", ...paymentData, txHash: safeTxHash },
                            timestamp: Date.now(),
                        });

                        setPaymentResult({
                            ...paymentData,
                                txHash: safeTxHash,
                            explorerUrl,
                        });
                        setStep("complete");
                    }, 500);
                }, 500);
            })();
        }, 500);
    }, [amount, network, addDebugLog, setReceipt, setCurrentStep, setStepData, runOnChainVerification, fetchBackendTxHash, setOnChainState]);

    const handlePaymentError = useCallback((err: unknown) => {
        const message = err instanceof Error ? err.message :
            typeof err === "object" && err !== null && "message" in err ?
                String((err as { message: unknown }).message) : "Unknown error";

        addDebugLog("error", `Payment error: ${message}`);
        setError(message);
        setStep("error");
    }, [addDebugLog]);

    const handleReset = useCallback(() => {
        setStep("config");
        setPaymentResult(null);
        setOnChainState({ status: "idle" });
        setOnChainDetails(null);
        setError(null);
        setIsSimulating(false);
        setSimulatedError(null);
        resetFlow();
        resetSteps();
    }, [resetFlow, resetSteps]);

    useEffect(() => {
        handleReset();
    }, [paymentMode, handleReset]);

    // Missing API key error (only for live mode)
    if (!BEEP_PUBLISHABLE_KEY && paymentMode === "live") {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <Card className="max-w-md text-center border-destructive/30">
                    <CardHeader className="pb-4">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-3">
                            <svg className="w-7 h-7 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <CardTitle className="text-foreground text-lg">Configuration Required</CardTitle>
                        <CardDescription className="mt-2">
                            Set <code className="text-primary bg-muted px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY</code> for live payments.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0c0c12]/60 backdrop-blur-sm">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/8 bg-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">
                            {paymentMode === "simulation" ? "Sandbox" : "Payment"}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {paymentMode === "simulation" ? "Simulated payment flow" : "USDC on Sui"}
                        </p>
                    </div>
                    <div className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium",
                        paymentMode === "simulation"
                            ? "bg-muted text-muted-foreground"
                            : network === "sui-mainnet"
                                ? "bg-neon-green/10 text-neon-green"
                                : "bg-neon-yellow/10 text-neon-yellow"
                    )}>
                        {paymentMode === "simulation" ? "Demo" : network === "sui-mainnet" ? "Mainnet" : "Testnet"}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                {step === "config" && (
                    <div className="max-w-md mx-auto space-y-8">
                        {/* Quick Actions */}
                        <QuickActions
                            onSelectAmount={(amt, desc) => {
                                setAmount(amt);
                                setDescription(desc);
                            }}
                        />

                        <div className="space-y-5">
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
                                    placeholder="What's this payment for?"
                                />
                            </div>
                        </div>

                        {/* Error Scenarios - Simulation mode only */}
                        {paymentMode === "simulation" && (
                            <div className="pt-4 border-t border-border/40">
                                <ErrorScenarios
                                    onSelectScenario={(scenario) => setSimulatedError(scenario)}
                                />
                            </div>
                        )}

                        {/* Show simulated error */}
                        {simulatedError && (
                            <ErrorDisplay
                                error={simulatedError.error}
                                onDismiss={() => setSimulatedError(null)}
                            />
                        )}

                        <div className="space-y-3 pt-2">
                            {paymentMode === "simulation" ? (
                                <Button
                                    onClick={runSimulation}
                                    size="lg"
                                    className="w-full"
                                    disabled={!!simulatedError}
                                >
                                    {simulatedError ? "Clear Error to Continue" : "Run Simulation"}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleStartPayment}
                                    size="lg"
                                    className="w-full bg-neon-green hover:bg-neon-green/90 text-black"
                                >
                                    Start Payment
                                </Button>
                            )}

                            <p className="text-xs text-muted-foreground text-center">
                                {paymentMode === "simulation"
                                    ? "Simulates the complete payment lifecycle"
                                    : "Pay via QR code or wallet connection"}
                            </p>
                        </div>
                    </div>
                )}

                {step === "simulating" && (
                    <div className="max-w-md mx-auto space-y-6 text-center py-12">
                        <div className="w-12 h-12 mx-auto border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <div>
                            <h2 className="text-lg font-semibold mb-1">Processing</h2>
                            <p className="text-muted-foreground text-sm">
                                Watch the step indicator above
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
                            Cancel
                        </Button>
                    </div>
                )}

                {step === "paying" && (
                    <div className="max-w-md mx-auto space-y-6">
                        <Card className="overflow-hidden border-white/15 bg-[#0f0f12]/80">
                            <div className="p-1">
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
                    <div className="max-w-md mx-auto space-y-6 text-center py-12">
                        <div className="w-16 h-16 mx-auto bg-neon-green/10 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-1">
                                {paymentMode === "simulation" ? "Simulation Complete" : "Payment Complete"}
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                {paymentMode === "simulation"
                                    ? "All steps completed successfully"
                                    : "Verified by Beep"}
                            </p>
                        </div>

                        <Card className="text-left">
                            <CardContent className="p-4 space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-mono text-neon-green font-medium">{paymentResult.totalAmount} USDC</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Reference</span>
                                    <span className="font-mono text-xs truncate max-w-[180px]" title={paymentResult.referenceKey}>
                                        {paymentResult.referenceKey?.slice(0, 16)}...
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-neon-green/10 text-neon-green uppercase">
                                        {paymentResult.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {onChainState.status !== "idle" && (
                            <Card className="text-left border-white/15 bg-[#0f0f12]/80">
                                <CardContent className="p-4 space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs uppercase text-muted-foreground">On-chain verification</div>
                                            <div className="font-medium">
                                                {onChainState.status === "pending" && "Checking on Sui..."}
                                                {onChainState.status === "verified" && "Confirmed on-chain"}
                                                {onChainState.status === "failed" && "Verification issue"}
                                                {onChainState.status === "skipped" && "Skipped (no tx hash)"}
                                            </div>
                                        </div>
                                        <span
                                            className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                                                onChainState.status === "verified"
                                                    ? "bg-neon-green/10 text-neon-green"
                                                    : onChainState.status === "pending"
                                                        ? "bg-neon-yellow/10 text-neon-yellow"
                                                        : "bg-destructive/10 text-destructive"
                                            )}
                                        >
                                            {onChainState.status.toUpperCase()}
                                        </span>
                                    </div>

                                    {paymentResult.txHash && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Tx Hash</span>
                                            <span className="font-mono text-xs truncate max-w-[200px]" title={paymentResult.txHash}>
                                                {paymentResult.txHash.slice(0, 14)}...
                                            </span>
                                        </div>
                                    )}

                                    {onChainDetails?.sender && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Sender</span>
                                            <span className="font-mono text-xs truncate max-w-[200px]" title={onChainDetails.sender}>
                                                {onChainDetails.sender.slice(0, 14)}...
                                            </span>
                                        </div>
                                    )}

                                    {"message" in onChainState && onChainState.message && (
                                        <p className="text-muted-foreground">{onChainState.message}</p>
                                    )}

                                    {"explorerUrl" in onChainState && onChainState.explorerUrl && (
                                        <Button asChild variant="link" className="px-0 text-primary">
                                            <a href={onChainState.explorerUrl} target="_blank" rel="noreferrer">
                                                View on Sui Explorer
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Button onClick={handleReset} variant="secondary" className="w-full">
                            {paymentMode === "simulation" ? "Run Again" : "Make Another Payment"}
                        </Button>
                    </div>
                )}

                {step === "error" && (
                    <div className="max-w-md mx-auto space-y-6 text-center py-12">
                        <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Payment Failed</h2>
                            <p className="text-sm text-destructive mt-3 bg-destructive/5 p-3 rounded-lg">{error}</p>
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
