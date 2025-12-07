"use client";

import { useFlowStore } from "@/stores/flow-store";
import { WalletButton } from "./wallet-button";
import { PaymentWidget } from "./payment-widget";
import { ResultsPanel } from "./panels/results-panel";

export function FlowPlayground() {
  const { resetFlow, receipt } = useFlowStore();

  const network = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "mainnet" : "testnet";

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-purple-950/10">
      {/* Header */}
      <header className="border-b border-border bg-black/80 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white font-bold text-sm">🐝</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Beep Playground</h1>
              <p className="text-xs text-muted-foreground">
                USDC Payments on Sui
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Network Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${network === "mainnet"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}>
              {network === "mainnet" ? "◆ Mainnet" : "◇ Testnet"}
            </div>

            <div className="w-px h-6 bg-border" />

            <WalletButton />

            {receipt && (
              <>
                <div className="w-px h-6 bg-border" />
                <button
                  onClick={resetFlow}
                  className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-white border border-border rounded-lg hover:border-purple-500 hover:bg-purple-500/10 transition-colors"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Payment Widget (60%) */}
        <div className="w-[60%] border-r border-border overflow-hidden bg-card/20">
          <PaymentWidget />
        </div>

        {/* Right Column - Results Panel (40%) */}
        <div className="w-[40%] overflow-hidden">
          <ResultsPanel />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-black/50 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground/50">
          <div className="flex items-center gap-4">
            <span>Powered by Beep 🐝</span>
            <span>•</span>
            <span>Sui Network ◆</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://justbeep.it" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">
              Beep
            </a>
            <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
              Sui
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
