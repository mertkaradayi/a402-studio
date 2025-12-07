"use client";

import { cn } from "@/lib/utils";

interface Step {
    id: number;
    label: string;
    shortLabel: string;
}

const STEPS: Step[] = [
    { id: 0, label: "Challenge", shortLabel: "1" },
    { id: 1, label: "Payment", shortLabel: "2" },
    { id: 2, label: "Receipt", shortLabel: "3" },
    { id: 3, label: "Verification", shortLabel: "4" },
    { id: 4, label: "Complete", shortLabel: "5" },
];

interface StepIndicatorProps {
    currentStep: number;
    className?: string;
}

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-center justify-between">
                {STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1">
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 border-2",
                                    currentStep > step.id
                                        ? "bg-neon-green/20 border-neon-green text-neon-green"
                                        : currentStep === step.id
                                            ? "bg-primary/20 border-primary text-primary animate-pulse"
                                            : "bg-muted/30 border-muted-foreground/30 text-muted-foreground"
                                )}
                            >
                                {currentStep > step.id ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    step.shortLabel
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-[10px] mt-1.5 font-medium transition-colors",
                                    currentStep > step.id
                                        ? "text-neon-green"
                                        : currentStep === step.id
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < STEPS.length - 1 && (
                            <div className="flex-1 h-0.5 mx-2 relative">
                                <div className="absolute inset-0 bg-muted-foreground/20 rounded-full" />
                                <div
                                    className={cn(
                                        "absolute inset-y-0 left-0 bg-neon-green rounded-full transition-all duration-500",
                                        currentStep > step.id ? "w-full" : "w-0"
                                    )}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export { STEPS };
