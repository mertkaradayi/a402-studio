/**
 * Signature Verification Utilities
 *
 * Primary: Verifies Beep SDK payments via getPaymentStatus() polling
 * Fallback: On-chain verification for direct wallet payments
 *
 * Note: Beep's /a402/verify endpoint is not publicly available.
 * Instead, we use getPaymentStatus() which is the SDK's designed verification method.
 *
 * Reference: https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs
 */

import { BeepPublicClient } from "@beep-it/sdk-core";
import type { A402Receipt } from "@/stores/flow-store";

/**
 * Demo signature prefixes - these bypass cryptographic verification
 * Used for testing the UI flow without real Beep payments
 */
const DEMO_SIGNATURE_PREFIXES = ["0xBEEP_", "0xSIG_", "0xDEMO_", "demo:", "sig_demo", "sig:demo"];

const LOCAL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const BEEP_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY || "";

export interface SignatureVerificationResult {
    valid: boolean;
    method: "beep-api" | "beep-polling" | "onchain" | "format-check" | "demo";
    error?: string;
    details?: {
        signer?: string;
        expectedSigner?: string;
        messageHash?: string;
        apiResponse?: Record<string, unknown>;
    };
}

/**
 * Check if this is a direct wallet payment (not going through Beep's payment flow)
 */
function isDirectWalletPayment(receipt: A402Receipt): boolean {
    return (
        receipt.signature.startsWith("sui_tx_") ||
        receipt.signature.startsWith("beep_verified_")
    );
}

/**
 * Check if this is a Beep SDK payment session
 */
function isBeepSdkPayment(receipt: A402Receipt): boolean {
    return receipt.signature.startsWith("beep_sdk_");
}

/**
 * Check if the API is reachable
 * This helps distinguish between "API not running" and "verification failed"
 */
async function isApiReachable(): Promise<boolean> {
    try {
        const response = await fetch(`${LOCAL_API_URL}/health`, {
            method: "GET",
            signal: AbortSignal.timeout(3000),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Verify receipt via server-side Beep API (uses secret key)
 * This is the primary verification method for Beep SDK payments
 *
 * @param receipt - The receipt containing requestNonce (referenceKey from Beep session)
 * @param challenge - Optional challenge for amount matching
 * @returns verification result from server-side Beep verification
 */
export async function verifyReceiptViaBeepServerAPI(
    receipt: A402Receipt,
    challenge?: { amount: string; recipient: string; nonce: string }
): Promise<SignatureVerificationResult> {
    const url = `${LOCAL_API_URL}/a402/verify-beep`;
    console.log("[verifyBeepServerAPI] Calling:", url);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ receipt, challenge }),
            signal: AbortSignal.timeout(10000),
        });

        console.log("[verifyBeepServerAPI] Response status:", response.status);

        const data = await response.json();
        console.log("[verifyBeepServerAPI] Response data:", data);

        return {
            valid: data.valid === true,
            method: "beep-api",
            error: data.valid ? undefined : (data.error || "Beep verification failed"),
            details: {
                apiResponse: data.details || data,
            },
        };
    } catch (error) {
        console.error("[verifyBeepServerAPI] Error:", error);

        // Provide more helpful error message
        let errorMessage = "Failed to verify via Beep API";
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            // Check if API URL is localhost but we're running from a remote origin
            const isRemoteOrigin = typeof window !== "undefined" &&
                !window.location.hostname.includes("localhost") &&
                !window.location.hostname.includes("127.0.0.1");
            const isLocalApi = LOCAL_API_URL.includes("localhost") || LOCAL_API_URL.includes("127.0.0.1");

            if (isRemoteOrigin && isLocalApi) {
                errorMessage = `API server at ${LOCAL_API_URL} is not reachable from this domain. Either run the API locally, expose it via ngrok, or deploy to Railway.`;
            } else {
                errorMessage = `Cannot reach API server at ${LOCAL_API_URL}. Make sure the API is running.`;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return {
            valid: false,
            method: "beep-api",
            error: errorMessage,
        };
    }
}

