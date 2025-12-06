"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChallengeTab } from "./tabs/challenge-tab";
import { ReceiptTab } from "./tabs/receipt-tab";
import { VerifyTab } from "./tabs/verify-tab";
import { SuiTab } from "./tabs/sui-tab";

type TabId = "challenge" | "receipt" | "verify" | "sui";

const TABS: { id: TabId; label: string }[] = [
  { id: "challenge", label: "Challenge" },
  { id: "receipt", label: "Receipt" },
  { id: "verify", label: "Verify" },
  { id: "sui", label: "Sui" },
];

export function CenterPanel() {
  const [activeTab, setActiveTab] = useState<TabId>("challenge");

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b border-border bg-black/50">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-colors relative",
                activeTab === tab.id
                  ? "text-neon-cyan"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "challenge" && <ChallengeTab />}
        {activeTab === "receipt" && <ReceiptTab />}
        {activeTab === "verify" && <VerifyTab />}
        {activeTab === "sui" && <SuiTab />}
      </div>
    </div>
  );
}
