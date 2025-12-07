"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface APICall {
    id: string;
    timestamp: number;
    method: "POST" | "GET";
    endpoint: string;
    request?: Record<string, unknown>;
    response?: Record<string, unknown>;
    status: "pending" | "success" | "error";
    duration?: number;
}

interface APIInspectorProps {
    calls: APICall[];
}

export function APIInspector({ calls }: APIInspectorProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"request" | "response">("response");

    if (calls.length === 0) {
        return (
            <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <p className="text-xs text-muted-foreground">No API calls yet</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">
                    Start a payment to see Beep API responses
                </p>
            </div>
        );
    }

    const selectedCall = calls.find((c) => c.id === expandedId) || calls[0];

    return (
        <div className="bg-black/50 rounded-xl border border-border overflow-hidden">
            {/* Timeline */}
            <div className="p-3 border-b border-border bg-black/30">
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {calls.map((call, i) => (
                        <button
                            key={call.id}
                            onClick={() => setExpandedId(call.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded text-xs whitespace-nowrap transition-all",
                                (expandedId === call.id || (!expandedId && i === 0))
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                        >
                            <span className={cn(
                                "w-2 h-2 rounded-full",
                                call.status === "pending" && "bg-yellow-400 animate-pulse",
                                call.status === "success" && "bg-green-400",
                                call.status === "error" && "bg-red-400"
                            )} />
                            <span className="font-mono">{call.endpoint.split("/").pop()}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Call Details */}
            {selectedCall && (
                <>
                    {/* Call Info */}
                    <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                                selectedCall.method === "POST"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-green-500/20 text-green-400"
                            )}>
                                {selectedCall.method}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                                {selectedCall.endpoint}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            {selectedCall.duration && (
                                <span>{selectedCall.duration}ms</span>
                            )}
                            <span className={cn(
                                "px-1.5 py-0.5 rounded",
                                selectedCall.status === "success" && "bg-green-500/20 text-green-400",
                                selectedCall.status === "error" && "bg-red-500/20 text-red-400",
                                selectedCall.status === "pending" && "bg-yellow-500/20 text-yellow-400"
                            )}>
                                {selectedCall.status === "success" ? "200" : selectedCall.status === "error" ? "Error" : "..."}
                            </span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setActiveTab("request")}
                            className={cn(
                                "flex-1 px-3 py-1.5 text-xs font-medium transition-all",
                                activeTab === "request"
                                    ? "bg-purple-500/10 text-purple-400 border-b-2 border-purple-500"
                                    : "text-muted-foreground hover:text-white"
                            )}
                        >
                            Request
                        </button>
                        <button
                            onClick={() => setActiveTab("response")}
                            className={cn(
                                "flex-1 px-3 py-1.5 text-xs font-medium transition-all",
                                activeTab === "response"
                                    ? "bg-purple-500/10 text-purple-400 border-b-2 border-purple-500"
                                    : "text-muted-foreground hover:text-white"
                            )}
                        >
                            Response
                        </button>
                    </div>

                    {/* JSON Content */}
                    <div className="p-3 max-h-48 overflow-auto">
                        <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
                            {activeTab === "request"
                                ? JSON.stringify(selectedCall.request || {}, null, 2)
                                : JSON.stringify(selectedCall.response || {}, null, 2)
                            }
                        </pre>
                    </div>
                </>
            )}
        </div>
    );
}
