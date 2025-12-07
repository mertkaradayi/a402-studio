"use client";

import { useState, useEffect, useRef } from "react";
import { useStreamingStore } from "@/stores/streaming-store";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PanelTab = "live" | "charges" | "logs" | "history";

export function StreamingPanel() {
  const { currentSession, sessionHistory, clearHistory } = useStreamingStore();
  const [activeTab, setActiveTab] = useState<PanelTab>("live");
  const [elapsedMs, setElapsedMs] = useState(0);
  const animationRef = useRef<number | null>(null);

  // High-frequency timer update using requestAnimationFrame for smooth ms display
  useEffect(() => {
    if (!currentSession || currentSession.state !== "active" || !currentSession.startedAt) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - currentSession.startedAt! - currentSession.pausedDuration;
      setElapsedMs(elapsed);
      animationRef.current = requestAnimationFrame(updateTimer);
    };

    animationRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentSession?.state, currentSession?.startedAt, currentSession?.pausedDuration]);

  // Reset elapsed time when session changes
  useEffect(() => {
    if (!currentSession?.startedAt) {
      setElapsedMs(0);
    }
  }, [currentSession?.startedAt]);

  // Format time with milliseconds for that fast-ticking feel
  const formatTimeWithMs = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const millis = ms % 1000;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${millis.toString().padStart(3, "0")}`;
  };

  // Format for history (no ms needed)
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString();
  };

  const tabs: { id: PanelTab; label: string }[] = [
    { id: "live", label: "Live" },
    { id: "charges", label: `Charges${currentSession?.charges.length ? ` (${currentSession.charges.length})` : ""}` },
    { id: "logs", label: "Logs" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="px-4 pt-4 pb-2 border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Live Stats Tab */}
        {activeTab === "live" && (
          <div className="space-y-4">
            {/* Big Timer Display */}
            <Card className={cn(
              "overflow-hidden",
              currentSession?.state === "active" && "border-neon-green/30 bg-neon-green/5"
            )}>
              <CardContent className="pt-6 text-center">
                <div className={cn(
                  "text-3xl font-mono font-bold tracking-wider tabular-nums",
                  currentSession?.state === "active" && "text-neon-green"
                )}>
                  {currentSession?.state === "stopped"
                    ? formatTime(currentSession.totalDuration)
                    : formatTimeWithMs(elapsedMs)
                  }
                </div>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">Elapsed Time</p>
              </CardContent>
            </Card>

            {/* Big Accumulated Total */}
            <Card className={cn(
              "overflow-hidden",
              currentSession?.state === "active" && "border-primary/30"
            )}>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-mono font-bold tracking-tight tabular-nums">
                  <span className={cn(
                    "transition-all",
                    currentSession?.state === "active" && "text-neon-green"
                  )}>
                    {currentSession?.totalAccumulated || "0.000000"}
                  </span>
                  <span className="text-lg text-muted-foreground ml-2">USDC</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">Total Accumulated</p>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Tick Count */}
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <div className="text-xl font-mono font-semibold tabular-nums">
                    {currentSession?.charges.length || 0}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">Ticks</p>
                </CardContent>
              </Card>

              {/* Reference Keys */}
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <div className="text-xl font-mono font-semibold tabular-nums">
                    {currentSession?.referenceKeys.length || 0}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">Refs</p>
                </CardContent>
              </Card>

              {/* Session State */}
              <Card>
                <CardContent className="pt-3 pb-3 text-center">
                  <div className={cn(
                    "text-sm font-semibold uppercase",
                    currentSession?.state === "active" && "text-neon-green",
                    currentSession?.state === "paused" && "text-neon-yellow",
                    currentSession?.state === "stopped" && "text-muted-foreground",
                    currentSession?.state === "error" && "text-destructive"
                  )}>
                    {currentSession?.state || "idle"}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">Status</p>
                </CardContent>
              </Card>
            </div>

            {/* Live Activity Indicator */}
            {currentSession?.state === "active" && (
              <div className="flex items-center justify-center gap-2 py-2 bg-neon-green/10 rounded-lg border border-neon-green/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
                </span>
                <span className="text-xs text-neon-green font-medium uppercase tracking-wide">Live Streaming</span>
              </div>
            )}

            {/* Paused Indicator */}
            {currentSession?.state === "paused" && (
              <div className="flex items-center justify-center gap-2 py-2 bg-neon-yellow/10 rounded-lg border border-neon-yellow/20">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-yellow"></span>
                </span>
                <span className="text-xs text-neon-yellow font-medium uppercase tracking-wide">Paused</span>
              </div>
            )}

            {/* Stopped Summary */}
            {currentSession?.state === "stopped" && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-2 bg-muted/50 rounded-lg border border-border">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Session Complete</span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Amount</span>
                    <span className="font-mono font-semibold text-neon-green">{currentSession.totalAccumulated} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-mono">{formatTime(currentSession.totalDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Ticks</span>
                    <span className="font-mono">{currentSession.charges.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference Keys</span>
                    <span className="font-mono">{currentSession.referenceKeys.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* No Session */}
            {!currentSession && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No active session</p>
                <p className="text-xs mt-1">Create a streaming session to begin</p>
              </div>
            )}
          </div>
        )}

        {/* Charges Tab */}
        {activeTab === "charges" && (
          <div className="space-y-2">
            {currentSession?.charges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No charges yet</p>
                <p className="text-xs mt-1">Charges will appear as the stream runs</p>
              </div>
            ) : (
              <>
                {/* Charges List - Most recent first */}
                {[...(currentSession?.charges || [])].reverse().map((charge, idx) => (
                  <div
                    key={charge.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      charge.status === "confirmed" && "bg-neon-green/5 border-neon-green/20",
                      charge.status === "pending" && "bg-neon-yellow/5 border-neon-yellow/20",
                      charge.status === "failed" && "bg-destructive/5 border-destructive/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            charge.status === "confirmed" && "bg-neon-green",
                            charge.status === "pending" && "bg-neon-yellow",
                            charge.status === "failed" && "bg-destructive"
                          )}
                        />
                        <span className="font-mono text-sm">
                          +{charge.amount} {charge.asset}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(charge.timestamp)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground font-mono truncate">
                      {charge.referenceKey}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="space-y-2">
            {currentSession?.logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No logs yet</p>
              </div>
            ) : (
              <>
                {[...(currentSession?.logs || [])].reverse().map((log, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-2 rounded text-sm border-l-2",
                      log.type === "info" && "bg-muted/30 border-primary",
                      log.type === "success" && "bg-neon-green/5 border-neon-green",
                      log.type === "warning" && "bg-neon-yellow/5 border-neon-yellow",
                      log.type === "error" && "bg-destructive/5 border-destructive",
                      log.type === "charge" && "bg-primary/5 border-primary"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{log.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {sessionHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No session history</p>
                <p className="text-xs mt-1">Completed sessions will appear here</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    Clear History
                  </Button>
                </div>
                {sessionHistory.map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className="font-mono">{entry.session.id.slice(0, 20)}...</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.completedAt).toLocaleString()}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-mono text-neon-green">
                          {entry.session.totalAccumulated} USDC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-mono">{formatTime(entry.session.totalDuration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Charges</span>
                        <span className="font-mono">{entry.session.charges.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ref Keys</span>
                        <span className="font-mono">{entry.session.referenceKeys.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Reference Keys Footer (when session has keys) */}
      {currentSession && currentSession.referenceKeys.length > 0 && activeTab === "live" && (
        <div className="border-t border-border p-4">
          <div className="text-xs text-muted-foreground mb-2">
            Reference Keys ({currentSession.referenceKeys.length})
          </div>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {currentSession.referenceKeys.slice(-5).map((key, idx) => (
              <div
                key={idx}
                className="text-xs font-mono bg-muted/30 px-2 py-1 rounded truncate"
                title={key}
              >
                {key}
              </div>
            ))}
            {currentSession.referenceKeys.length > 5 && (
              <div className="text-xs text-muted-foreground text-center">
                +{currentSession.referenceKeys.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
