"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { cn } from "@/lib/utils";

// USDC on Sui Mainnet
const USDC_TYPE = "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";

export interface BeepCheckoutProps {
    /** Amount in decimal format (e.g., "0.50") */
    amount: string;
    /** Currency (currently only USDC on Sui) */
    currency: string;
    /** Recipient address */
    recipient: string;
    /** Payment description */
    description?: string;
    /** Callback when payment completes */
    onPaymentComplete?: (receipt: BeepPaymentReceipt) => void;
    /** Callback when payment fails */
    onPaymentError?: (error: Error) => void;
    /** Whether to show the widget in a modal */
    showModal?: boolean;
    /** Primary color for the widget */
    primaryColor?: string;
}

export interface BeepPaymentReceipt {
    id: string;
    payer: string;
    merchant: string;
    amount: string;
    asset: string;
    chain: string;
    txHash: string;
    signature: string;
    issuedAt: number;
}

/**
 * BeepCheckout Component
 *
 * Direct wallet payment for USDC on Sui.
 * Signs and executes a real transaction with the connected wallet.
 */
export function BeepCheckout({
    amount,
    currency,
    recipient,
    description,
    onPaymentComplete,
    onPaymentError,
    showModal = true,
    primaryColor = "#8b5cf6",
}: BeepCheckoutProps) {
    const account = useCurrentAccount();
    const suiClient = useSuiClient();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    const [paymentStatus, setPaymentStatus] = useState<"ready" | "signing" | "executing" | "success" | "error">("ready");
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [txDigest, setTxDigest] = useState<string | null>(null);

    // Convert decimal amount to USDC smallest units (6 decimals)
    const amountInSmallestUnits = Math.floor(parseFloat(amount) * 1_000_000);

    const handlePayment = useCallback(async () => {
        if (!account) {
            setPaymentStatus("error");
            setStatusMessage("Please connect your wallet first");
            onPaymentError?.(new Error("Wallet not connected"));
            return;
        }

        try {
            setPaymentStatus("signing");
            setStatusMessage("Finding USDC coins...");

            // Get user's USDC coins
            const coins = await suiClient.getCoins({
                owner: account.address,
                coinType: USDC_TYPE,
            });

            if (coins.data.length === 0) {
                throw new Error("No USDC balance found. Please add USDC to your wallet.");
            }

            // Calculate total balance
            const totalBalance = coins.data.reduce(
                (sum, coin) => sum + BigInt(coin.balance),
                BigInt(0)
            );

            if (totalBalance < BigInt(amountInSmallestUnits)) {
                throw new Error(`Insufficient USDC balance. Need ${amount} USDC, have ${Number(totalBalance) / 1_000_000} USDC`);
            }

            setStatusMessage("Creating transaction...");

            // Build the transaction
            const tx = new Transaction();

            // If we need to merge coins or split
            if (coins.data.length === 1) {
                // Single coin - split the amount we need
                const [coinToSend] = tx.splitCoins(
                    tx.object(coins.data[0].coinObjectId),
                    [amountInSmallestUnits]
                );
                tx.transferObjects([coinToSend], recipient);
            } else {
                // Multiple coins - merge them first, then split
                const primaryCoin = tx.object(coins.data[0].coinObjectId);
                const otherCoins = coins.data.slice(1).map(c => tx.object(c.coinObjectId));

                if (otherCoins.length > 0) {
                    tx.mergeCoins(primaryCoin, otherCoins);
                }

                const [coinToSend] = tx.splitCoins(primaryCoin, [amountInSmallestUnits]);
                tx.transferObjects([coinToSend], recipient);
            }

            setPaymentStatus("executing");
            setStatusMessage("Please approve in your wallet...");

            // Sign and execute
            const result = await signAndExecute({
                transaction: tx,
            });

            console.log("[Beep] Transaction executed:", result.digest);
            setTxDigest(result.digest);

            // Wait for transaction confirmation
            setStatusMessage("Confirming on chain...");

            const txResponse = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });

            if (txResponse.effects?.status?.status === "success") {
                setPaymentStatus("success");
                setStatusMessage("Payment confirmed!");

                const network = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "sui-mainnet" : "sui-testnet";

                const receipt: BeepPaymentReceipt = {
                    id: `rcpt_${Date.now()}`,
                    payer: account.address,
                    merchant: recipient,
                    amount: amount,
                    asset: currency,
                    chain: network,
                    txHash: result.digest,
                    signature: `sui_tx_${result.digest.slice(0, 16)}`,
                    issuedAt: Math.floor(Date.now() / 1000),
                };

                onPaymentComplete?.(receipt);
            } else {
                throw new Error(`Transaction failed: ${txResponse.effects?.status?.error || "Unknown error"}`);
            }

        } catch (err) {
            console.error("[Beep] Payment error:", err);
            setPaymentStatus("error");

            const message = err instanceof Error ? err.message : "Payment failed";

            if (message.includes("User rejected") || message.includes("rejected")) {
                setStatusMessage("Transaction cancelled");
            } else {
                setStatusMessage(message);
            }

            onPaymentError?.(err instanceof Error ? err : new Error(message));
        }
    }, [account, suiClient, signAndExecute, amount, amountInSmallestUnits, currency, recipient, onPaymentComplete, onPaymentError]);

    // Render: Success
    if (paymentStatus === "success") {
        return (
            <div className="p-6 bg-card/50 rounded-lg border border-neon-green/30">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-neon-green/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-neon-green">Payment Complete!</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {amount} {currency} sent successfully
                        </p>
                    </div>
                    {txDigest && (
                        <div className="text-xs text-muted-foreground">
                            <p>Transaction:</p>
                            <a
                                href={`https://suiscan.xyz/${process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "mainnet" : "testnet"}/tx/${txDigest}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:underline break-all"
                            >
                                {txDigest.slice(0, 20)}...{txDigest.slice(-8)}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Render: Error
    if (paymentStatus === "error") {
        return (
            <div className="p-6 bg-card/50 rounded-lg border border-red-500/30">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-red-400">Payment Failed</h3>
                        <p className="text-sm text-muted-foreground mt-1">{statusMessage}</p>
                    </div>
                    <button
                        onClick={() => {
                            setPaymentStatus("ready");
                            setStatusMessage("");
                            setTxDigest(null);
                        }}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Render: Processing (signing/executing)
    if (paymentStatus === "signing" || paymentStatus === "executing") {
        return (
            <div className="p-6 bg-card/50 rounded-lg border border-purple-500/30">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-purple-400">
                            {paymentStatus === "signing" ? "Preparing..." : "Processing..."}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{statusMessage}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Render: Ready to pay
    return (
        <div className={cn(
            "beep-checkout-container",
            showModal && "fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        )}>
            <div className={cn(
                "bg-card rounded-lg overflow-hidden border border-border",
                showModal && "max-w-md w-full mx-4"
            )}>
                {/* Header */}
                <div className="p-4 border-b border-border bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Pay with USDC</h3>
                            <p className="text-xs text-muted-foreground">Direct wallet transfer on Sui</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">${amount}</p>
                            <p className="text-xs text-muted-foreground">{currency}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="p-6 space-y-4">
                    <div className="bg-black/30 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="text-white font-medium">{amount} {currency}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Recipient</span>
                            <span className="text-white font-mono text-xs">
                                {recipient.slice(0, 8)}...{recipient.slice(-6)}
                            </span>
                        </div>
                        {description && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">For</span>
                                <span className="text-white">{description}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Network</span>
                            <span className="text-white capitalize">
                                {process.env.NEXT_PUBLIC_SUI_NETWORK || "mainnet"}
                            </span>
                        </div>
                    </div>

                    {!account ? (
                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                            <p className="text-sm text-yellow-400">
                                Please connect your wallet to make a payment
                            </p>
                        </div>
                    ) : (
                        <button
                            onClick={handlePayment}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Pay {amount} {currency}
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-card/50 border-t border-border">
                    <p className="text-xs text-center text-muted-foreground">
                        Payment secured by Sui blockchain • Non-custodial
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook to use Beep payments programmatically
 */
export function useBeepPayment() {
    const account = useCurrentAccount();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [receipt, setReceipt] = useState<BeepPaymentReceipt | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const initiatePayment = async (
        amount: string,
        currency: string,
        recipient: string,
        nonce: string
    ): Promise<BeepPaymentReceipt | null> => {
        if (!account) {
            setError(new Error("Wallet not connected"));
            return null;
        }

        setIsProcessing(true);
        setError(null);

        try {
            console.warn("[Beep Demo] This is a simulated payment. For real payments, use the Beep Checkout component.");

            await new Promise((resolve) => setTimeout(resolve, 2000));

            const network = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "sui-mainnet" : "sui-testnet";

            const mockReceipt: BeepPaymentReceipt = {
                id: `demo_rcpt_${Date.now()}`,
                payer: account.address,
                merchant: recipient,
                amount,
                asset: currency,
                chain: network,
                txHash: `0xDEMO_${Array.from({ length: 58 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
                signature: `0xDEMO_SIG_${Date.now().toString(16)}`,
                issuedAt: Math.floor(Date.now() / 1000),
            };

            setReceipt(mockReceipt);
            setIsProcessing(false);
            return mockReceipt;
        } catch (err) {
            const error = err instanceof Error ? err : new Error("Payment failed");
            setError(error);
            setIsProcessing(false);
            return null;
        }
    };

    const resetPayment = () => {
        setPaymentUrl(null);
        setReceipt(null);
        setError(null);
        setIsProcessing(false);
    };

    return {
        initiatePayment,
        resetPayment,
        isProcessing,
        paymentUrl,
        receipt,
        error,
        isWalletConnected: !!account,
    };
}

export default BeepCheckout;
