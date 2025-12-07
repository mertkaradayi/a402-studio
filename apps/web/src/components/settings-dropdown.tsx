"use client";

import { useState } from "react";
import { useFlowStore } from "@/stores/flow-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SettingsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY || "");
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // In a real app, this would update the config
        // For now, we just show feedback
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-1.5"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline text-xs">Settings</span>
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-80 z-50 bg-card border border-border rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-border">
                            <h3 className="font-semibold text-sm">Configuration</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Manage your Beep settings
                            </p>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* API Key */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium flex items-center gap-2">
                                    Publishable Key
                                    {apiKey && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green">
                                            Configured
                                        </span>
                                    )}
                                </label>
                                <Input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="beep_pk_..."
                                    className="h-9 text-xs font-mono"
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Get your key from{" "}
                                    <a
                                        href="https://app.justbeep.it"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        app.justbeep.it
                                    </a>
                                </p>
                            </div>

                            {/* Environment Info */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Environment</label>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-2 rounded bg-muted/50">
                                        <span className="text-muted-foreground">Network</span>
                                        <p className="font-mono text-neon-green">SUI Mainnet</p>
                                    </div>
                                    <div className="p-2 rounded bg-muted/50">
                                        <span className="text-muted-foreground">SDK</span>
                                        <p className="font-mono">@beep-it/sdk</p>
                                    </div>
                                </div>
                            </div>

                            {/* API Status */}
                            <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                                <span className="text-xs text-muted-foreground">Beep API</span>
                                <span className="flex items-center gap-1.5 text-xs">
                                    <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                                    Online
                                </span>
                            </div>
                        </div>

                        <div className="p-4 border-t border-border flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                className={cn(saved && "bg-neon-green text-black")}
                            >
                                {saved ? "Saved!" : "Save"}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
