"use client";

import { useState } from "react";
import { useFlowStore, type A402Challenge, type A402Receipt } from "@/stores/flow-store";
import {
  validateChallengeSchema,
  validateReceiptSchema,
  verifyReceiptAgainstChallenge,
} from "@/lib/validators";
import { verifyReceiptViaBeepServerAPI } from "@/lib/signature-verification";
import { cn } from "@/lib/utils";
import { SchemaValidationDisplay } from "../shared/schema-validation-display";
import { VerificationDisplay } from "../shared/verification-display";

type InspectorTab = "challenge" | "receipt" | "verify";

export function InspectorMode() {
  const { addDebugLog } = useFlowStore();

  const [activeTab, setActiveTab] = useState<InspectorTab>("receipt");

  // Challenge inspector state
  const [challengeInput, setChallengeInput] = useState("");
  const [parsedChallenge, setParsedChallenge] = useState<A402Challenge | null>(null);
  const [challengeValidation, setChallengeValidation] = useState<ReturnType<typeof validateChallengeSchema> | null>(null);

  // Receipt inspector state
  const [receiptInput, setReceiptInput] = useState("");
  const [parsedReceipt, setParsedReceipt] = useState<A402Receipt | null>(null);
  const [receiptValidation, setReceiptValidation] = useState<ReturnType<typeof validateReceiptSchema> | null>(null);

  // Verification state
  const [verifyChallenge, setVerifyChallenge] = useState("");
  const [verifyReceipt, setVerifyReceipt] = useState("");
  const [verificationResult, setVerificationResult] = useState<ReturnType<typeof verifyReceiptAgainstChallenge> | null>(null);

  // Beep API verification state
  const [beepVerifying, setBeepVerifying] = useState(false);
  const [beepVerifyResult, setBeepVerifyResult] = useState<{
    valid: boolean;
    method: string;
    error?: string;
    details?: Record<string, unknown>;
  } | null>(null);

  const handleInspectChallenge = () => {
    setChallengeValidation(null);
    setParsedChallenge(null);

    if (!challengeInput.trim()) {
      addDebugLog("warning", "Please paste a challenge to inspect");
      return;
    }

    try {
      const parsed = JSON.parse(challengeInput);
      setParsedChallenge(parsed);
      const validation = validateChallengeSchema(parsed);
      setChallengeValidation(validation);
      addDebugLog(
        validation.valid ? "success" : "warning",
        `Challenge inspection complete. Score: ${validation.score}%`
      );
    } catch {
      addDebugLog("error", "Invalid JSON format for challenge");
      setChallengeValidation({
        valid: false,
        errors: [{ field: "root", message: "Invalid JSON format", severity: "error" }],
        score: 0,
      });
    }
  };

  const handleInspectReceipt = () => {
    setReceiptValidation(null);
    setParsedReceipt(null);

    if (!receiptInput.trim()) {
      addDebugLog("warning", "Please paste a receipt to inspect");
      return;
    }

    try {
      const parsed = JSON.parse(receiptInput);

      // Normalize field names
      const normalized: A402Receipt = {
        id: parsed.id || parsed.receipt_id || "",
        requestNonce: parsed.requestNonce || parsed.request_nonce || "",
        payer: parsed.payer || "",
        merchant: parsed.merchant || parsed.recipient || "",
        amount: parsed.amount || "",
        asset: parsed.asset || "USDC",
        chain: parsed.chain || "",
        txHash: parsed.txHash || parsed.tx_hash || "",
        signature: parsed.signature || "",
        issuedAt: parsed.issuedAt || parsed.issued_at || 0,
      };

      setParsedReceipt(normalized);
      const validation = validateReceiptSchema(parsed);
      setReceiptValidation(validation);
      addDebugLog(
        validation.valid ? "success" : "warning",
        `Receipt inspection complete. Score: ${validation.score}%`
      );
    } catch {
      addDebugLog("error", "Invalid JSON format for receipt");
      setReceiptValidation({
        valid: false,
        errors: [{ field: "root", message: "Invalid JSON format", severity: "error" }],
        score: 0,
      });
    }
  };

  const handleVerify = () => {
    setVerificationResult(null);

    if (!verifyChallenge.trim() || !verifyReceipt.trim()) {
      addDebugLog("warning", "Please provide both challenge and receipt");
      return;
    }

    try {
      const challenge = JSON.parse(verifyChallenge);
      const receiptRaw = JSON.parse(verifyReceipt);

      const receipt: A402Receipt = {
        id: receiptRaw.id || receiptRaw.receipt_id || "",
        requestNonce: receiptRaw.requestNonce || receiptRaw.request_nonce || "",
        payer: receiptRaw.payer || "",
        merchant: receiptRaw.merchant || receiptRaw.recipient || "",
        amount: receiptRaw.amount || "",
        asset: receiptRaw.asset || "USDC",
        chain: receiptRaw.chain || "",
        txHash: receiptRaw.txHash || receiptRaw.tx_hash || "",
        signature: receiptRaw.signature || "",
        issuedAt: receiptRaw.issuedAt || receiptRaw.issued_at || 0,
      };

      const result = verifyReceiptAgainstChallenge(receipt, challenge);
      setVerificationResult(result);
      addDebugLog(
        result.valid ? "success" : "error",
        result.valid ? "Verification PASSED" : `Verification FAILED: ${result.errors.length} issues`
      );
    } catch {
      addDebugLog("error", "Invalid JSON format");
    }
  };

  // Verify receipt via Beep API
  const handleVerifyWithBeepAPI = async () => {
    if (!parsedReceipt) {
      addDebugLog("warning", "Please inspect a receipt first");
      return;
    }

    setBeepVerifying(true);
    setBeepVerifyResult(null);
    addDebugLog("info", "🔐 Verifying receipt via Beep API...");

    try {
      const result = await verifyReceiptViaBeepServerAPI(parsedReceipt);
      setBeepVerifyResult({
        valid: result.valid,
        method: result.method,
        error: result.error,
        details: result.details?.apiResponse as Record<string, unknown> | undefined,
      });

      if (result.valid) {
        addDebugLog("success", `✅ Receipt verified via ${result.method}`);
      } else {
        addDebugLog("warning", `Verification failed: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setBeepVerifyResult({
        valid: false,
        method: "beep-api",
        error: message,
      });
      addDebugLog("error", `Beep API error: ${message}`);
    } finally {
      setBeepVerifying(false);
    }
  };

  const TABS: { id: InspectorTab; label: string }[] = [
    { id: "challenge", label: "Challenge" },
    { id: "receipt", label: "Receipt" },
    { id: "verify", label: "Verify Match" },
  ];

  return (
    <div className="flex h-full">
      {/* Left Panel - Input */}
      <div className="w-[500px] border-r border-border flex-shrink-0 flex flex-col">
        {/* Tab Selector */}
        <div className="border-b border-border bg-black/50">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-6 py-3 text-sm font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "text-neon-green"
                    : "text-muted-foreground hover:text-white"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-green" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "challenge" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-neon-cyan mb-2">
                  Inspect Challenge
                </h3>
                <p className="text-xs text-muted-foreground">
                  Paste a 402 challenge JSON to validate against the a402 schema
                </p>
              </div>
              <textarea
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value)}
                placeholder={`{
  "amount": "0.50",
  "asset": "USDC",
  "chain": "sui-testnet",
  "recipient": "0x...",
  "nonce": "..."
}`}
                className="w-full h-64 px-3 py-2 bg-black border border-border rounded-md text-xs text-white font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan resize-none"
              />
              <button
                onClick={handleInspectChallenge}
                className="w-full px-4 py-2.5 bg-neon-cyan text-black font-semibold rounded-md hover:opacity-90 transition-opacity"
              >
                Inspect Challenge
              </button>
            </div>
          )}

          {activeTab === "receipt" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-neon-pink mb-2">
                  Inspect Receipt
                </h3>
                <p className="text-xs text-muted-foreground">
                  Paste a payment receipt JSON to decode and validate
                </p>
              </div>
              <textarea
                value={receiptInput}
                onChange={(e) => setReceiptInput(e.target.value)}
                placeholder={`{
  "id": "rcpt_...",
  "payer": "0x...",
  "merchant": "0x...",
  "amount": "0.50",
  "txHash": "0x...",
  "signature": "0x..."
}`}
                className="w-full h-64 px-3 py-2 bg-black border border-border rounded-md text-xs text-white font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-pink focus:border-neon-pink resize-none"
              />
              <button
                onClick={handleInspectReceipt}
                className="w-full px-4 py-2.5 bg-neon-pink text-black font-semibold rounded-md hover:opacity-90 transition-opacity"
              >
                Inspect Receipt
              </button>
              {parsedReceipt && (
                <button
                  onClick={handleVerifyWithBeepAPI}
                  disabled={beepVerifying}
                  className="w-full px-4 py-2.5 bg-emerald-500 text-black font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {beepVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "🔐 Verify with Beep API"
                  )}
                </button>
              )}
            </div>
          )}

          {activeTab === "verify" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-neon-yellow mb-2">
                  Verify Receipt Against Challenge
                </h3>
                <p className="text-xs text-muted-foreground">
                  Check if a receipt correctly fulfills a challenge
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Challenge JSON
                </label>
                <textarea
                  value={verifyChallenge}
                  onChange={(e) => setVerifyChallenge(e.target.value)}
                  placeholder='{"amount": "0.50", "nonce": "...", ...}'
                  className="w-full h-28 px-3 py-2 bg-black border border-border rounded-md text-xs text-white font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-yellow focus:border-neon-yellow resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Receipt JSON
                </label>
                <textarea
                  value={verifyReceipt}
                  onChange={(e) => setVerifyReceipt(e.target.value)}
                  placeholder='{"amount": "0.50", "requestNonce": "...", ...}'
                  className="w-full h-28 px-3 py-2 bg-black border border-border rounded-md text-xs text-white font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-yellow focus:border-neon-yellow resize-none"
                />
              </div>
              <button
                onClick={handleVerify}
                className="w-full px-4 py-2.5 bg-neon-yellow text-black font-semibold rounded-md hover:opacity-90 transition-opacity"
              >
                Verify Match
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "challenge" && (
          <>
            {!challengeValidation && !parsedChallenge && (
              <EmptyState
                icon="📋"
                title="Paste a challenge"
                description="Enter a402 challenge JSON on the left to inspect and validate"
              />
            )}
            {challengeValidation && (
              <div className="space-y-6">
                <SchemaValidationDisplay
                  validation={challengeValidation}
                  title="Challenge Schema Validation"
                />
                {parsedChallenge && (
                  <DecodedFieldsTable
                    title="Decoded Challenge"
                    fields={[
                      { label: "amount", value: `${parsedChallenge.amount} ${parsedChallenge.asset}` },
                      { label: "chain", value: parsedChallenge.chain },
                      { label: "recipient", value: parsedChallenge.recipient },
                      { label: "nonce", value: parsedChallenge.nonce },
                      { label: "expiry", value: parsedChallenge.expiry ? new Date(parsedChallenge.expiry * 1000).toISOString() : "N/A" },
                    ]}
                  />
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "receipt" && (
          <>
            {!receiptValidation && !parsedReceipt && (
              <EmptyState
                icon="🧾"
                title="Paste a receipt"
                description="Enter a402 receipt JSON on the left to decode and validate"
              />
            )}
            {receiptValidation && (
              <div className="space-y-6">
                <SchemaValidationDisplay
                  validation={receiptValidation}
                  title="Receipt Schema Validation"
                />
                {parsedReceipt && (
                  <DecodedFieldsTable
                    title="Decoded Receipt"
                    fields={[
                      { label: "id", value: parsedReceipt.id },
                      { label: "payer", value: parsedReceipt.payer },
                      { label: "merchant", value: parsedReceipt.merchant },
                      { label: "amount", value: `${parsedReceipt.amount} ${parsedReceipt.asset}` },
                      { label: "chain", value: parsedReceipt.chain },
                      { label: "nonce", value: parsedReceipt.requestNonce },
                      { label: "txHash", value: parsedReceipt.txHash, highlight: true },
                      { label: "signature", value: parsedReceipt.signature },
                    ]}
                  />
                )}
                {beepVerifyResult && (
                  <div className={cn(
                    "p-4 rounded-lg border",
                    beepVerifyResult.valid
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={beepVerifyResult.valid ? "text-emerald-400" : "text-red-400"}>
                        {beepVerifyResult.valid ? "✅" : "❌"}
                      </span>
                      <span className={cn(
                        "font-semibold",
                        beepVerifyResult.valid ? "text-emerald-400" : "text-red-400"
                      )}>
                        {beepVerifyResult.valid ? "Verified via Beep API" : "Verification Failed"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><span className="text-white">Method:</span> {beepVerifyResult.method}</p>
                      {beepVerifyResult.error && (
                        <p><span className="text-red-400">Error:</span> {beepVerifyResult.error}</p>
                      )}
                      {beepVerifyResult.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-neon-cyan">API Response Details</summary>
                          <pre className="mt-2 p-2 bg-black rounded text-[10px] overflow-auto max-h-32">
                            {JSON.stringify(beepVerifyResult.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === "verify" && (
          <>
            {!verificationResult && (
              <EmptyState
                icon="✓"
                title="Verify a payment"
                description="Enter both challenge and receipt JSON to verify they match"
              />
            )}
            {verificationResult && (
              <VerificationDisplay result={verificationResult} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-6xl mb-4 opacity-20">{icon}</div>
        <p className="text-muted-foreground font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

function DecodedFieldsTable({ title, fields }: { title: string; fields: Array<{ label: string; value: string; highlight?: boolean }> }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {title}
      </h3>
      <div className="bg-black rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {fields.map((field, i) => (
              <tr key={i}>
                <td className="px-4 py-2 text-muted-foreground w-28">{field.label}</td>
                <td
                  className={cn(
                    "px-4 py-2 font-mono text-xs break-all",
                    field.highlight ? "text-neon-cyan" : "text-white"
                  )}
                >
                  {field.value || <span className="text-muted-foreground italic">empty</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