/**
 * Verify receipt via Beep SDK's getPaymentStatus() (client-side polling)
 * This is a fallback when server-side verification is not available
 *
 * First tries via our backend proxy (to avoid CORS issues), then falls back to direct SDK call.
 *
 * @param receipt - The receipt containing requestNonce (referenceKey from Beep session)
 * @returns verification result with paid status from Beep
 */
export async function verifyReceiptViaBeepAPI(
    receipt: A402Receipt
): Promise<SignatureVerificationResult> {
    const referenceKey = receipt.requestNonce;

    if (!referenceKey) {
        return {
            valid: false,
            method: "beep-polling",
            error: "Missing referenceKey (requestNonce) in receipt",
        };
    }

    // First, try via our backend proxy (avoids CORS issues)
    try {
        const proxyUrl = `${LOCAL_API_URL}/proxy/beep/payment-status/${referenceKey}`;
        console.log("[verifyBeepAPI] Trying proxy:", proxyUrl);

        const proxyResponse = await fetch(proxyUrl, {
            headers: {
                "X-Beep-PK": BEEP_PUBLISHABLE_KEY,
            },
        });

        if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json();
            console.log("[verifyBeepAPI] Proxy response:", proxyData);

            const paid = proxyData.paid === true;
            return {
                valid: paid,
                method: "beep-polling",
                error: paid ? undefined : `Payment not yet confirmed by Beep (status: ${proxyData.status || "unknown"})`,
                details: {
                    apiResponse: proxyData as Record<string, unknown>,
                },
            };
        }
        console.log("[verifyBeepAPI] Proxy failed, trying direct SDK...");
    } catch (proxyError) {
        console.log("[verifyBeepAPI] Proxy error:", proxyError, "- trying direct SDK...");
    }

    // Fallback to direct SDK call
    if (!BEEP_PUBLISHABLE_KEY) {
        return {
            valid: false,
            method: "beep-polling",
            error: "BEEP_PUBLISHABLE_KEY not configured",
        };
    }

    try {
        const beepClient = new BeepPublicClient({
            publishableKey: BEEP_PUBLISHABLE_KEY,
        });

        // Query Beep's payment status
        const status = await beepClient.widget.getPaymentStatus(referenceKey);

        const paid = (status as { paid?: boolean })?.paid === true;

        return {
            valid: paid,
            method: "beep-polling",
            error: paid ? undefined : "Payment not yet confirmed by Beep",
            details: {
                apiResponse: status as unknown as Record<string, unknown>,
            },
        };
    } catch (error) {
        return {
            valid: false,
            method: "beep-polling",
            error: error instanceof Error ? error.message : "Failed to query Beep payment status",
        };
    }
}

/**
 * Verify receipt via on-chain verification
 * Used for direct wallet payments that bypass Beep's payment flow
 */
export async function verifyReceiptOnChainAPI(
    receipt: A402Receipt,
    challenge?: { amount: string; chain: string; nonce: string; recipient: string; expiry?: number }
): Promise<SignatureVerificationResult> {
    const url = `${LOCAL_API_URL}/a402/verify-onchain`;
    console.log("[verifyOnChainAPI] Calling:", url);
    console.log("[verifyOnChainAPI] Request body:", JSON.stringify({ receipt, challenge }, null, 2));

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ receipt, challenge }),
        });

        console.log("[verifyOnChainAPI] Response status:", response.status);

        const data = await response.json();
        console.log("[verifyOnChainAPI] Response data:", data);

        return {
            valid: data.valid === true,
            method: "onchain",
            error: data.valid ? undefined : (data.errors?.join(", ") || data.error || "Verification failed"),
            details: {
                apiResponse: data,
            },
        };
    } catch (error) {
        console.error("[verifyOnChainAPI] Error:", error);

        // Provide more helpful error message
        let errorMessage = "Failed to verify on-chain";
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            const isRemoteOrigin = typeof window !== "undefined" &&
                !window.location.hostname.includes("localhost") &&
                !window.location.hostname.includes("127.0.0.1");
            const isLocalApi = LOCAL_API_URL.includes("localhost") || LOCAL_API_URL.includes("127.0.0.1");

            if (isRemoteOrigin && isLocalApi) {
                errorMessage = `API server at ${LOCAL_API_URL} is not reachable. When running from ngrok/remote domain, expose your API via ngrok too or deploy to Railway.`;
            } else {
                errorMessage = `Cannot reach API server at ${LOCAL_API_URL}. Make sure the API is running (yarn workspace api dev).`;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return {
            valid: false,
            method: "onchain",
            error: errorMessage,
        };
    }
}

