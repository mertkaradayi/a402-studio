"use client";

import { useFlowStore } from "@/stores/flow-store";
import { useStreamingStore } from "@/stores/streaming-store";
import { useMCPStore } from "@/stores/mcp-store";
import { WalletButton } from "./wallet-button";
import { PaymentWidget } from "./payment-widget";
import { StreamingWidget } from "./streaming-widget";
import { MCPWidget } from "./mcp-widget";
import { ResultsPanel } from "./panels/results-panel";
import { StreamingPanel } from "./streaming-panel";
import { MCPPanel } from "./mcp-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { StepIndicator } from "./step-indicator";
import { SettingsDropdown } from "./settings-dropdown";
import { useState } from "react";

// Main playground mode
type PlaygroundMode = "payment" | "streaming" | "mcp";

export function FlowPlayground() {
  const { resetFlow, receipt, paymentMode, setPaymentMode, currentStep, resetSteps } = useFlowStore();
  const { currentSession, isSimulationMode, setSimulationMode, resetSession } = useStreamingStore();
  const { currentInvocation, resetMCP } = useMCPStore();
  const [playgroundMode, setPlaygroundMode] = useState<PlaygroundMode>("payment");

  const network = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "mainnet" : "testnet";

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="h-14 px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold tracking-tight">Beep</span>
              <span className="text-muted-foreground text-sm font-medium">Playground</span>
            </div>
          </div>

          {/* Center: Mode Toggle */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
            {/* Playground Mode Selector */}
            <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/50">
              <button
                onClick={() => setPlaygroundMode("payment")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-all relative",
                  playgroundMode === "payment"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Payment
                {playgroundMode === "payment" && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                )}
              </button>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={() => setPlaygroundMode("streaming")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-all relative",
                  playgroundMode === "streaming"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Streaming
                {playgroundMode === "streaming" && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-purple-500 rounded-full" />
                )}
              </button>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={() => setPlaygroundMode("mcp")}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-all relative",
                  playgroundMode === "mcp"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                MCP
                {playgroundMode === "mcp" && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Sandbox/Live Toggle - Hidden for MCP mode (always simulation) */}
            {playgroundMode !== "mcp" && (
              <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/50">
                <button
                  onClick={() => {
                    if (playgroundMode === "payment") {
                      setPaymentMode("simulation");
                    } else {
                      setSimulationMode(true);
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-all relative",
                    (playgroundMode === "payment" ? paymentMode === "simulation" : isSimulationMode)
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Sandbox
                  {(playgroundMode === "payment" ? paymentMode === "simulation" : isSimulationMode) && (
                    <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
                <div className="w-px h-5 bg-border" />
                <button
                  onClick={() => {
                    if (playgroundMode === "payment") {
                      setPaymentMode("live");
                    } else {
                      setSimulationMode(false);
                    }
                  }}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-all relative",
                    (playgroundMode === "payment" ? paymentMode === "live" : !isSimulationMode)
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Live
                  {(playgroundMode === "payment" ? paymentMode === "live" : !isSimulationMode) && (
                    <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-neon-green rounded-full" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "text-xs px-2 py-1 rounded font-mono",
              network === 'mainnet'
                ? 'text-neon-green bg-neon-green/10'
                : 'text-neon-yellow bg-neon-yellow/10'
            )}>
              {network}
            </div>

            <SettingsDropdown />

            <ModeToggle />

            <WalletButton />

            {((playgroundMode === "payment" && (receipt || currentStep >= 0)) ||
              (playgroundMode === "streaming" && currentSession) ||
              (playgroundMode === "mcp" && currentInvocation)) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (playgroundMode === "payment") {
                    resetFlow();
                    resetSteps();
                  } else if (playgroundMode === "streaming") {
                    resetSession();
                  } else {
                    resetMCP();
                  }
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Step Indicator - Payment mode only */}
        {playgroundMode === "payment" && currentStep >= 0 && (
          <div className="px-6 pb-3 border-t border-border/50 bg-muted/10">
            <StepIndicator currentStep={currentStep} />
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Widget Area */}
        <div className="w-full md:w-[55%] border-r border-border overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(#36363B_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.02] dark:opacity-[0.08] pointer-events-none" />
          {playgroundMode === "payment" && <PaymentWidget />}
          {playgroundMode === "streaming" && <StreamingWidget />}
          {playgroundMode === "mcp" && <MCPWidget />}
        </div>

        {/* Right: Panel Area */}
        <div className="hidden md:block w-[45%] overflow-hidden bg-muted/5">
          {playgroundMode === "payment" && <ResultsPanel />}
          {playgroundMode === "streaming" && <StreamingPanel />}
          {playgroundMode === "mcp" && <MCPPanel />}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>Powered by <span className="font-medium text-foreground">Beep</span></span>
            <span className="text-border">•</span>
            <span>Sui Network</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://justbeep.it" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Documentation
            </a>
            <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Explorer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
