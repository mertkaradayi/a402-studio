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
  const { resetFlow, history } = useFlowStore();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-border bg-black px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <span className="text-neon-pink font-bold text-xl">a402</span>
              <span className="text-white font-light text-xl">Playground</span>
            </div>
            <ModeSelector />
          </div>

          {/* Wallet Connection */}
          <WalletButton />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium border rounded-md transition-colors flex items-center gap-2",
                showHistory
                  ? "border-neon-cyan text-neon-cyan"
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
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-white border border-border rounded-md hover:border-neon-pink transition-colors"
            >
              Reset
            </button>
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
