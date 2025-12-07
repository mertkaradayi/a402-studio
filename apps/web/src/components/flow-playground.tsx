"use client";

import { useFlowStore } from "@/stores/flow-store";
import { WalletButton } from "./wallet-button";
import { PaymentWidget } from "./payment-widget";
import { ResultsPanel } from "./panels/results-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { StepIndicator } from "./step-indicator";
import { SettingsDropdown } from "./settings-dropdown";

export function FlowPlayground() {
  const { resetFlow, receipt, paymentMode, setPaymentMode, currentStep, resetSteps } = useFlowStore();

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
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/50">
              <button
                onClick={() => setPaymentMode("simulation")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-all relative",
                  paymentMode === "simulation"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Sandbox
                {paymentMode === "simulation" && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </button>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={() => setPaymentMode("live")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-all relative",
                  paymentMode === "live"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Live
                {paymentMode === "live" && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-neon-green rounded-full" />
                )}
              </button>
            </div>
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

            {(receipt || currentStep >= 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetFlow();
                  resetSteps();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        {currentStep >= 0 && (
          <div className="px-6 pb-3 border-t border-border/50 bg-muted/10">
            <StepIndicator currentStep={currentStep} />
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Payment Widget */}
        <div className="w-full md:w-[55%] border-r border-border overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(#36363B_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.02] dark:opacity-[0.08] pointer-events-none" />
          <PaymentWidget />
        </div>

        {/* Right: Results Panel */}
        <div className="hidden md:block w-[45%] overflow-hidden bg-muted/5">
          <ResultsPanel />
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
