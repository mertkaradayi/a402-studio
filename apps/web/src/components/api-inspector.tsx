import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

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
            <Card className="bg-muted/10 border-dashed">
                <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-xs text-muted-foreground">No API calls yet</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                        Start a payment to see Beep API responses
                    </p>
                </CardContent>
            </Card>
        );
    }

    const selectedCall = calls.find((c) => c.id === expandedId) || calls[0];

    return (
        <Card className="overflow-hidden border-border bg-card">
            {/* Timeline */}
            <div className="p-2 border-b border-border bg-muted/20">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                    {calls.map((call, i) => (
                        <button
                            key={call.id}
                            onClick={() => setExpandedId(call.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] whitespace-nowrap transition-all",
                                (expandedId === call.id || (!expandedId && i === 0))
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                            )}
                        >
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                call.status === "pending" && "bg-neon-yellow animate-pulse",
                                call.status === "success" && "bg-neon-green",
                                call.status === "error" && "bg-destructive"
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
                    <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-card">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                                selectedCall.method === "POST"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : "bg-green-500/10 text-green-500"
                            )}>
                                {selectedCall.method}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[150px]" title={selectedCall.endpoint}>
                                {selectedCall.endpoint}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            {selectedCall.duration && (
                                <span>{selectedCall.duration}ms</span>
                            )}
                            <span className={cn(
                                "px-1.5 py-0.5 rounded font-mono",
                                selectedCall.status === "success" && "bg-neon-green/10 text-neon-green",
                                selectedCall.status === "error" && "bg-destructive/10 text-destructive",
                                selectedCall.status === "pending" && "bg-neon-yellow/10 text-neon-yellow"
                            )}>
                                {selectedCall.status === "success" ? "200" : selectedCall.status === "error" ? "ERR" : "..."}
                            </span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-border bg-muted/10">
                        <button
                            onClick={() => setActiveTab("request")}
                            className={cn(
                                "flex-1 px-3 py-1.5 text-[10px] font-medium transition-all border-b-2",
                                activeTab === "request"
                                    ? "border-primary text-primary bg-primary/5"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
                            )}
                        >
                            Request
                        </button>
                        <button
                            onClick={() => setActiveTab("response")}
                            className={cn(
                                "flex-1 px-3 py-1.5 text-[10px] font-medium transition-all border-b-2",
                                activeTab === "response"
                                    ? "border-primary text-primary bg-primary/5"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
                            )}
                        >
                            Response
                        </button>
                    </div>

                    {/* JSON Content */}
                    <div className="p-0 max-h-48 overflow-auto bg-muted/5">
                        <pre className="p-3 text-[10px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {activeTab === "request"
                                ? JSON.stringify(selectedCall.request || {}, null, 2)
                                : JSON.stringify(selectedCall.response || {}, null, 2)
                            }
                        </pre>
                    </div>
                </>
            )}
        </Card>
    );
}
