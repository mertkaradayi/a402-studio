"use client";

import { useState } from "react";
import { useFlowStore, type AppMode } from "@/stores/flow-store";
import { cn } from "@/lib/utils";

import { DemoMode } from "./modes/demo-mode";
import { TestEndpointMode } from "./modes/test-endpoint-mode";
import { InspectorMode } from "./modes/inspector-mode";
import { HistoryPanel } from "./panels/history-panel";
import { WalletButton } from "./wallet-button";

const MODES: { id: AppMode; label: string; description: string }[] = [
  { id: "demo", label: "Demo", description: "Learn the a402 flow with mock data" },
  { id: "test-endpoint", label: "Test Endpoint", description: "Validate your real API" },
  { id: "inspector", label: "Inspector", description: "Decode & verify any data" },
];

function ModeSelector() {
  const { currentMode, setCurrentMode } = useFlowStore();

  return (
    <div className="flex gap-1 bg-black/50 p-1 rounded-lg">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setCurrentMode(mode.id)}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            currentMode === mode.id
              ? "bg-neon-pink text-black"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          )}
          title={mode.description}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

function ModeContent() {
  const currentMode = useFlowStore((state) => state.currentMode);

  switch (currentMode) {
    case "demo":
      return <DemoMode />;
    case "test-endpoint":
      return <TestEndpointMode />;
    case "inspector":
      return <InspectorMode />;
    default:
      return null;
  }
}

export function FlowPlayground() {
  const { resetFlow, history, challenge, receipt } = useFlowStore();
  const [showHistory, setShowHistory] = useState(false);

  // Determine current step in the flow
  const currentStep = !challenge ? 0 : !receipt ? 1 : 2;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-border bg-black">
        {/* Top Bar */}
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Logo & Mode Selector */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center">
                <span className="text-black font-bold text-sm">402</span>
              </div>
              <div>
                <span className="text-white font-semibold">a402 Playground</span>
                <span className="text-muted-foreground text-xs ml-2">v1.0</span>
              </div>
            </div>
            <ModeSelector />
          </div>

          {/* Wallet & Actions */}
          <div className="flex items-center gap-4">
            <WalletButton />
            <div className="w-px h-6 bg-border" />
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium border rounded-md transition-colors flex items-center gap-2",
                showHistory
                  ? "border-neon-cyan text-neon-cyan bg-neon-cyan/10"
                  : "border-border text-muted-foreground hover:text-white hover:border-neon-cyan"
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
              {history.length > 0 && (
                <span className="bg-neon-cyan/20 text-neon-cyan text-xs px-1.5 rounded">
                  {history.length}
                </span>
              )}
            </button>
            <button
              onClick={resetFlow}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-white border border-border rounded-md hover:border-neon-pink hover:bg-neon-pink/10 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Flow Progress Bar */}
        <div className="px-6 py-2 bg-card/30 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-2">Flow:</span>

            {/* Step 1: Get Challenge */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all",
              currentStep >= 1
                ? "bg-neon-green/20 text-neon-green"
                : "bg-muted/50 text-muted-foreground"
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
                currentStep >= 1 ? "bg-neon-green text-black" : "bg-muted-foreground/30 text-muted-foreground"
              )}>
                {currentStep >= 1 ? "✓" : "1"}
              </div>
              Get Challenge
            </div>

            <svg className={cn("w-4 h-4", currentStep >= 1 ? "text-neon-green" : "text-muted-foreground/30")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

            {/* Step 2: Make Payment */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all",
              currentStep >= 2
                ? "bg-neon-green/20 text-neon-green"
                : currentStep === 1
                  ? "bg-neon-pink/20 text-neon-pink animate-pulse"
                  : "bg-muted/50 text-muted-foreground"
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
                currentStep >= 2
                  ? "bg-neon-green text-black"
                  : currentStep === 1
                    ? "bg-neon-pink text-black"
                    : "bg-muted-foreground/30 text-muted-foreground"
              )}>
                {currentStep >= 2 ? "✓" : "2"}
              </div>
              Make Payment
            </div>

            <svg className={cn("w-4 h-4", currentStep >= 2 ? "text-neon-green" : "text-muted-foreground/30")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

            {/* Step 3: Verify Receipt */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all",
              currentStep >= 2
                ? "bg-neon-cyan/20 text-neon-cyan"
                : "bg-muted/50 text-muted-foreground"
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px]",
                currentStep >= 2 ? "bg-neon-cyan text-black" : "bg-muted-foreground/30 text-muted-foreground"
              )}>
                3
              </div>
              Verify Receipt
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className={cn("flex-1 overflow-hidden", showHistory && "border-r border-border")}>
          <ModeContent />
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="w-80 overflow-hidden">
            <HistoryPanel onClose={() => setShowHistory(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
