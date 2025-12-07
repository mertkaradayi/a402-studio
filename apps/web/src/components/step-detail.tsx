"use client";

import { useState } from "react";
import { useFlowStore, StepData } from "@/stores/flow-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { STEPS } from "./step-indicator";

export function StepDetail() {
    const { currentStep, stepData } = useFlowStore();

    // Get all steps with data
    const stepsWithData = Object.entries(stepData)
        .map(([step, data]) => ({ step: parseInt(step), data }))
        .sort((a, b) => a.step - b.step);

    if (stepsWithData.length === 0 && currentStep < 0) {
        return (
            <Card className="bg-muted/10 border-dashed">
                <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium">No Data Yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Run a simulation or start a payment to see step-by-step data
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {stepsWithData.map(({ step, data }) => (
                <StepCard
                    key={step}
                    step={step}
                    data={data}
                    isActive={step === currentStep}
                    isCompleted={step < currentStep}
                />
            ))}
        </div>
    );
}

interface StepCardProps {
    step: number;
    data: StepData;
    isActive: boolean;
    isCompleted: boolean;
}

function StepCard({ step, data, isActive, isCompleted }: StepCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [copied, setCopied] = useState(false);
    const stepInfo = STEPS[step];

    const jsonString = JSON.stringify(data.data, null, 2);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Card
            className={cn(
                "transition-all duration-300 animate-in slide-in-from-top-2",
                isActive && "border-primary/50 bg-primary/5",
                isCompleted && "border-neon-green/30 bg-neon-green/5",
                !isActive && !isCompleted && "opacity-50"
            )}
        >
            <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center justify-between text-xs">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <svg
                            className={cn(
                                "w-3 h-3 text-muted-foreground transition-transform",
                                isExpanded ? "rotate-90" : ""
                            )}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span
                            className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                                isActive && "bg-primary text-primary-foreground",
                                isCompleted && "bg-neon-green text-black",
                                !isActive && !isCompleted && "bg-muted text-muted-foreground"
                            )}
                        >
                            {isCompleted ? "✓" : step + 1}
                        </span>
                        <span className={cn(
                            "font-semibold",
                            isActive && "text-primary",
                            isCompleted && "text-neon-green"
                        )}>
                            {data.title || stepInfo?.label}
                        </span>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(data.timestamp).toLocaleTimeString()}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="Copy JSON"
                        >
                            {copied ? (
                                <svg className="w-3 h-3 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </CardTitle>
            </CardHeader>
            {isExpanded && (
                <CardContent className="px-3 pb-3">
                    <div className="bg-muted/20 rounded-lg p-2 overflow-x-auto max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                        <pre className="text-[10px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            <code>{formatJsonWithHighlight(data.data)}</code>
                        </pre>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

// Simple JSON syntax highlighting
function formatJsonWithHighlight(obj: Record<string, unknown>): React.ReactNode[] {
    const jsonStr = JSON.stringify(obj, null, 2);
    const lines = jsonStr.split('\n');

    return lines.map((line, i) => {
        // Highlight keys
        const keyMatch = line.match(/^(\s*)"([^"]+)":/);
        if (keyMatch) {
            const [, indent, key] = keyMatch;
            const rest = line.slice(keyMatch[0].length);

            // Highlight values
            let valueElement: React.ReactNode = rest;
            if (rest.includes('"')) {
                // String value
                valueElement = <span className="text-neon-green">{rest}</span>;
            } else if (/\d/.test(rest)) {
                // Number value
                valueElement = <span className="text-accent">{rest}</span>;
            } else if (rest.includes('true') || rest.includes('false')) {
                // Boolean value
                valueElement = <span className="text-neon-pink">{rest}</span>;
            }

            return (
                <span key={i}>
                    {indent}<span className="text-primary">"{key}"</span>:{valueElement}
                    {'\n'}
                </span>
            );
        }

        return <span key={i}>{line}{'\n'}</span>;
    });
}
