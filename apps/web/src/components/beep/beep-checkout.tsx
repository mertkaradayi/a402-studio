"use client";

import React, { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { cn } from "@/lib/utils";

// Dynamic import for Beep CheckoutWidget to avoid SSR issues
// Using 'any' for the component type since the actual types come from the SDK
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let CheckoutWidget: React.ComponentType<any> | null = null;

// Try to import the Beep widget
if (typeof window !== "undefined") {
    import("@beep-it/checkout-widget")
        .then((mod) => {
            CheckoutWidget = mod.CheckoutWidget;
        })
        .catch((err) => {
            console.warn("Beep Checkout Widget not available:", err);
        });
}

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
 * Wraps the official Beep Checkout Widget for USDC payments on Sui.
 * Displays a QR code for mobile wallets and handles payment verification.
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
    const [isLoading, setIsLoading] = useState(true);
    const [widgetReady, setWidgetReady] = useState(false);

    useEffect(() => {
        // Check if widget is loaded
        const checkWidget = setInterval(() => {
            if (CheckoutWidget) {
                setWidgetReady(true);
                setIsLoading(false);
                clearInterval(checkWidget);
            }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
            clearInterval(checkWidget);
            setIsLoading(false);
        }, 5000);

        return () => clearInterval(checkWidget);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            </div>
        );
    }

    if (!widgetReady || !CheckoutWidget) {
        // Fallback UI when widget is not available
        return (
            <div className="p-6 bg-card/50 rounded-lg border border-border">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Beep Payment</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pay {amount} {currency} to complete this transaction
                        </p>
                    </div>
                    <div className="bg-black/50 rounded-lg p-4 text-left">
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p><span className="text-white">Amount:</span> {amount} {currency}</p>
                            <p><span className="text-white">Recipient:</span> {recipient.slice(0, 20)}...</p>
                            {description && <p><span className="text-white">Description:</span> {description}</p>}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Install Beep Checkout Widget for the full payment experience
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("beep-checkout-container", showModal && "fixed inset-0 z-50 flex items-center justify-center bg-black/80")}>
            <div className={cn("bg-card rounded-lg overflow-hidden", showModal && "max-w-md w-full mx-4")}>
                <CheckoutWidget
                    publishableKey={process.env.NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY || "demo-key"}
                    primaryColor={primaryColor}
                    labels={{
                        scanQr: "Scan to Pay with USDC",
                        paymentLabel: description || "a402 Playground Payment",
                    }}
                    assets={[
                        {
                            name: description || "Payment",
                            price: amount,
                            quantity: 1,
                            description: `Pay ${amount} ${currency} to ${recipient.slice(0, 10)}...`,
                        },
                    ]}
                    serverUrl={process.env.NEXT_PUBLIC_BEEP_SERVER_URL}
                />
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
            // For demo purposes, simulate Beep payment flow
            // In production, this would use the Beep SDK
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const mockReceipt: BeepPaymentReceipt = {
                id: `beep_rcpt_${Date.now()}`,
                payer: account.address,
                merchant: recipient,
                amount,
                asset: currency,
                chain: "sui-testnet",
                txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
                signature: `0xBEEP_${Date.now().toString(16)}`,
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
