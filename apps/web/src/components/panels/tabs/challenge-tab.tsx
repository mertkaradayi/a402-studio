"use client";

import { useFlowStore } from "@/stores/flow-store";

export function ChallengeTab() {
  const { challenge, rawChallengeResponse } = useFlowStore();

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-sm">
          {/* Animated 402 Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 border border-neon-pink/30 flex items-center justify-center">
              <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-cyan">
                402
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-neon-yellow rounded-full flex items-center justify-center animate-bounce">
              <span className="text-black text-sm">?</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">
            No Challenge Yet
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Select a preset scenario and click "Load Challenge" to see the HTTP 402 response.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-neon-cyan">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Use the left panel to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Raw HTTP Response */}
      <div>
        <h3 className="text-xs font-semibold text-neon-yellow uppercase tracking-wide mb-3">
          Raw HTTP 402 Response
        </h3>
        <div className="bg-black rounded-lg border border-border overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-card/50">
            <span className="text-xs font-mono text-neon-pink">HTTP/1.1 402 Payment Required</span>
          </div>
          <pre className="p-4 text-xs font-mono text-muted-foreground overflow-auto max-h-48">
            {rawChallengeResponse}
          </pre>
        </div>
      </div>

      {/* Parsed Challenge */}
      <div>
        <h3 className="text-xs font-semibold text-neon-yellow uppercase tracking-wide mb-3">
          Parsed Challenge
        </h3>
        <div className="bg-black rounded-lg border border-border overflow-hidden">
          <pre className="p-4 text-xs font-mono overflow-auto">
            <code>
              <span className="text-muted-foreground">{"{"}</span>
              {"\n"}
              <span className="text-neon-cyan">  "required_amount"</span>
              <span className="text-muted-foreground">: </span>
              <span className="text-neon-green">"{challenge.amount}"</span>
              <span className="text-muted-foreground">,</span>
              {"\n"}
              <span className="text-neon-cyan">  "asset"</span>
              <span className="text-muted-foreground">: </span>
              <span className="text-neon-green">"{challenge.asset}"</span>
              <span className="text-muted-foreground">,</span>
              {"\n"}
              <span className="text-neon-cyan">  "chain"</span>
              <span className="text-muted-foreground">: </span>
              <span className="text-neon-green">"{challenge.chain}"</span>
              <span className="text-muted-foreground">,</span>
              {"\n"}
              <span className="text-neon-cyan">  "nonce"</span>
              <span className="text-muted-foreground">: </span>
              <span className="text-neon-green">"{challenge.nonce}"</span>
              <span className="text-muted-foreground">,</span>
              {"\n"}
              <span className="text-neon-cyan">  "recipient"</span>
              <span className="text-muted-foreground">: </span>
              <span className="text-neon-green">"{challenge.recipient}"</span>
              <span className="text-muted-foreground">,</span>
              {"\n"}
              <span className="text-neon-cyan">  "payment_endpoint"</span>
              <span className="text-muted-foreground">: </span>
              <span className="text-neon-green">"{challenge.callback || "..."}"</span>
              {"\n"}
              <span className="text-muted-foreground">{"}"}</span>
            </code>
          </pre>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-xs text-muted-foreground mb-1">Amount Required</div>
          <div className="text-lg font-semibold text-neon-green">
            {challenge.amount} {challenge.asset}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-xs text-muted-foreground mb-1">Expires In</div>
          <div className="text-lg font-semibold text-neon-yellow">
            {challenge.expiry
              ? `${Math.max(0, Math.floor((challenge.expiry * 1000 - Date.now()) / 1000))}s`
              : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}
