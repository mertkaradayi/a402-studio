"use client";

import { useState } from "react";
import { useFlowStore } from "@/stores/flow-store";
import { cn } from "@/lib/utils";
import { verifyFacilitatorSignature, isValidSignatureFormat, type SignatureVerificationResult } from "@/lib/signature-verification";

export function VerifyTab() {
  const {
    challenge,
    receipt,
    verificationResult,
    setVerificationResult,
    addDebugLog,
    isLoading,
    setLoading,
  } = useFlowStore();

  const [signatureDetails, setSignatureDetails] = useState<SignatureVerificationResult | null>(null);

  const handleVerify = async () => {
    if (!receipt || !challenge) return;

    setLoading(true);
    addDebugLog("info", "Verifying receipt with cryptographic checks...");

    // Simulate network delay for UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 1. Basic field matching
    const amountMatch = receipt.amount === challenge.amount;
    const chainMatch = receipt.chain === challenge.chain;
    const nonceValid = receipt.requestNonce === challenge.nonce;
    const notExpired = challenge.expiry ? challenge.expiry > Math.floor(Date.now() / 1000) : true;
    const recipientMatch = receipt.merchant === challenge.recipient;

    // 2. Real signature verification via Beep API (or on-chain for direct payments)
    addDebugLog("info", "Verifying receipt signature...");
    const sigResult = await verifyFacilitatorSignature(receipt, challenge);
    setSignatureDetails(sigResult);

    const signatureValid = sigResult.valid;

    // Log the verification method
    const methodLabels: Record<string, string> = {
      "beep-api": "Beep API",
      "sui-ed25519": "Local Ed25519",
      "format-check": "Format Check",
      "demo": "Demo Mode",
      "onchain": "On-Chain Verification",
    };

    addDebugLog(
      signatureValid ? "success" : "error",
      `Signature: ${signatureValid ? "VALID" : "INVALID"} (via ${methodLabels[sigResult.method]})`
    );

    if (sigResult.method === "beep-api" && sigResult.details?.apiResponse) {
      addDebugLog("info", `API Response: ${JSON.stringify(sigResult.details.apiResponse)}`);
    }

    if (sigResult.error && !signatureValid) {
      addDebugLog("warning", `Verification error: ${sigResult.error}`);
    }

    const errors: string[] = [];
    if (!amountMatch)
      errors.push(`Amount mismatch: expected ${challenge.amount}, got ${receipt.amount}`);
    if (!chainMatch)
      errors.push(`Chain mismatch: expected ${challenge.chain}, got ${receipt.chain}`);
    if (!nonceValid)
      errors.push("Nonce mismatch or already used");
    if (!signatureValid)
      errors.push(sigResult.error || "Invalid facilitator signature");
    if (!notExpired)
      errors.push("Challenge has expired");
    if (!recipientMatch)
      errors.push(`Recipient mismatch: expected ${challenge.recipient}, got ${receipt.merchant}`);

    const result = {
      valid: amountMatch && chainMatch && nonceValid && signatureValid && notExpired && recipientMatch,
      errors,
      checks: {
        amountMatch,
        chainMatch,
        nonceValid,
        signatureValid,
        notExpired,
        recipientMatch,
      },
    };

    if (result.valid) {
      addDebugLog("success", "Receipt verification PASSED - All checks passed!");
    } else {
      addDebugLog("error", `Receipt verification FAILED - ${errors.length} error(s)`);
      errors.forEach((err) => addDebugLog("error", `  → ${err}`));
    }

    setVerificationResult(result);
    setLoading(false);
  };

  if (!receipt) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-sm">
          {/* Shield Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20 border border-neon-cyan/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">
            Receipt Verification
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Complete a payment first to get a receipt that can be verified against the challenge.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-neon-cyan">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Make a payment in the Receipt tab first
          </div>
        </div>
      </div>
    );
  }

  if (!verificationResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-center">
          {/* Receipt Preview Card */}
          <div className="bg-gradient-to-br from-neon-cyan/10 to-neon-pink/10 border border-neon-cyan/30 rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-5 h-5 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-white">Ready to Verify</span>
            </div>
            <div className="text-xs font-mono text-neon-cyan bg-black/30 px-3 py-1.5 rounded-lg">
              {receipt.id}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {receipt.amount} {receipt.asset} on {receipt.chain}
            </div>
          </div>
        </div>
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="px-8 py-3 bg-neon-cyan text-black font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-cyan flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verify Receipt
            </>
          )}
        </button>
        <p className="text-xs text-muted-foreground max-w-sm text-center">
          This will check amount, chain, nonce, signature, and expiry against the original challenge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Verdict */}
      <div
        className={cn(
          "p-6 rounded-lg border text-center",
          verificationResult.valid
            ? "bg-neon-green/10 border-neon-green/30"
            : "bg-red-500/10 border-red-500/30"
        )}
      >
        <div
          className={cn(
            "text-4xl font-bold mb-2",
            verificationResult.valid ? "text-neon-green" : "text-red-400"
          )}
        >
          {verificationResult.valid ? "VALID" : "INVALID"}
        </div>
        <p className="text-sm text-muted-foreground">
          {verificationResult.valid
            ? "This receipt is verified and can be trusted."
            : "This receipt failed verification."}
        </p>
      </div>

      {/* Line-by-line checks */}
      <div>
        <h3 className="text-xs font-semibold text-neon-yellow uppercase tracking-wide mb-3">
          Verification Checks
        </h3>
        <div className="bg-black rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {Object.entries(verificationResult.checks).map(([key, passed]) => (
                <tr key={key}>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-medium",
                        passed ? "text-neon-green" : "text-red-400"
                      )}
                    >
                      {passed ? "PASS" : "FAIL"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error details */}
      {verificationResult.errors.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">
            Errors
          </h3>
          <div className="bg-red-500/5 rounded-lg border border-red-500/20 p-4 space-y-2">
            {verificationResult.errors.map((error, i) => (
              <div key={i} className="text-sm text-red-400 flex items-start gap-2">
                <span className="text-red-500">×</span>
                {error}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
