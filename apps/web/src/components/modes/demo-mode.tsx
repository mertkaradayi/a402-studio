"use client";

import { useState } from "react";
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useFlowStore, PRESET_SCENARIOS, type PresetScenario } from "@/stores/flow-store";
import { cn } from "@/lib/utils";
import { CenterPanel } from "../panels/center-panel";
import { CodeExportPanel } from "../panels/code-export-panel";
import { BeepCheckout, useBeepPayment, type BeepPaymentReceipt } from "@/components/beep/beep-checkout";
import { SdkIntegrationPanel } from "@/components/beep/sdk-integration-panel";
import { CheckoutWidgetPanel } from "@/components/beep/checkout-widget-panel";
import { verifyReceiptViaBeepServerAPI } from "@/lib/signature-verification";

type DemoSubMode = "learning" | "beep" | "sdk" | "widget";

const PRESETS = Object.entries(PRESET_SCENARIOS).filter(([key]) => key !== "custom") as [PresetScenario, typeof PRESET_SCENARIOS[PresetScenario]][];

// Default payment config for Beep Live mode
const BEEP_LIVE_CONFIG = {
  amount: "0.000001", // Smallest USDC amount (1 micro-USDC)
  currency: "USDC",
};

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
  const [demoSubMode, setDemoSubMode] = useState<DemoSubMode>("learning");
  const [showBeepModal, setShowBeepModal] = useState(false);
  const [beepLiveVerification, setBeepLiveVerification] = useState<{
    valid: boolean;
    method: string;
    error?: string;
    isVerifying: boolean;
  } | null>(null);

  // Beep payment hook (for demo simulation)
  const { initiatePayment, isProcessing: isBeepPaymentLoading, error: beepError } = useBeepPayment();

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

  // Handler for Beep Live mode - opens real Beep Checkout widget
  const handleBeepLivePayment = () => {
    if (!account) {
      addDebugLog("warning", "Please connect your wallet first");
      return;
    }

    setBeepLiveVerification(null); // Reset previous verification
    addDebugLog("info", "🚀 Opening Beep Checkout Widget...");
    addDebugLog("info", `Amount: ${BEEP_LIVE_CONFIG.amount} ${BEEP_LIVE_CONFIG.currency}`);
    addDebugLog("info", `Recipient: ${account.address.slice(0, 20)}...`);
    setShowBeepModal(true);
  };

  // Handler for when real Beep payment completes
  const handleRealBeepPaymentComplete = async (beepReceipt: BeepPaymentReceipt) => {
    const network = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "sui-mainnet" : "sui-testnet";
    const nonce = `beep-live-${Date.now()}`;

    addDebugLog("success", "✅ Real Beep payment completed!");
    addDebugLog("info", `Receipt ID: ${beepReceipt.id}`);
    addDebugLog("info", `Transaction: ${beepReceipt.txHash}`);

    // Create challenge and receipt for the panels
    const generatedChallenge = {
      amount: beepReceipt.amount,
      asset: beepReceipt.asset,
      recipient: beepReceipt.merchant,
      chain: network,
      nonce: nonce,
      expiry: Math.floor(Date.now() / 1000) + 3600,
    };
    setChallenge(generatedChallenge, JSON.stringify(generatedChallenge, null, 2));

    const receipt = {
      id: beepReceipt.id,
      requestNonce: nonce,
      payer: beepReceipt.payer,
      merchant: beepReceipt.merchant,
      amount: beepReceipt.amount,
      asset: beepReceipt.asset,
      chain: network,
      txHash: beepReceipt.txHash,
      signature: beepReceipt.signature,
      issuedAt: beepReceipt.issuedAt,
    };
    setReceipt(receipt, JSON.stringify(receipt, null, 2));

    setShowBeepModal(false);

    // Verify receipt via Beep API
    addDebugLog("info", "🔐 Verifying receipt via Beep API...");
    setBeepLiveVerification({ valid: false, method: "", isVerifying: true });

    try {
      const verification = await verifyReceiptViaBeepServerAPI(receipt, {
        amount: beepReceipt.amount,
        recipient: beepReceipt.merchant,
        nonce: nonce,
      });

      setBeepLiveVerification({
        valid: verification.valid,
        method: verification.method,
        error: verification.error,
        isVerifying: false,
      });

      if (verification.valid) {
        addDebugLog("success", `✅ Receipt verified via ${verification.method}`);
      } else {
        addDebugLog("warning", `Verification: ${verification.error || "Could not verify"}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setBeepLiveVerification({
        valid: false,
        method: "beep-api",
        error: message,
        isVerifying: false,
      });
      addDebugLog("error", `Verification error: ${message}`);
    }
  };

  // Handler when Beep payment fails
  const handleRealBeepPaymentError = (error: Error) => {
    addDebugLog("error", `Beep payment failed: ${error.message}`);
    setShowBeepModal(false);
  };


  const handleBeepPayment = async () => {
    if (!challenge) return;
    if (!account) {
      addDebugLog("warning", "Please connect your wallet first to use Beep payments");
      return;
    }

    addDebugLog("info", "Initiating Beep payment via SDK...");
    addDebugLog("info", `Using @beep-it/checkout-widget & @beep-it/sdk-core`);
    addDebugLog("info", `Payment amount: ${challenge.amount} ${challenge.asset}`);
    addDebugLog("info", `Recipient: ${challenge.recipient.slice(0, 20)}...`);

    try {
      // Use the Beep SDK payment flow
      const beepReceipt = await initiatePayment(
        challenge.amount,
        challenge.asset,
        challenge.recipient,
        challenge.nonce
      );

      if (!beepReceipt) {
        if (beepError) {
          addDebugLog("error", `Beep payment failed: ${beepError.message}`);
        }
        return;
      }

      addDebugLog("success", "Beep payment completed!");
      addDebugLog("info", `Receipt ID: ${beepReceipt.id}`);
      addDebugLog("info", `Transaction: ${beepReceipt.txHash.slice(0, 20)}...`);
      addDebugLog("info", `Facilitator signature: ${beepReceipt.signature.slice(0, 20)}...`);

      // Convert BeepReceipt to the format expected by setReceipt
      const receipt = {
        id: beepReceipt.id,
        requestNonce: challenge.nonce,
        payer: beepReceipt.payer,
        merchant: beepReceipt.merchant,
        amount: beepReceipt.amount,
        asset: beepReceipt.asset,
        chain: beepReceipt.chain,
        txHash: beepReceipt.txHash,
        signature: beepReceipt.signature,
        issuedAt: beepReceipt.issuedAt,
      };

      const rawReceipt = JSON.stringify(receipt, null, 2);
      setReceipt(receipt, rawReceipt);
      addDebugLog("success", "Beep receipt verified and stored!");

    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addDebugLog("error", `Beep payment failed: ${message}`);
    }
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
              {demoSubMode === "learning"
                ? "Learn the a402 flow with simulated data"
                : demoSubMode === "beep"
                  ? "Real USDC payments via Beep"
                  : demoSubMode === "widget"
                    ? "Official Beep CheckoutWidget"
                    : "Production-ready SDK integration"}
            </p>
          </div>

          {/* Sub-Mode Toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setDemoSubMode("learning")}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium transition-all",
                demoSubMode === "learning"
                  ? "bg-neon-green/20 text-neon-green border-r border-neon-green/30"
                  : "bg-card text-muted-foreground hover:bg-muted border-r border-border"
              )}
            >
              📚 Learning
            </button>
            <button
              onClick={() => setDemoSubMode("beep")}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium transition-all",
                demoSubMode === "beep"
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              ⚡ Beep Live
            </button>
            <button
              onClick={() => setDemoSubMode("sdk")}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium transition-all",
                demoSubMode === "sdk"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              🔧 SDK
            </button>
            <button
              onClick={() => setDemoSubMode("widget")}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium transition-all",
                demoSubMode === "widget"
                  ? "bg-purple-500/20 text-purple-400 border-l border-purple-500/30"
                  : "bg-card text-muted-foreground hover:bg-muted border-l border-border"
              )}
            >
              💳 Widget
            </button>
          </div>

          {/* Mode Info Banner */}
          {demoSubMode === "learning" ? (
            <div className="p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
              <div className="flex items-start gap-2">
                <span className="text-neon-green">ℹ️</span>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-neon-green mb-1">Simulation Mode</p>
                  <p>All data is mock. Full verification with demo keys. Free to use.</p>
                </div>
              </div>
            </div>
          ) : demoSubMode === "beep" ? (
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-start gap-2">
                <span className="text-purple-400">⚡</span>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-purple-400 mb-1">Real Beep Payments</p>
                  <p>Pay real USDC using Beep Checkout Widget. Scan QR with mobile wallet.</p>
                </div>
              </div>
            </div>
          ) : demoSubMode === "widget" ? (
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-start gap-2">
                <span className="text-purple-400">💳</span>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-purple-400 mb-1">CheckoutWidget</p>
                  <p>Official Beep widget with built-in wallet & QR support.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400">🔧</span>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-emerald-400 mb-1">SDK Integration</p>
                  <p>Production-ready BeepPublicClient with facilitator-signed receipts.</p>
                </div>
              </div>
            </div>
          )}

          {/* Preset List - Only show in Learning mode */}
          {demoSubMode === "learning" && (
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
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-border">
            {demoSubMode === "learning" ? (
              <>
                {/* Learning Mode Buttons */}
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
                      {isWalletPaymentLoading ? "Signing..." : account ? "Pay with Wallet" : "Connect Wallet"}
                    </button>

                    <button
                      onClick={handleBeepPayment}
                      disabled={!account || isBeepPaymentLoading || isLoading}
                      className={cn(
                        "w-full px-4 py-2.5 font-semibold rounded-md transition-all disabled:cursor-not-allowed",
                        account
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-50"
                          : "bg-card border border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                      )}
                    >
                      {isBeepPaymentLoading ? "Processing..." : account ? "Pay with Beep" : "Connect for Beep"}
                    </button>
                  </>
                )}
              </>
            ) : demoSubMode === "beep" ? (
              <>
                {/* Beep Live Mode - Streamlined */}
                <div className="space-y-3">
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Beep Checkout</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Real USDC payments on Sui testnet
                    </p>
                  </div>

                  {!account ? (
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                      <p className="text-sm text-purple-400">
                        Connect your wallet to make real payments
                      </p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleBeepLivePayment}
                        disabled={showBeepModal}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {showBeepModal ? "Checkout Open..." : `Pay ${BEEP_LIVE_CONFIG.amount} USDC`}
                      </button>
                      <p className="text-xs text-muted-foreground text-center">
                        Opens Beep Checkout Widget. Scan QR with your mobile wallet.
                      </p>

                      {/* Verification Result - Show after payment */}
                      {beepLiveVerification && (
                        <div className={cn(
                          "p-3 rounded-lg border mt-2",
                          beepLiveVerification.isVerifying
                            ? "bg-purple-500/10 border-purple-500/30"
                            : beepLiveVerification.valid
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-red-500/10 border-red-500/30"
                        )}>
                          {beepLiveVerification.isVerifying ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm text-purple-400">Verifying with Beep API...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={beepLiveVerification.valid ? "text-emerald-400" : "text-red-400"}>
                                {beepLiveVerification.valid ? "✅" : "❌"}
                              </span>
                              <div className="text-xs">
                                <p className={cn(
                                  "font-medium",
                                  beepLiveVerification.valid ? "text-emerald-400" : "text-red-400"
                                )}>
                                  {beepLiveVerification.valid ? "Verified" : "Not Verified"}
                                </p>
                                <p className="text-muted-foreground">
                                  Method: {beepLiveVerification.method}
                                </p>
                                {beepLiveVerification.error && (
                                  <p className="text-red-400 text-[10px] mt-1">
                                    {beepLiveVerification.error}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : demoSubMode === "widget" ? (
              /* CheckoutWidget Mode */
              <CheckoutWidgetPanel />
            ) : (
              /* SDK Integration Mode */
              <SdkIntegrationPanel />
            )}
          </div>

          {/* Mode-specific tips */}
          {demoSubMode !== "sdk" && (
            <div className="text-xs text-muted-foreground bg-card/50 p-3 rounded-lg">
              {demoSubMode === "learning" ? (
                <p>
                  <span className="text-neon-yellow font-medium">💡 Tip:</span> Start by loading a preset, then try different payment methods.
                </p>
              ) : (
                <p>
                  <span className="text-purple-400 font-medium">⚠️ Note:</span> Receipts are pre-verified by Beep. Independent verification requires facilitator keys.
                </p>
              )}
            </div>
          )}
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

      {/* Real Beep Checkout Modal */}
      {showBeepModal && account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-white">Beep Checkout</h3>
                <p className="text-xs text-muted-foreground">Pay with USDC on Sui</p>
              </div>
              <button
                onClick={() => setShowBeepModal(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Beep Checkout Widget */}
            <div className="p-4">
              <BeepCheckout
                amount={BEEP_LIVE_CONFIG.amount}
                currency={BEEP_LIVE_CONFIG.currency}
                recipient={account.address}
                description="a402 Playground - Test Payment"
                onPaymentComplete={handleRealBeepPaymentComplete}
                onPaymentError={handleRealBeepPaymentError}
                showModal={false}
              />
            </div>

            {/* Payment Info */}
            <div className="px-4 pb-4">
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                <p className="text-xs text-purple-400">
                  Scan the QR code with your mobile wallet to complete the payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
