"use client";

import { RequestBuilder } from "./panels/request-builder";
import { CenterPanel } from "./panels/center-panel";
import { RightPanel } from "./panels/right-panel";
import { useFlowStore } from "@/stores/flow-store";

export function FlowPlayground() {
  const resetFlow = useFlowStore((state) => state.resetFlow);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-border bg-black px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-neon-pink font-bold text-xl">a402</span>
              <span className="text-white font-light text-xl">Playground</span>
            </div>
            <span className="text-muted-foreground text-sm">
              Inspect & debug Beep payment flows on Sui
            </span>
          </div>
          <button
            onClick={resetFlow}
            className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-white border border-border rounded-md hover:border-neon-pink transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Request Builder */}
        <div className="w-80 border-r border-border flex-shrink-0 overflow-y-auto">
          <RequestBuilder />
        </div>

        {/* Center Panel - Tabbed Viewer */}
        <div className="flex-1 overflow-hidden">
          <CenterPanel />
        </div>

        {/* Right Panel - Code Snippets + Paste Inspector */}
        <div className="w-96 border-l border-border flex-shrink-0 overflow-y-auto">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
