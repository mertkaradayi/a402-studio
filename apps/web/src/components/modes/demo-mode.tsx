"use client";

import { useState } from "react";
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
              <button
                onClick={handleSimulatePayment}
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-neon-green text-black font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Simulate Payment"}
              </button>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-card/50 p-3 rounded-lg">
            <p>
              <span className="text-neon-yellow font-medium">Tip:</span> Each
              preset demonstrates a different scenario. Try "Valid Payment" to
              see a successful flow, then try "Wrong Amount" to see validation
              errors.
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
