"use client";

import { useFlowStore } from "@/stores/flow-store";
import { WalletButton } from "./wallet-button";
import { PaymentWidget } from "./payment-widget";
import { ResultsPanel } from "./panels/results-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { StepIndicator } from "./step-indicator";

export function FlowPlayground() {
  const { resetFlow, receipt, paymentMode, setPaymentMode, currentStep, resetSteps } = useFlowStore();

  const network = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "mainnet" : "testnet";

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-lg">🐝</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Beep Playground</h1>
              <p className="text-xs text-muted-foreground">
                USDC Payments on Sui
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Mode Toggle (Simulation / Live) */}
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setPaymentMode("simulation")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  paymentMode === "simulation"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Simulation
              </button>
              <button
                onClick={() => setPaymentMode("live")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  paymentMode === "live"
                    ? "bg-neon-green text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Live
              </button>
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Network Badge */}
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border bg-muted">
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", network === 'mainnet' ? 'bg-neon-green' : 'bg-neon-yellow')} />
              <span className="uppercase">{network}</span>
            </div>

            <div className="w-px h-6 bg-border" />

            <ModeToggle />

            <WalletButton />

            {(receipt || currentStep >= 0) && (
              <>
                <div className="w-px h-6 bg-border" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetFlow();
                    resetSteps();
                  }}
                  className="hover:border-primary hover:text-primary transition-colors"
                >
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Step Indicator - Show when steps are active */}
        {currentStep >= 0 && (
          <div className="px-6 pb-4 pt-2 border-t border-border/50 bg-muted/20">
            <StepIndicator currentStep={currentStep} />
          </div>
        )}
      </header>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Payment Widget (60%) */}
        <div className="w-full md:w-[60%] border-r border-border overflow-hidden bg-muted/20 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#36363B_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] dark:opacity-[0.1] pointer-events-none" />
          <PaymentWidget />
        </div>

        {/* Right Column - Results Panel (40%) */}
        <div className="hidden md:block w-[40%] overflow-hidden bg-background">
          <ResultsPanel />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Powered by <span className="font-semibold text-foreground">Beep</span></span>
            <span>•</span>
            <span>Sui Network</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://justbeep.it" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Docs
            </a>
            <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              Explorer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
