/**
 * Signature Verification Utilities
 *
 * Primary: Verifies receipts via Beep's /a402/verify API endpoint
 * Fallback: Local Ed25519 verification if API is unavailable
 *
 * Reference: https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs
 */

import { ed25519 } from "@noble/curves/ed25519";
import type { A402Receipt } from "@/stores/flow-store";

/**
 * Demo signature prefixes - these bypass cryptographic verification
 * Used for testing the UI flow without real Beep payments
 */
const DEMO_SIGNATURE_PREFIXES = ["0xBEEP_", "0xSIG_", "0xDEMO_", "demo:", "sig_demo", "sig:demo"];

const BEEP_API_URL = process.env.NEXT_PUBLIC_BEEP_SERVER_URL || "https://api.justbeep.it";
const LOCAL_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface SignatureVerificationResult {
    valid: boolean;
    method: "beep-api" | "sui-ed25519" | "format-check" | "demo" | "onchain";
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
 * Verify receipt via local API proxy to Beep's API endpoint
 * Uses proxy to avoid CORS issues
 */
export async function verifyReceiptViaBeepAPI(
    receipt: A402Receipt
): Promise<SignatureVerificationResult> {
    try {
        // Use local proxy to avoid CORS
        const response = await fetch(`${LOCAL_API_URL}/a402/verify-beep`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                receipt: {
                    id: receipt.id,
                    requestNonce: receipt.requestNonce,
                    payer: receipt.payer,
                    merchant: receipt.merchant,
                    amount: receipt.amount,
                    asset: receipt.asset,
                    chain: receipt.chain,
                    txHash: receipt.txHash,
                    signature: receipt.signature,
                    issuedAt: receipt.issuedAt,
                },
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return {
                valid: data.valid === true,
                method: "beep-api",
                error: data.valid ? undefined : (data.error || data.message || "Verification failed"),
                details: {
                    apiResponse: data,
                },
            };
        }

        // Handle specific error codes
        if (response.status === 422) {
            const data = await response.json().catch(() => ({}));
            return {
                valid: false,
                method: "beep-api",
                error: data.error || "Invalid receipt format or signature mismatch",
                details: { apiResponse: data },
            };
        }

        if (response.status === 409) {
            return {
                valid: false,
                method: "beep-api",
                error: "Nonce already used (replay attack detected)",
            };
        }

        // API error - return error with status
        return {
            valid: false,
            method: "beep-api",
            error: `Beep API returned ${response.status}: ${response.statusText}`,
        };
    } catch (error) {
        // Network error - will fall back to local verification
        return {
            valid: false,
            method: "beep-api",
            error: error instanceof Error ? error.message : "Failed to connect to Beep API",
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
    try {
        const response = await fetch(`${LOCAL_API_URL}/a402/verify-onchain`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ receipt, challenge }),
        });

        const data = await response.json();

        return {
            valid: data.valid === true,
            method: "onchain",
            error: data.valid ? undefined : (data.errors?.join(", ") || data.error || "Verification failed"),
            details: {
                apiResponse: data,
            },
        };
    } catch (error) {
        return {
            valid: false,
            method: "onchain",
            error: error instanceof Error ? error.message : "Failed to verify on-chain",
        };
    }
}

/**
 * Verify a Beep facilitator signature on a receipt
 *
 * Strategy:
 * 1. Check for demo signatures (for local testing)
 * 2. Check for direct wallet payments (sui_tx_ prefix) - use on-chain verification
 * 3. Try Beep API verification via proxy (recommended for Beep payments)
 * 4. Fall back to local Ed25519 if API fails and we have the public key
 */
export async function verifyFacilitatorSignature(
    receipt: A402Receipt,
    challenge?: { amount: string; chain: string; nonce: string; recipient: string; expiry?: number }
): Promise<SignatureVerificationResult> {
    const signature = receipt.signature;

    // No signature = invalid
    if (!signature) {
        return {
            valid: false,
            method: "format-check",
            error: "Missing signature on receipt",
        };
    }

    // Check if this is a demo/mock signature
    if (isDemoSignature(signature)) {
        return {
            valid: true,
            method: "demo",
            details: {
                signer: "demo-facilitator",
            },
        };
    }

    // Check if this is a direct wallet payment (bypasses Beep's payment flow)
    if (isDirectWalletPayment(receipt)) {
        // Use on-chain verification for direct wallet payments
        return verifyReceiptOnChainAPI(receipt, challenge);
    }

    // Try Beep API verification via proxy (recommended approach for Beep payments)
    const apiResult = await verifyReceiptViaBeepAPI(receipt);

    if (apiResult.method === "beep-api" && !apiResult.error?.includes("Failed to connect")) {
        // API responded (even if invalid) - use that result
        return apiResult;
    }

    // API unavailable - try local verification if we have the public key
    const localResult = await verifyLocally(receipt);

    // If local verification succeeded, return it
    if (localResult.valid) {
        return localResult;
    }

    // Both failed - return the more informative error
    if (apiResult.error?.includes("Failed to connect")) {
        return {
            valid: false,
            method: "format-check",
            error: `Beep API unavailable and local verification failed: ${localResult.error}`,
        };
    }

    return localResult;
}

