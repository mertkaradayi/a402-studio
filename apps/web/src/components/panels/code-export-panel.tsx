"use client";

import { useState } from "react";
import { useFlowStore } from "@/stores/flow-store";
import { generateCurl, generateTypeScript, generatePython } from "@/lib/validators";
import { cn } from "@/lib/utils";

type ExportFormat = "curl" | "typescript" | "python";

const FORMATS: { id: ExportFormat; label: string; icon: string }[] = [
  { id: "curl", label: "cURL", icon: "$" },
  { id: "typescript", label: "TypeScript", icon: "TS" },
  { id: "python", label: "Python", icon: "Py" },
];

export function CodeExportPanel() {
  const { challenge, receipt, requestConfig, addDebugLog } = useFlowStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("curl");
  const [copied, setCopied] = useState(false);

  const generateCode = (): string => {
    const url = requestConfig.targetUrl || "https://api.example.com/protected";
    const method = "GET";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // If we have a receipt, include it as X-RECEIPT header
    if (receipt) {
      headers["X-RECEIPT"] = JSON.stringify(receipt);
    }

    switch (selectedFormat) {
      case "curl":
        return generateCurl(url, method, headers);
      case "typescript":
        return generateTypeScript(url, method, headers);
      case "python":
        return generatePython(url, method, headers);
      default:
        return "";
    }
  };

  const handleCopy = async () => {
    const code = generateCode();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      addDebugLog("success", `${selectedFormat.toUpperCase()} code copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addDebugLog("error", "Failed to copy to clipboard");
    }
  };

  const code = generateCode();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-neon-yellow uppercase tracking-wide">
          Export as Code
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Copy request code for your app
        </p>
      </div>

      {/* Format Selector */}
      <div className="flex border-b border-border">
        {FORMATS.map((format) => (
          <button
            key={format.id}
            onClick={() => setSelectedFormat(format.id)}
            className={cn(
              "flex-1 px-3 py-2.5 text-xs font-medium transition-colors relative",
              selectedFormat === format.id
                ? "text-neon-yellow"
                : "text-muted-foreground hover:text-white"
            )}
          >
            <span className="font-mono mr-1.5 opacity-50">{format.icon}</span>
            {format.label}
            {selectedFormat === format.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-yellow" />
            )}
          </button>
        ))}
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-auto p-4">
        <div className="relative">
          <pre className="bg-black rounded-lg border border-border p-4 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
            {code}
          </pre>
          <button
            onClick={handleCopy}
            className={cn(
              "absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded transition-colors",
              copied
                ? "bg-neon-green/20 text-neon-green"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Challenge/Receipt Preview */}
      <div className="border-t border-border p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Challenge
            </span>
            <span
              className={cn(
                "text-xs",
                challenge ? "text-neon-green" : "text-muted-foreground"
              )}
            >
              {challenge ? "Loaded" : "None"}
            </span>
          </div>
          {challenge && (
            <div className="text-xs font-mono text-muted-foreground bg-black/50 p-2 rounded truncate">
              {challenge.amount} {challenge.asset} • {challenge.chain}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Receipt
            </span>
            <span
              className={cn(
                "text-xs",
                receipt ? "text-neon-green" : "text-muted-foreground"
              )}
            >
              {receipt ? "Ready" : "None"}
            </span>
          </div>
          {receipt && (
            <div className="text-xs font-mono text-muted-foreground bg-black/50 p-2 rounded truncate">
              {receipt.id}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
