"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ENV_PUBLISHABLE_KEY = (process.env.NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY || "").trim();
const STORAGE_KEY = "beep:publishableKey";

export function SettingsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState(ENV_PUBLISHABLE_KEY);
    const [saved, setSaved] = useState(false);
    const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
    const [isRevealed, setIsRevealed] = useState(false);
    const [lastSavedKey, setLastSavedKey] = useState(ENV_PUBLISHABLE_KEY);

    // Hydrate from local storage so the field remembers prior entries
    useEffect(() => {
        if (typeof window === "undefined") return;
        const storedKey = window.localStorage.getItem(STORAGE_KEY);
        if (storedKey && storedKey !== ENV_PUBLISHABLE_KEY) {
            setApiKey(storedKey);
            setLastSavedKey(storedKey);
        }
    }, []);

    // Reset transient copy feedback when closing the dropdown
    useEffect(() => {
        if (!isOpen) {
            setCopyState("idle");
        }
    }, [isOpen]);

    const trimmedKey = apiKey.trim();
    const hasKey = trimmedKey.length > 0;
    const looksLikeKey = /^beep_[a-z0-9_:-]{12,}$/i.test(trimmedKey);
    const copyEnabled = hasKey && looksLikeKey;
    const loadedFromEnv = !!ENV_PUBLISHABLE_KEY && ENV_PUBLISHABLE_KEY === trimmedKey;
    const hasUnsavedChanges = trimmedKey !== lastSavedKey.trim();

    const maskedPreview = useMemo(() => {
        if (!hasKey) return "Not configured";
        if (trimmedKey.length <= 8) return `${trimmedKey.slice(0, 3)}...`;
        return `${trimmedKey.slice(0, 6)}...${trimmedKey.slice(-4)}`;
    }, [hasKey, trimmedKey]);

    const handleSave = () => {
        const valueToPersist = trimmedKey;

        if (typeof window !== "undefined") {
            if (valueToPersist) {
                window.localStorage.setItem(STORAGE_KEY, valueToPersist);
            } else {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        }

        setLastSavedKey(valueToPersist);
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
    };

    const handleCopy = async () => {
        if (!copyEnabled) {
            setCopyState("error");
            return;
        }

        try {
            if (typeof navigator === "undefined" || !navigator.clipboard) {
                throw new Error("Clipboard API not available");
            }

            await navigator.clipboard.writeText(trimmedKey);
            setCopyState("copied");
            setTimeout(() => setCopyState("idle"), 1600);
        } catch {
            setCopyState("error");
            setTimeout(() => setCopyState("idle"), 1600);
        }
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
                    <div className="absolute right-0 top-full mt-2 w-96 z-50 bg-card border border-border rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-border">
                            <h3 className="font-semibold text-sm">Configuration</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Manage credentials and runtime context
                            </p>
                        </div>

                        <div className="p-4 space-y-5">
                            {/* API Key */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        <span>Publishable Key</span>
                                        {hasKey ? (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green">
                                                {loadedFromEnv ? "From env" : "Saved locally"}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                                                Required for live
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono">{maskedPreview}</span>
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        type={isRevealed ? "text" : "password"}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="beep_pk_..."
                                        className="h-9 text-xs font-mono"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIsRevealed(!isRevealed)}
                                        aria-label={isRevealed ? "Hide key" : "Reveal key"}
                                    >
                                        {isRevealed ? "Hide" : "Show"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopy}
                                        disabled={!copyEnabled}
                                        className={cn(
                                            "px-3",
                                            copyState === "copied" && "bg-neon-green/10 text-neon-green",
                                            copyState === "error" && "bg-destructive/10 text-destructive"
                                        )}
                                    >
                                        {copyState === "copied" ? "Copied" : "Copy"}
                                    </Button>
                                </div>

                                <div className="flex items-start justify-between text-[10px] text-muted-foreground">
                                    <p className="max-w-[70%]">
                                        {hasKey
                                            ? looksLikeKey
                                                ? "Key looks valid. Copy is available - keep it safe and rotate in env for production."
                                                : "This doesn't look like a full Beep publishable key (expected beep_pk_*)."
                                            : "Add your Beep publishable key to run live flows and copy it on demand."
                                        }
                                    </p>
                                    <a
                                        href="https://app.justbeep.it"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {"Get key ->"}
                                    </a>
                                </div>
                            </div>

                            {/* Environment Info */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-3 rounded bg-muted/50 border border-border/60">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Network</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">SUI</span>
                                    </div>
                                    <p className="mt-1 font-mono text-neon-green">
                                        {process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "Mainnet" : "Testnet"}
                                    </p>
                                </div>
                                <div className="p-3 rounded bg-muted/50 border border-border/60">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">SDK</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-foreground">
                                            @beep-it/sdk
                                        </span>
                                    </div>
                                    <p className="mt-1 font-mono text-foreground/80">Widget + API</p>
                                </div>
                            </div>

                            {/* API Status */}
                            <div className="flex items-center justify-between p-3 rounded bg-muted/50 border border-border/60">
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
                                Close
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={!hasUnsavedChanges}
                                className={cn(
                                    saved && "bg-neon-green text-black",
                                    !hasUnsavedChanges && "opacity-80"
                                )}
                            >
                                {saved ? "Saved" : hasUnsavedChanges ? "Save" : "Up to date"}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