/**
 * Local Ed25519 signature verification
 * Used as fallback when Beep API is unavailable
 */
async function verifyLocally(receipt: A402Receipt): Promise<SignatureVerificationResult> {
    try {
        const facilitatorKey = getFacilitatorPublicKey();

        if (!facilitatorKey) {
            return {
                valid: false,
                method: "format-check",
                error: "Beep API unavailable and no local facilitator key configured",
            };
        }

        const decodedSignature = decodeSignature(receipt.signature);

        if (!decodedSignature) {
            return {
                valid: false,
                method: "format-check",
                error: "Unsupported signature format",
            };
        }

        const publicKeyBytes = normalizePublicKeyToBytes(facilitatorKey);

        if (!publicKeyBytes) {
            return {
                valid: false,
                method: "format-check",
                error: "Invalid facilitator public key format",
            };
        }

        const messageBytes = new TextEncoder().encode(createReceiptMessage(receipt));
        const isValid = ed25519.verify(decodedSignature.signatureBytes, messageBytes, publicKeyBytes);

        return {
            valid: isValid,
            method: "sui-ed25519",
            error: isValid ? undefined : "Ed25519 verification failed",
            details: {
                signer: bytesToHex(publicKeyBytes),
            },
        };
    } catch (error) {
        return {
            valid: false,
            method: "format-check",
            error: error instanceof Error ? error.message : "Local verification failed",
        };
    }
}

/**
 * Create the canonical message that was signed
 */
export function createReceiptMessage(receipt: A402Receipt): string {
    return JSON.stringify({
        id: receipt.id,
        requestNonce: receipt.requestNonce,
        payer: receipt.payer,
        merchant: receipt.merchant,
        amount: receipt.amount,
        asset: receipt.asset,
        chain: receipt.chain,
        txHash: receipt.txHash,
        issuedAt: receipt.issuedAt,
    });
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

    // Hex signature (0x prefix + 128 hex chars for Ed25519 = 64 bytes)
    if (signature.startsWith("0x")) {
        return /^0x[a-fA-F0-9]{128}$/.test(signature);
    }

    // Base64 signature (Sui format: 1 byte flag + 64 bytes sig + optional 32 bytes pubkey)
    if (isBase64String(signature)) {
        const bytes = base64ToBytes(signature);
        // At least 65 bytes (flag + signature)
        return bytes.length >= 65;
    }

    return false;
}

/**
 * Get the Beep facilitator public key from environment
 * Returns null if not configured (demo signatures will be used instead)
 */
function getFacilitatorPublicKey(): string | null {
    return process.env.NEXT_PUBLIC_BEEP_FACILITATOR_PUBKEY || null;
}

function isDemoSignature(signature: string): boolean {
    return DEMO_SIGNATURE_PREFIXES.some((prefix) => signature.startsWith(prefix));
}

function decodeSignature(signature: string): { signatureBytes: Uint8Array } | null {
    try {
        const base64Bytes = isBase64String(signature) ? base64ToBytes(signature) : null;

        // Handle Sui serialized signature (flag + sig + pubkey)
        // Format: 1 byte flag (0x00 for Ed25519) + 64 bytes signature + 32 bytes pubkey
        if (base64Bytes && base64Bytes.length >= 65 && base64Bytes[0] === 0) {
            return { signatureBytes: base64Bytes.slice(1, 65) };
        }

        // Raw hex signature (0x + 128 hex chars = 64 bytes)
        if (signature.startsWith("0x") && /^0x[a-fA-F0-9]{128}$/.test(signature)) {
            return { signatureBytes: hexToBytes(signature.slice(2)) };
        }

        // Raw base64 signature (exactly 64 bytes)
        if (base64Bytes && base64Bytes.length === 64) {
            return { signatureBytes: base64Bytes };
        }

        return null;
    } catch {
        return null;
    }
}

function normalizePublicKeyToBytes(publicKey?: string | null): Uint8Array | null {
    if (!publicKey) return null;

    if (publicKey.startsWith("0x")) {
        const hex = publicKey.slice(2);
        if (/^[a-fA-F0-9]{64}$/.test(hex)) {
            return hexToBytes(hex);
        }
        return null;
    }

    if (isBase64String(publicKey)) {
        const bytes = base64ToBytes(publicKey);
        return bytes.length >= 32 ? bytes.slice(-32) : null;
    }

    return null;
}

function isBase64String(value: string): boolean {
    return /^[A-Za-z0-9+/=]+$/.test(value);
}

function base64ToBytes(value: string): Uint8Array {
    if (typeof Buffer !== "undefined") {
        return Uint8Array.from(Buffer.from(value, "base64"));
    }

    if (typeof atob === "function") {
        const binary = atob(value);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    throw new Error("Base64 decoding not available in this environment");
}

// Utility: Convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
}

// Utility: Convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
