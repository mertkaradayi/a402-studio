"use client";

import type { SchemaValidationResult } from "@/stores/flow-store";
import { cn } from "@/lib/utils";

interface SchemaValidationDisplayProps {
  validation: SchemaValidationResult;
  title?: string;
}

export function SchemaValidationDisplay({ validation, title = "Schema Validation" }: SchemaValidationDisplayProps) {
  const errorCount = validation.errors.filter((e) => e.severity === "error").length;
  const warningCount = validation.errors.filter((e) => e.severity === "warning").length;

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <div
        className={cn(
          "p-4 rounded-lg border",
          validation.valid
            ? "bg-neon-green/10 border-neon-green/30"
            : "bg-red-500/10 border-red-500/30"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">{title}</h3>
            <p
              className={cn(
                "text-xs mt-1",
                validation.valid ? "text-neon-green" : "text-red-400"
              )}
            >
              {validation.valid ? "Valid" : "Invalid"} • {errorCount} errors, {warningCount} warnings
            </p>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "text-3xl font-bold",
                validation.score >= 80
                  ? "text-neon-green"
                  : validation.score >= 50
                  ? "text-neon-yellow"
                  : "text-red-400"
              )}
            >
              {validation.score}%
            </div>
            <div className="text-xs text-muted-foreground">Compliance</div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {validation.errors.length > 0 && (
        <div className="space-y-2">
          {validation.errors.map((error, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                error.severity === "error"
                  ? "bg-red-500/5 border-red-500/20"
                  : "bg-neon-yellow/5 border-neon-yellow/20"
              )}
            >
              <span
                className={cn(
                  "text-xs font-bold uppercase px-1.5 py-0.5 rounded",
                  error.severity === "error"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-neon-yellow/20 text-neon-yellow"
                )}
              >
                {error.severity}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono text-white">{error.field}</span>
                </div>
                <div className="text-sm text-white mt-0.5">{error.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {validation.errors.length === 0 && (
        <div className="text-center py-4 text-neon-green text-sm">
          All checks passed!
        </div>
      )}
    </div>
  );
}
