"use client";

import type { VerificationResult } from "@/stores/flow-store";
import { cn } from "@/lib/utils";

interface VerificationDisplayProps {
  result: VerificationResult;
}

export function VerificationDisplay({ result }: VerificationDisplayProps) {
  const checkLabels: Record<keyof VerificationResult["checks"], string> = {
    amountMatch: "Amount matches",
    chainMatch: "Chain matches",
    nonceValid: "Nonce is valid",
    signatureValid: "Signature is valid",
    notExpired: "Not expired",
    recipientMatch: "Recipient matches",
  };

  return (
    <div className="space-y-6">
      {/* Overall Result */}
      <div
        className={cn(
          "p-8 rounded-lg border text-center",
          result.valid
            ? "bg-neon-green/10 border-neon-green/30"
            : "bg-red-500/10 border-red-500/30"
        )}
      >
        <div
          className={cn(
            "text-5xl font-bold mb-2",
            result.valid ? "text-neon-green" : "text-red-400"
          )}
        >
          {result.valid ? "VALID" : "INVALID"}
        </div>
        <p className="text-sm text-muted-foreground">
          {result.valid
            ? "Receipt successfully verifies against the challenge"
            : `${result.errors.length} verification ${result.errors.length === 1 ? "error" : "errors"} found`}
        </p>
      </div>

      {/* Check Details */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Verification Checks
        </h3>
        <div className="bg-black rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <tbody className="divide-y divide-border">
              {Object.entries(result.checks).map(([key, passed]) => (
                <tr key={key}>
                  <td className="px-4 py-3 text-sm text-white">
                    {checkLabels[key as keyof VerificationResult["checks"]]}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-sm font-medium",
                        passed ? "text-neon-green" : "text-red-400"
                      )}
                    >
                      {passed ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          PASS
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          FAIL
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Details */}
      {result.errors.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">
            Error Details
          </h3>
          <div className="space-y-2">
            {result.errors.map((error, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
              >
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-400">{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
