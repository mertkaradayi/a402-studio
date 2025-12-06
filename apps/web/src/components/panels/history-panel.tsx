"use client";

import { useFlowStore, type HistoryEntry } from "@/stores/flow-store";
import { cn } from "@/lib/utils";

interface HistoryPanelProps {
  onClose: () => void;
}

export function HistoryPanel({ onClose }: HistoryPanelProps) {
  const { history, clearHistory, setCurrentMode } = useFlowStore();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getModeColor = (mode: HistoryEntry["mode"]) => {
    switch (mode) {
      case "demo":
        return "text-neon-pink";
      case "test-endpoint":
        return "text-neon-yellow";
      case "inspector":
        return "text-neon-cyan";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusColor = (status: number) => {
    if (status === 402) return "text-neon-cyan";
    if (status >= 200 && status < 300) return "text-neon-green";
    if (status >= 400) return "text-red-400";
    return "text-muted-foreground";
  };

  return (
    <div className="h-full flex flex-col bg-black/50">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neon-cyan uppercase tracking-wide">
            History
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {history.length} request{history.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2 opacity-20">📜</div>
              <p className="text-sm text-muted-foreground">No history yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Requests will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="p-3 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-xs font-medium uppercase", getModeColor(entry.mode))}>
                    {entry.mode.replace("-", " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    {entry.request.method}
                  </span>
                  <span
                    className={cn("text-xs font-bold", getStatusColor(entry.response.status))}
                  >
                    {entry.response.status}
                  </span>
                </div>

                <div className="text-xs font-mono text-muted-foreground truncate">
                  {entry.request.url}
                </div>

                {entry.validation && (
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        entry.validation.valid
                          ? "bg-neon-green/20 text-neon-green"
                          : "bg-red-500/20 text-red-400"
                      )}
                    >
                      {entry.validation.valid ? "Valid" : "Invalid"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.validation.score}% score
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
