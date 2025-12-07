"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useStreamingStore, StreamingAsset } from "@/stores/streaming-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Preset streaming scenarios - prices per tick (100ms in simulation)
const PRESET_ASSETS: { name: string; assets: StreamingAsset[] }[] = [
  {
    name: "Video Streaming",
    assets: [
      { assetId: "video-hd", name: "HD Video Stream", quantity: 1, unitPrice: "0.000001", description: "Per 100ms" },
    ],
  },
  {
    name: "API Usage",
    assets: [
      { assetId: "api-calls", name: "API Calls", quantity: 1, unitPrice: "0.000001", description: "Per tick" },
    ],
  },
  {
    name: "Multi-Resource",
    assets: [
      { assetId: "compute", name: "Compute Units", quantity: 1, unitPrice: "0.000001", description: "Per tick" },
      { assetId: "storage", name: "Storage", quantity: 1, unitPrice: "0.000001", description: "Per tick" },
    ],
  },
];

export function StreamingWidget() {
  const {
    currentSession,
    isSimulationMode,
    createSession,
    setInvoiceId,
    setSessionState,
    startStreaming,
    pauseStreaming,
    stopStreaming,
    addCharge,
    updateTotalAccumulated,
    addLog,
    addReferenceKey,
    saveToHistory,
    resetSession,
    setError,
  } = useStreamingStore();

  const [merchantId, setMerchantId] = useState("merchant_demo_001");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customAssets, setCustomAssets] = useState<StreamingAsset[]>([]);
  const [useCustom, setUseCustom] = useState(false);

  // Simulation interval ref
  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const chargeCountRef = useRef(0);

  // Clean up simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, []);

  // Track accumulated total in a ref to avoid stale closures
  const accumulatedRef = useRef(0);

  // Reset accumulated ref when session changes
  useEffect(() => {
    accumulatedRef.current = parseFloat(currentSession?.totalAccumulated || "0");
  }, [currentSession?.id]);

  // Run simulation charges when active - FAST ticking for demo feel
  useEffect(() => {
    if (!currentSession || !isSimulationMode) return;

    if (currentSession.state === "active") {
      // Calculate charge per tick based on assets (captured once)
      const chargePerTick = currentSession.assets.reduce((sum, asset) => {
        return sum + parseFloat(asset.unitPrice) * asset.quantity;
      }, 0);

      // Fast tick every 100ms for smooth demo experience
      simulationRef.current = setInterval(() => {
        chargeCountRef.current += 1;
        const chargeNum = chargeCountRef.current;

        const referenceKey = `ref_${Date.now().toString(36)}_${chargeNum}`;

        addCharge({
          referenceKey,
          amount: chargePerTick.toFixed(6),
          asset: "USDC",
          status: "confirmed",
        });

        addReferenceKey(referenceKey);

        // Update total using ref to avoid stale closure
        accumulatedRef.current += chargePerTick;
        updateTotalAccumulated(accumulatedRef.current.toFixed(6));

        // Only log every 10th charge to avoid spam
        if (chargeNum % 10 === 0) {
          addLog("charge", `Tick #${chargeNum}: +${(chargePerTick * 10).toFixed(6)} USDC`, {
            referenceKey,
            tickCount: chargeNum,
          });
        }
      }, 100); // Fast 100ms ticks!

      return () => {
        if (simulationRef.current) {
          clearInterval(simulationRef.current);
          simulationRef.current = null;
        }
      };
    } else {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
    }
  }, [currentSession?.state, currentSession?.assets, currentSession?.id, isSimulationMode, addCharge, addReferenceKey, updateTotalAccumulated, addLog]);

  // Handle creating a new streaming session
  const handleCreateSession = useCallback(() => {
    const assets = useCustom ? customAssets : PRESET_ASSETS[selectedPreset].assets;
    if (assets.length === 0) return;

    chargeCountRef.current = 0;
    createSession(merchantId, assets);
    addLog("info", "Session created", { merchantId, assetCount: assets.length });
  }, [merchantId, selectedPreset, useCustom, customAssets, createSession, addLog]);

  // Handle issuing payment (creating invoice)
  const handleIssuePayment = useCallback(async () => {
    if (!currentSession) return;

    setSessionState("starting");
    addLog("info", "Issuing payment request...");

    if (isSimulationMode) {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 800));
      const invoiceId = `inv_sim_${Date.now().toString(36)}`;
      const referenceKey = `ref_init_${Date.now().toString(36)}`;

      setInvoiceId(invoiceId);
      addReferenceKey(referenceKey);
      addLog("success", `Invoice created: ${invoiceId}`, { invoiceId, referenceKey });
      setSessionState("configuring");
    } else {
      try {
        const response = await fetch(`${API_BASE}/streaming/issue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetChunks: currentSession.assets.map((a) => ({
              assetId: a.assetId,
              quantity: a.quantity,
              name: a.name,
            })),
            payingMerchantId: currentSession.payingMerchantId,
          }),
        });

        if (!response.ok) throw new Error("Failed to issue payment");

        const data = await response.json();
        setInvoiceId(data.invoiceId);
        addReferenceKey(data.referenceKey);
        addLog("success", `Invoice created: ${data.invoiceId}`);
        setSessionState("configuring");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        addLog("error", `Failed to issue payment: ${message}`);
      }
    }
  }, [currentSession, isSimulationMode, setSessionState, setInvoiceId, addReferenceKey, addLog, setError]);

  // Handle starting the stream
  const handleStartStream = useCallback(async () => {
    if (!currentSession?.invoiceId) return;

    addLog("info", "Starting stream...");

    if (isSimulationMode) {
      await new Promise((r) => setTimeout(r, 500));
      startStreaming();
      addLog("success", "Stream started - charges accumulating");
    } else {
      try {
        const response = await fetch(`${API_BASE}/streaming/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: currentSession.invoiceId }),
        });

        if (!response.ok) throw new Error("Failed to start stream");

        startStreaming();
        addLog("success", "Stream started");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        addLog("error", `Failed to start: ${message}`);
      }
    }
  }, [currentSession?.invoiceId, isSimulationMode, startStreaming, addLog, setError]);

  // Handle pausing the stream
  const handlePauseStream = useCallback(async () => {
    if (!currentSession?.invoiceId) return;

    addLog("info", "Pausing stream...");

    if (isSimulationMode) {
      await new Promise((r) => setTimeout(r, 300));
      pauseStreaming();
      addLog("warning", "Stream paused - no new charges");
    } else {
      try {
        const response = await fetch(`${API_BASE}/streaming/pause`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: currentSession.invoiceId }),
        });

        if (!response.ok) throw new Error("Failed to pause stream");

        pauseStreaming();
        addLog("warning", "Stream paused");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        addLog("error", `Failed to pause: ${message}`);
      }
    }
  }, [currentSession?.invoiceId, isSimulationMode, pauseStreaming, addLog, setError]);

  // Handle stopping the stream
  const handleStopStream = useCallback(async () => {
    if (!currentSession?.invoiceId) return;

    setSessionState("stopping");
    addLog("info", "Stopping stream and finalizing charges...");

    if (isSimulationMode) {
      await new Promise((r) => setTimeout(r, 800));
      // Use the ref for accurate total, and get latest state from store
      const finalTotal = accumulatedRef.current.toFixed(6);
      stopStreaming(); // Will use current referenceKeys from store
      addLog("success", `Stream stopped. Total: ${finalTotal} USDC`, {
        totalCharges: chargeCountRef.current,
      });
      saveToHistory();
    } else {
      try {
        const response = await fetch(`${API_BASE}/streaming/stop`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: currentSession.invoiceId }),
        });

        if (!response.ok) throw new Error("Failed to stop stream");

        const data = await response.json();
        stopStreaming(data.referenceKeys);
        addLog("success", `Stream stopped. Reference keys: ${data.referenceKeys.length}`);
        saveToHistory();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        addLog("error", `Failed to stop: ${message}`);
      }
    }
  }, [currentSession?.invoiceId, isSimulationMode, setSessionState, stopStreaming, addLog, saveToHistory, setError]);

  // Render based on session state
  const renderContent = () => {
    // No session - show configuration
    if (!currentSession) {
      return (
        <div className="space-y-6">
          {/* Preset Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Scenario</label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_ASSETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPreset(idx);
                    setUseCustom(false);
                  }}
                  className={cn(
                    "p-3 rounded-lg border text-sm font-medium transition-all",
                    !useCustom && selectedPreset === idx
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Assets Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Assets to Stream</label>
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              {(useCustom ? customAssets : PRESET_ASSETS[selectedPreset].assets).map((asset, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{asset.name}</span>
                  <span className="text-muted-foreground font-mono">
                    {asset.unitPrice} USDC × {asset.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Merchant ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Paying Merchant ID</label>
            <Input
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="merchant_..."
              className="font-mono"
            />
          </div>

          <Button onClick={handleCreateSession} className="w-full" size="lg">
            Create Streaming Session
          </Button>
        </div>
      );
    }

    // Session created - show controls based on state
    return (
      <div className="space-y-6">
        {/* Session Info Card */}
        <Card className="bg-muted/20 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Session</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium uppercase",
                  currentSession.state === "active" && "bg-neon-green/20 text-neon-green",
                  currentSession.state === "paused" && "bg-neon-yellow/20 text-neon-yellow",
                  currentSession.state === "stopped" && "bg-muted text-muted-foreground",
                  currentSession.state === "error" && "bg-destructive/20 text-destructive",
                  (currentSession.state === "idle" || currentSession.state === "configuring") &&
                    "bg-primary/20 text-primary"
                )}
              >
                {currentSession.state}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice</span>
              <span className="font-mono truncate max-w-[180px]">
                {currentSession.invoiceId || "Not created"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Merchant</span>
              <span className="font-mono truncate max-w-[180px]">{currentSession.payingMerchantId}</span>
            </div>
          </CardContent>
        </Card>

        {/* Assets Being Streamed */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Streaming Assets</label>
          <div className="space-y-2">
            {currentSession.assets.map((asset, idx) => (
              <div key={idx} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{asset.name}</div>
                  <div className="text-xs text-muted-foreground">{asset.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{asset.unitPrice} USDC</div>
                  <div className="text-xs text-muted-foreground">× {asset.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-3">
          {/* Issue Payment - only if no invoice yet */}
          {!currentSession.invoiceId && currentSession.state === "configuring" && (
            <Button onClick={handleIssuePayment} className="w-full" size="lg">
              Issue Payment Request
            </Button>
          )}

          {/* Start/Resume - only if invoice exists and not active */}
          {currentSession.invoiceId &&
            (currentSession.state === "configuring" || currentSession.state === "paused") && (
              <Button
                onClick={handleStartStream}
                className="w-full bg-neon-green hover:bg-neon-green/90 text-black"
                size="lg"
              >
                {currentSession.state === "paused" ? "Resume Stream" : "Start Stream"}
              </Button>
            )}

          {/* Pause - only when active */}
          {currentSession.state === "active" && (
            <Button onClick={handlePauseStream} variant="secondary" className="w-full" size="lg">
              Pause Stream
            </Button>
          )}

          {/* Stop - when active or paused */}
          {(currentSession.state === "active" || currentSession.state === "paused") && (
            <Button onClick={handleStopStream} variant="destructive" className="w-full" size="lg">
              Stop & Finalize
            </Button>
          )}

          {/* New Session - when stopped or error */}
          {(currentSession.state === "stopped" || currentSession.state === "error") && (
            <Button onClick={resetSession} variant="outline" className="w-full" size="lg">
              New Session
            </Button>
          )}
        </div>

        {/* Error Display */}
        {currentSession.error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            <p className="text-sm text-destructive">{currentSession.error}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Streaming Payments</h1>
            <p className="text-sm text-muted-foreground">
              {isSimulationMode ? "Simulated usage-based billing" : "Live streaming charges"}
            </p>
          </div>
          <div
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium",
              isSimulationMode ? "bg-muted text-muted-foreground" : "bg-neon-green/10 text-neon-green"
            )}
          >
            {isSimulationMode ? "Simulation" : "Live"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto">{renderContent()}</div>
      </div>
    </div>
  );
}
