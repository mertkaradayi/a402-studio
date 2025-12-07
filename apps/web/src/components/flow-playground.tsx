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
  const { currentSession, isSimulationMode: isStreamingSim, setSimulationMode: setStreamingSim, resetSession } = useStreamingStore();
  const { currentInvocation, resetMCP, isSimulationMode: isMCPSim, setSimulationMode: setMCPSim } = useMCPStore();
  const [playgroundMode, setPlaygroundMode] = useState<PlaygroundMode>("payment");

  const network = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "mainnet" : "testnet";

  const setSandboxMode = () => {
    if (playgroundMode === "payment") {
      if (paymentMode !== "simulation") {
        resetFlow();
        resetSteps();
        setPaymentMode("simulation");
      }
    } else if (playgroundMode === "streaming") {
      if (!isStreamingSim) {
        resetSession();
        setStreamingSim(true);
      }
    } else if (!isMCPSim) {
      resetMCP();
      setMCPSim(true);
    }
  };

  const setLiveMode = () => {
    if (playgroundMode === "payment") {
      if (paymentMode !== "live") {
        resetFlow();
        resetSteps();
        setPaymentMode("live");
      }
    } else if (playgroundMode === "streaming") {
      if (isStreamingSim) {
        resetSession();
        setStreamingSim(false);
      }
    } else if (isMCPSim) {
      resetMCP();
      setMCPSim(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="h-16 px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-lg tracking-tight">Beep</span>
              <span className="text-muted-foreground text-sm">Playground</span>
            </div>
          </div>

          {/* Center: Mode Toggle */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            {/* Playground Mode Selector */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              {(["payment", "streaming", "mcp"] as PlaygroundMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPlaygroundMode(mode)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize",
                    playgroundMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Sandbox/Live Toggle */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => {
                  setSandboxMode();
                }}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  (playgroundMode === "payment" ? paymentMode === "simulation" : playgroundMode === "streaming" ? isStreamingSim : isMCPSim)
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Sandbox
              </button>
              <button
                onClick={() => {
                  setLiveMode();
                }}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5",
                  (playgroundMode === "payment" ? paymentMode === "live" : playgroundMode === "streaming" ? !isStreamingSim : !isMCPSim)
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  (playgroundMode === "payment" ? paymentMode === "live" : playgroundMode === "streaming" ? !isStreamingSim : !isMCPSim)
                    ? "bg-neon-green"
                    : "bg-muted-foreground/50"
                )} />
                Live
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-xs px-2.5 py-1 rounded-md font-mono",
              network === 'mainnet'
                ? 'text-neon-green bg-neon-green/10'
                : 'text-neon-yellow bg-neon-yellow/10'
            )}>
              {network}
            </span>

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
          <div className="px-6 pb-4 pt-1">
            <StepIndicator currentStep={currentStep} />
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Widget Area */}
        <div className="w-full md:w-[55%] border-r border-border/40 overflow-hidden">
          {playgroundMode === "payment" && <PaymentWidget key={paymentMode} />}
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
      <footer className="border-t border-border/40 bg-card/30 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>Powered by <span className="font-medium text-foreground">Beep</span></span>
            <span className="text-border">•</span>
            <span>Sui Network</span>
          </div>
          <div className="flex items-center gap-4">
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
