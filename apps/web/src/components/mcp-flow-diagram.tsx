"use client";

import { useMCPStore, MCPFlowStep } from "@/stores/mcp-store";
import { cn } from "@/lib/utils";

// Step type to visual config mapping
const stepConfig: Record<MCPFlowStep["type"], {
  icon: string;
  label: string;
  color: string;
  side: "left" | "center" | "right";
}> = {
  client_request: {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    label: "Request",
    color: "text-primary border-primary bg-primary/10",
    side: "left",
  },
  server_402: {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    label: "402 Required",
    color: "text-amber-500 border-amber-500 bg-amber-500/10",
    side: "right",
  },
  payment_pending: {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    label: "Paying...",
    color: "text-neon-yellow border-neon-yellow bg-neon-yellow/10",
    side: "center",
  },
  payment_complete: {
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    label: "Paid",
    color: "text-neon-green border-neon-green bg-neon-green/10",
    side: "center",
  },
  client_retry: {
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    label: "Retry",
    color: "text-primary border-primary bg-primary/10",
    side: "left",
  },
  server_result: {
    icon: "M5 13l4 4L19 7",
    label: "Result",
    color: "text-neon-green border-neon-green bg-neon-green/10",
    side: "right",
  },
  error: {
    icon: "M6 18L18 6M6 6l12 12",
    label: "Error",
    color: "text-destructive border-destructive bg-destructive/10",
    side: "center",
  },
};

export function MCPFlowDiagram() {
  const { flowSteps, currentInvocation } = useMCPStore();

  if (flowSteps.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <div className="w-32 h-32 mb-4 opacity-50">
          <svg viewBox="0 0 200 120" fill="none" className="w-full h-full">
            {/* Client box */}
            <rect x="10" y="35" width="60" height="50" rx="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <text x="40" y="65" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="monospace">Client</text>

            {/* Server box */}
            <rect x="130" y="35" width="60" height="50" rx="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <text x="160" y="65" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="monospace">Server</text>

            {/* Arrow */}
            <path d="M75 55 L125 55" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M120 50 L125 55 L120 60" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <p className="text-sm text-center">Select a tool and invoke it to see the MCP flow</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header diagram */}
      <div className="flex items-center justify-between px-4">
        <div className="flex flex-col items-center gap-1">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center border-2",
            currentInvocation?.status === "invoking" || currentInvocation?.status === "retrying"
              ? "border-primary bg-primary/10 animate-pulse"
              : "border-muted-foreground/30 bg-muted/30"
          )}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xs font-medium">Client</span>
          <span className="text-[10px] text-muted-foreground">Buyer Agent</span>
        </div>

        {/* Connection line with arrows */}
        <div className="flex-1 mx-4 relative">
          <div className="h-0.5 bg-border w-full absolute top-1/2 -translate-y-1/2" />
          {/* Animated dots when active */}
          {(currentInvocation?.status === "invoking" || currentInvocation?.status === "retrying") && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center border-2",
            currentInvocation?.status === "awaiting_payment"
              ? "border-amber-500 bg-amber-500/10"
              : currentInvocation?.status === "complete"
              ? "border-neon-green bg-neon-green/10"
              : "border-muted-foreground/30 bg-muted/30"
          )}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
          <span className="text-xs font-medium">Server</span>
          <span className="text-[10px] text-muted-foreground">Seller Agent</span>
        </div>
      </div>

      {/* Flow steps timeline */}
      <div className="space-y-3">
        {flowSteps.map((step, index) => {
          const config = stepConfig[step.type];
          const isActive = step.status === "active";
          const isComplete = step.status === "complete";

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3",
                config.side === "left" && "pr-8",
                config.side === "right" && "pl-8 flex-row-reverse",
                config.side === "center" && "justify-center"
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                isActive && `${config.color} animate-pulse`,
                isComplete && config.color,
                !isActive && !isComplete && "border-muted bg-muted/30"
              )}>
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>

              {/* Step content */}
              <div className={cn(
                "flex-1 min-w-0 p-3 rounded-lg border transition-all",
                isActive && `${config.color} border-current`,
                isComplete && "bg-muted/30 border-border",
                !isActive && !isComplete && "bg-muted/10 border-border/50 opacity-50"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                  </svg>
                  <span className="text-sm font-medium">{step.title}</span>
                  {config.side === "left" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">→ Server</span>
                  )}
                  {config.side === "right" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">← Client</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current tool info */}
      {currentInvocation && (
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tool:</span>
            <span className="font-mono">{currentInvocation.toolName}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-muted-foreground">Status:</span>
            <span className={cn(
              "font-medium uppercase",
              currentInvocation.status === "complete" && "text-neon-green",
              currentInvocation.status === "awaiting_payment" && "text-amber-500",
              currentInvocation.status === "error" && "text-destructive"
            )}>
              {currentInvocation.status.replace("_", " ")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
