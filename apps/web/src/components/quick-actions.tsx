"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
    onSelectAmount: (amount: string, description: string) => void;
}

const QUICK_AMOUNTS = [
    { amount: "0.01", label: "$0.01", description: "Micro test" },
    { amount: "0.10", label: "$0.10", description: "Small test" },
    { amount: "1.00", label: "$1.00", description: "Standard test" },
    { amount: "10.00", label: "$10.00", description: "Large test" },
];

export function QuickActions({ onSelectAmount }: QuickActionsProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-white/10 rounded-lg overflow-hidden bg-[#0f0f12]/60 backdrop-blur-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
            >
                <span className="text-xs font-medium flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Quick Test Amounts
                </span>
                <svg
                    className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="p-2 grid grid-cols-4 gap-2 bg-[#0b0b0d] animate-in slide-in-from-top-2 duration-200">
                    {QUICK_AMOUNTS.map((item) => (
                        <button
                            key={item.amount}
                            onClick={() => {
                                onSelectAmount(item.amount, item.description);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "p-2 rounded-md border border-white/12 text-center",
                                "hover:border-neon-pink hover:bg-white/5 transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
                            )}
                        >
                            <span className="text-sm font-bold text-primary block">
                                {item.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                                {item.description}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
