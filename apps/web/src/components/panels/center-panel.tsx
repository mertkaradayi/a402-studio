"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";
import { ChallengeTab } from "./tabs/challenge-tab";
import { ReceiptTab } from "./tabs/receipt-tab";
import { VerifyTab } from "./tabs/verify-tab";
import { SuiTab } from "./tabs/sui-tab";

type TabId = "challenge" | "receipt" | "verify" | "sui";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "challenge",
    label: "Challenge",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    id: "receipt",
    label: "Receipt",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  {
    id: "verify",
    label: "Verify",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: "sui",
    label: "Sui Tx",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    )
  },
];

export function CenterPanel() {
  const [activeTab, setActiveTab] = useState<TabId>("challenge");
  const { challenge, receipt } = useFlowStore();

  // Determine which tabs have data
  const hasChallenge = !!challenge;
  const hasReceipt = !!receipt;

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b border-border bg-card/30">
        <div className="flex px-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const hasData =
              (tab.id === "challenge" && hasChallenge) ||
              (tab.id === "receipt" && hasReceipt) ||
              (tab.id === "verify" && hasReceipt) ||
              (tab.id === "sui" && hasReceipt);

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative group",
                  isActive
                    ? "text-neon-cyan"
                    : hasData
                      ? "text-white/70 hover:text-white"
                      : "text-muted-foreground hover:text-white/70"
                )}
              >
                <span className={cn(
                  "transition-colors",
                  isActive ? "text-neon-cyan" : hasData ? "text-neon-green" : ""
                )}>
                  {tab.icon}
                </span>
                {tab.label}
                {hasData && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-neon-cyan rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-transparent to-card/10">
        {activeTab === "challenge" && <ChallengeTab />}
        {activeTab === "receipt" && <ReceiptTab />}
        {activeTab === "verify" && <VerifyTab />}
        {activeTab === "sui" && <SuiTab />}
      </div>
    </div>
  );
}
