"use client";

import { useFlowStore } from "@/stores/flow-store";
import { cn } from "@/lib/utils";

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

  const handleVerify = async () => {
    if (!receipt || !challenge) return;

    setLoading(true);
    addDebugLog("info", "Verifying receipt...");

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const amountMatch = receipt.amount === challenge.amount;
    const chainMatch = receipt.chain === challenge.chain;
    const nonceValid = receipt.requestNonce === challenge.nonce;
    const signatureValid = true; // Mock
    const notExpired = challenge.expiry ? challenge.expiry > Math.floor(Date.now() / 1000) : true;
    const recipientMatch = receipt.merchant === challenge.recipient;

    const errors: string[] = [];
    if (!amountMatch)
      errors.push(`Amount mismatch: expected ${challenge.amount}, got ${receipt.amount}`);
    if (!chainMatch)
      errors.push(`Chain mismatch: expected ${challenge.chain}, got ${receipt.chain}`);
    if (!nonceValid)
      errors.push("Nonce mismatch or already used");
    if (!signatureValid)
      errors.push("Invalid signature");
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
      addDebugLog("info", "Receipt verification PASSED");
    } else {
      errors.forEach((err) => addDebugLog("error", err));
    }

    setVerificationResult(result);
    setLoading(false);
  };

  if (!receipt) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4 opacity-20">?</div>
          <p className="text-muted-foreground text-sm">No receipt to verify.</p>
          <p className="text-muted-foreground text-xs mt-1">
            Complete a payment first.
          </p>
        </div>
      </div>
    );
  }

  if (!verificationResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-2">
            Receipt ready for verification
          </p>
          <p className="text-xs font-mono text-neon-cyan">{receipt.id}</p>
        </div>
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="px-8 py-3 bg-neon-cyan text-black font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed glow-cyan"
        >
          {isLoading ? "Verifying..." : "Verify Receipt"}
        </button>
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
