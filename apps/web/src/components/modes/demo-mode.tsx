"use client";

import { useState } from "react";
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useFlowStore, PRESET_SCENARIOS, type PresetScenario } from "@/stores/flow-store";
import { cn } from "@/lib/utils";
import { CenterPanel } from "../panels/center-panel";
import { CodeExportPanel } from "../panels/code-export-panel";

const PRESETS = Object.entries(PRESET_SCENARIOS).filter(([key]) => key !== "custom") as [PresetScenario, typeof PRESET_SCENARIOS[PresetScenario]][];

export function DemoMode() {
  const {
    selectedPreset,
    setSelectedPreset,
    setChallenge,
    setReceipt,
    addDebugLog,
    challenge,
    isLoading,
    setLoading,
  } = useFlowStore();

  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [isWalletPaymentLoading, setIsWalletPaymentLoading] = useState(false);

  // Wallet hooks
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();

  const handleLoadPreset = async (presetId: PresetScenario) => {
    const preset = PRESET_SCENARIOS[presetId];
    setSelectedPreset(presetId);
    setLoading(true);
    addDebugLog("info", `Loading preset: ${preset.name}`);

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const rawChallenge = `HTTP/1.1 402 Payment Required
Content-Type: application/json
X-A402-Version: 1.0

${JSON.stringify(preset.challenge, null, 2)}`;

    setChallenge(preset.challenge, rawChallenge);
    addDebugLog("info", "Challenge loaded from preset");
    setLoading(false);
  };

  const handleSimulatePayment = async () => {
    const preset = PRESET_SCENARIOS[selectedPreset];
    setLoading(true);
    addDebugLog("info", "Simulating payment...");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const rawReceipt = JSON.stringify(preset.receipt, null, 2);
    setReceipt(preset.receipt, rawReceipt);
    addDebugLog(
      preset.expectedResult === "valid" ? "success" : "warning",
      `Payment simulated. Expected result: ${preset.expectedResult.toUpperCase()}`
    );
    setLoading(false);
  };

  const handleWalletPayment = async () => {
    if (!account || !challenge) return;

    setIsWalletPaymentLoading(true);
    addDebugLog("info", "Initiating wallet payment...");
    addDebugLog("info", `Wallet: ${account.address.slice(0, 10)}...`);

    try {
      // Create a dummy transaction for signing demonstration
      // In production, this would be a real Beep payment transaction
      const tx = new Transaction();

      // Add a simple move call to demonstrate signing
      // This transfers 0 SUI to the merchant (dummy transaction)
      tx.transferObjects(
        [tx.splitCoins(tx.gas, [0])],
        challenge.recipient
      );

      addDebugLog("info", "Requesting wallet signature...");

      // Sign the transaction
      const { signature, bytes } = await signTransaction({
        transaction: tx,
      });

      addDebugLog("success", "Transaction signed successfully!");
      addDebugLog("info", `Signature: ${signature.slice(0, 20)}...`);

      // For demo purposes, we'll create a mock receipt with the real signature
      // In production, this would be submitted to the chain and Beep facilitator
      // bytes is a base64-encoded string of the transaction bytes
      const txHashPreview = bytes.replace(/[^a-fA-F0-9]/g, "").slice(0, 64);

      const receipt = {
        id: `rcpt_${Date.now()}`,
        requestNonce: challenge.nonce,
        payer: account.address,
        merchant: challenge.recipient,
        amount: challenge.amount,
        asset: challenge.asset,
        chain: challenge.chain,
        txHash: `0x${txHashPreview || Date.now().toString(16)}`,
        signature: signature,
        issuedAt: Math.floor(Date.now() / 1000),
      };

      const rawReceipt = JSON.stringify(receipt, null, 2);
      setReceipt(receipt, rawReceipt);
      addDebugLog("success", "Wallet payment completed! (Demo mode - transaction not submitted)");

    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      if (message.includes("User rejected") || message.includes("rejected")) {
        addDebugLog("warning", "Transaction rejected by user");
      } else {
        addDebugLog("error", `Wallet payment failed: ${message}`);
      }
    }

    setIsWalletPaymentLoading(false);
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Preset Selector */}
      <div className="w-72 border-r border-border flex-shrink-0 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-neon-cyan uppercase tracking-wide">
              Demo Mode
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Learn the a402 flow with preset scenarios
            </p>
          </div>

          {/* Preset List */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Select Scenario
            </label>
            {PRESETS.map(([id, preset]) => (
              <button
                key={id}
                onClick={() => handleLoadPreset(id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  selectedPreset === id
                    ? "border-neon-pink bg-neon-pink/10"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {preset.name}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      preset.expectedResult === "valid"
                        ? "bg-neon-green/20 text-neon-green"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {preset.expectedResult}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-border">
            <button
              onClick={() => handleLoadPreset(selectedPreset)}
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-neon-pink text-black font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Load Challenge"}
            </button>

            {challenge && (
              <>
                <button
                  onClick={handleSimulatePayment}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-neon-green text-black font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Simulate Payment"}
                </button>

                {/* Pay with Wallet Button */}
                <button
                  onClick={handleWalletPayment}
                  disabled={!account || isWalletPaymentLoading || isLoading}
                  className={cn(
                    "w-full px-4 py-2.5 font-semibold rounded-md transition-all disabled:cursor-not-allowed",
                    account
                      ? "bg-neon-cyan text-black hover:opacity-90 disabled:opacity-50"
                      : "bg-card border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
                  )}
                >
                  {isWalletPaymentLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing...
                    </span>
                  ) : account ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Pay with Wallet
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Connect Wallet First
                    </span>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-card/50 p-3 rounded-lg">
            <p>
              <span className="text-neon-yellow font-medium">Tip:</span> Use
              "Simulate Payment" for mock flow testing, or connect your wallet and
              "Pay with Wallet" to sign a real transaction. Try "Valid Payment" for
              a successful flow.
            </p>
          </div>
        </div>
      </div>

      {/* Center Panel - Tabbed Viewer */}
      <div className={cn(
        "flex-1 overflow-hidden transition-all duration-300",
        isCodeExpanded && "flex-shrink"
      )}>
        <CenterPanel />
      </div>

      {/* Right Panel - Code Export (Expandable) */}
      <div
        className={cn(
          "flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out flex",
          isCodeExpanded ? "w-[600px]" : "w-96"
        )}
      >
        {/* Left Edge Toggle Handle */}
        <button
          onClick={() => setIsCodeExpanded(!isCodeExpanded)}
          className={cn(
            "w-5 flex-shrink-0 border-l border-r border-border",
            "flex items-center justify-center",
            "bg-card/50 hover:bg-neon-yellow/10 transition-all cursor-pointer group",
            isCodeExpanded && "bg-neon-yellow/5"
          )}
          title={isCodeExpanded ? "Collapse panel" : "Expand panel"}
        >
          {/* Chevron Arrow */}
          <svg
            className={cn(
              "w-3 h-3 transition-all",
              isCodeExpanded
                ? "text-neon-yellow"
                : "text-muted-foreground group-hover:text-neon-yellow"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCodeExpanded ? (
              /* Right arrow - click to collapse (shrink to right) */
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              /* Left arrow - click to expand (grow to left) */
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>

        {/* Panel Content */}
        <div className="flex-1 h-full overflow-y-auto border-l border-border">
          <CodeExportPanel isExpanded={isCodeExpanded} />
        </div>
      </div>
    </div>
  );
}
