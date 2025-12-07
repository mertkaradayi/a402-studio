"use client";

import Link from "next/link";
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0b0c10] text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-20 ambient opacity-50" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(115,255,109,0.05),transparent_24%),radial-gradient(circle_at_82%_10%,rgba(255,0,237,0.07),transparent_28%),radial-gradient(circle_at_50%_82%,rgba(4,217,255,0.05),transparent_24%)]" />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0f0f12]/80 backdrop-blur-lg">
        <div className="h-16 px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-3 text-inherit">
              <div className="w-9 h-9 rounded-xl border border-white/12 bg-white/5 shadow-[0_10px_38px_-30px_rgba(0,0,0,0.65)] dither-surface flex items-center justify-center transition-transform group-hover:-translate-y-0.5">
                <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-lg tracking-tight transition-colors group-hover:text-white">Beep</span>
                <span className="text-muted-foreground text-sm transition-colors group-hover:text-foreground">Playground</span>
              </div>
            </Link>
            <Link
              href="/beep"
              className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 transition hover:-translate-y-0.5 hover:border-white/24 hover:text-white dither-surface"
            >
              Beep Story
              <span aria-hidden>↗</span>
            </Link>
          </div>

          {/* Center: Mode Toggle */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            {/* Playground Mode Selector */}
            <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-1 shadow-[0_10px_40px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
              {(["payment", "streaming", "mcp"] as PlaygroundMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPlaygroundMode(mode)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize",
                    playgroundMode === mode
                      ? "bg-[#0b0b0d] text-white shadow-md shadow-black/30 border border-white/10"
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Sandbox/Live Toggle */}
            <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-1 shadow-[0_10px_40px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm">
              <button
                onClick={() => {
                  setSandboxMode();
                }}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                  (playgroundMode === "payment" ? paymentMode === "simulation" : playgroundMode === "streaming" ? isStreamingSim : isMCPSim)
                    ? "bg-[#0b0b0d] text-white shadow-md shadow-black/30 border border-white/10"
                    : "text-muted-foreground hover:text-white"
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
                    ? "bg-[#0b0b0d] text-white shadow-md shadow-black/30 border border-white/10"
                    : "text-muted-foreground hover:text-white"
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
        <div className="w-full md:w-[55%] border-r border-white/10 overflow-hidden bg-[#0e0e12]/60 backdrop-blur-sm">
          {playgroundMode === "payment" && <PaymentWidget key={paymentMode} />}
          {playgroundMode === "streaming" && <StreamingWidget />}
          {playgroundMode === "mcp" && <MCPWidget />}
        </div>

        {/* Right: Panel Area */}
        <div className="hidden md:block w-[45%] overflow-hidden bg-[#0c0c12]/50 border-l border-white/8 backdrop-blur-sm">
          {playgroundMode === "payment" && <ResultsPanel />}
          {playgroundMode === "streaming" && <StreamingPanel />}
          {playgroundMode === "mcp" && <MCPPanel />}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0f0f12]/70 px-6 py-3 backdrop-blur-md">
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