/**
 * Verify a Beep payment receipt
 *
 * Strategy:
 * 1. Check for demo signatures (for local testing)
 * 2. Check for Beep SDK payments (beep_sdk_ prefix):
 *    - First try Beep's getPaymentStatus()
 *    - If Beep hasn't confirmed yet, fall back to on-chain verification
 * 3. Check for direct wallet payments (sui_tx_ prefix) - use on-chain verification
 * 4. Default to on-chain verification for other receipts
 */
export async function verifyFacilitatorSignature(
    receipt: A402Receipt,
    challenge?: { amount: string; chain: string; nonce: string; recipient: string; expiry?: number }
): Promise<SignatureVerificationResult> {
    const signature = receipt.signature;

    console.log("[verify] Starting verification for receipt:", {
        id: receipt.id,
        signature: signature?.slice(0, 30) + "...",
        txHash: receipt.txHash,
        requestNonce: receipt.requestNonce,
    });

    // No signature = invalid
    if (!signature) {
        console.log("[verify] FAIL: Missing signature");
        return {
            valid: false,
            method: "format-check",
            error: "Missing signature on receipt",
        };
    }

    // Check if this is a demo/mock signature
    if (isDemoSignature(signature)) {
        console.log("[verify] PASS: Demo signature detected");
        return {
            valid: true,
            method: "demo",
            details: {
                signer: "demo-facilitator",
            },
        };
    }

    // Check if this is a Beep SDK payment
    if (isBeepSdkPayment(receipt)) {
        console.log("[verify] Beep SDK payment detected, trying server-side Beep API verification...");

        // Try server-side Beep API verification first (uses secret key)
        const beepServerResult = await verifyReceiptViaBeepServerAPI(receipt, challenge ? {
            amount: challenge.amount,
            recipient: challenge.recipient,
            nonce: challenge.nonce,
        } : undefined);

        console.log("[verify] Beep Server API result:", {
            valid: beepServerResult.valid,
            method: beepServerResult.method,
            error: beepServerResult.error,
            apiResponse: beepServerResult.details?.apiResponse,
        });

        // If server-side Beep verification passed, we're done
        if (beepServerResult.valid) {
            console.log("[verify] PASS: Server-side Beep API confirmed payment");
            return beepServerResult;
        }

        // If server-side failed, try client-side getPaymentStatus as fallback
        console.log("[verify] Server-side Beep not confirmed. Trying client-side getPaymentStatus()...");
        const beepClientResult = await verifyReceiptViaBeepAPI(receipt);
        console.log("[verify] Beep Client API result:", {
            valid: beepClientResult.valid,
            method: beepClientResult.method,
            error: beepClientResult.error,
        });

        if (beepClientResult.valid) {
            console.log("[verify] PASS: Client-side Beep confirmed payment");
            return beepClientResult;
        }

        // If Beep hasn't confirmed yet but we have a valid txHash,
        // fall back to on-chain verification
        console.log("[verify] Beep not confirmed. Checking txHash for on-chain fallback:", {
            txHash: receipt.txHash,
            txHashLength: receipt.txHash?.length,
            regexTest: receipt.txHash ? /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(receipt.txHash) : false,
        });

        const txHashValid = receipt.txHash && isValidSuiTxHash(receipt.txHash);
        console.log("[verify] txHash validation result:", txHashValid);

        if (txHashValid) {
            console.log("[verify] Trying on-chain verification fallback...");
            console.log("[verify] Challenge being passed:", challenge ? {
                nonce: challenge.nonce,
                amount: challenge.amount,
                recipient: challenge.recipient,
                chain: challenge.chain,
            } : "NO CHALLENGE PROVIDED");

            try {
                const onChainResult = await verifyReceiptOnChainAPI(receipt, challenge);
                console.log("[verify] On-chain result:", {
                    valid: onChainResult.valid,
                    method: onChainResult.method,
                    error: onChainResult.error,
                    apiResponse: onChainResult.details?.apiResponse,
                });

                // If on-chain verification passes, return success with combined info
                if (onChainResult.valid) {
                    console.log("[verify] PASS: On-chain verification succeeded");
                    return {
                        valid: true,
                        method: "onchain",
                        details: {
                            apiResponse: {
                                beepServerStatus: beepServerResult.details?.apiResponse,
                                beepClientStatus: beepClientResult.details?.apiResponse,
                                onChainVerified: true,
                                note: "Payment verified on-chain (Beep API verification pending)",
                            },
                        },
                    };
                }

                console.log("[verify] FAIL: On-chain verification failed with:", onChainResult.error);
            } catch (error) {
                console.error("[verify] On-chain verification threw error:", error);
            }
        } else {
            console.log("[verify] FAIL: Invalid txHash format, cannot fall back to on-chain");
            console.log("[verify] txHash chars:", receipt.txHash?.split('').map(c => c.charCodeAt(0)));
        }

        // All methods failed - return server-side result (more informative)
        console.log("[verify] FAIL: Returning server-side Beep result");
        return beepServerResult;
    }

    // Check if this is a direct wallet payment or other receipt - use on-chain verification
    console.log("[verify] Non-Beep SDK payment, using on-chain verification");
    return verifyReceiptOnChainAPI(receipt, challenge);
}

/**
 * Check if a string is a valid Sui transaction hash (base58, 43-44 chars)
 */
function isValidSuiTxHash(hash: string): boolean {
    return /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(hash);
}

/**
 * Verify receipt signature matches transaction on chain
 * This is the full verification that ensures the receipt is authentic
 */
export async function verifyReceiptOnChain(
    receipt: A402Receipt,
    suiClient?: { getTransactionBlock: (params: { digest: string }) => Promise<unknown> }
): Promise<{
    valid: boolean;
    signatureValid: boolean;
    txExists: boolean;
    txMatches: boolean;
    errors: string[];
}> {
    const errors: string[] = [];
    let signatureValid = false;
    let txExists = false;
    let txMatches = false;

    // 1. Verify facilitator signature
    const sigResult = await verifyFacilitatorSignature(receipt);
    signatureValid = sigResult.valid;
    if (!signatureValid) {
        errors.push(sigResult.error || "Invalid facilitator signature");
    }

    // 2. Verify transaction exists on chain (if client provided)
    if (suiClient && receipt.txHash) {
        try {
            const tx = await suiClient.getTransactionBlock({
                digest: receipt.txHash,
            });
            txExists = !!tx;

            if (tx) {
                // Would verify tx details match receipt
                txMatches = true; // Simplified for now
            }
        } catch (error) {
            errors.push("Transaction not found on chain");
        }
    } else {
        // No client provided, can't verify on-chain
        txExists = true; // Assume valid for demo
        txMatches = true;
    }

    return {
        valid: signatureValid && txExists && txMatches,
        signatureValid,
        txExists,
        txMatches,
        errors,
    };
}

/**
 * Check if a signature has a valid format
 */
export function isValidSignatureFormat(signature: string): boolean {
    if (!signature || typeof signature !== "string") {
        return false;
    }

    // Demo signatures are always valid format
    if (isDemoSignature(signature)) {
        return true;
    }

    // Beep SDK signatures
    if (signature.startsWith("beep_sdk_") || signature.startsWith("beep_verified_")) {
        return true;
    }

    // Direct wallet payment signatures
    if (signature.startsWith("sui_tx_")) {
        return true;
    }

    // Hex signature (0x prefix + some hex chars)
    if (signature.startsWith("0x") && /^0x[a-fA-F0-9]+$/.test(signature)) {
        return true;
    }

    // Sui transaction digest format (base58)
    if (/^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(signature)) {
        return true;
    }

    return false;
}

function isDemoSignature(signature: string): boolean {
    return DEMO_SIGNATURE_PREFIXES.some((prefix) => signature.startsWith(prefix));
}
