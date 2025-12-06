"use client";

import { useState, useMemo } from "react";
import { useFlowStore } from "@/stores/flow-store";
import { generateCurl, generateTypeScript, generatePython } from "@/lib/validators";
import { cn } from "@/lib/utils";

type ExportFormat = "curl" | "typescript" | "python";

const FORMATS: { id: ExportFormat; label: string; icon: React.ReactNode; color: string }[] = [
  {
    id: "curl",
    label: "cURL",
    icon: <span className="font-bold">$_</span>,
    color: "text-neon-green"
  },
  {
    id: "typescript",
    label: "TypeScript",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
      </svg>
    ),
    color: "text-blue-400"
  },
  {
    id: "python",
    label: "Python",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" />
      </svg>
    ),
    color: "text-yellow-400"
  },
];

// Token types for syntax highlighting
type TokenType = 'keyword' | 'builtin' | 'string' | 'bracket' | 'comment' | 'url' | 'normal';

interface Token {
  type: TokenType;
  value: string;
}

// Tokenize code for syntax highlighting
function tokenizeLine(line: string, format: ExportFormat): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    let matched = false;

    // Define patterns based on format
    const patterns: { regex: RegExp; type: TokenType }[] = [];

    if (format === 'curl') {
      patterns.push(
        { regex: /^(curl|--header|-X)\b/, type: 'keyword' },
        { regex: /^(https?:\/\/[^\s"']+)/, type: 'url' },
        { regex: /^("X-RECEIPT"|"Content-Type"|"GET"|"POST")/, type: 'string' },
        { regex: /^'[^']*'/, type: 'string' },
      );
    } else if (format === 'typescript') {
      patterns.push(
        { regex: /^(const|let|var|async|await|function|return|import|from|export|if)\b/, type: 'keyword' },
        { regex: /^(fetch|Response|Headers|JSON|console|response|status)\b/, type: 'builtin' },
        { regex: /^("[^"]*"|'[^']*'|`[^`]*`)/, type: 'string' },
        { regex: /^([{}()\[\]])/, type: 'bracket' },
        { regex: /^(\/\/.*)$/, type: 'comment' },
      );
    } else if (format === 'python') {
      patterns.push(
        { regex: /^(import|from|def|return|if|else|elif|for|in|with|as|try|except|class)\b/, type: 'keyword' },
        { regex: /^(requests|json|print|dict|str|int|True|False|None|get|response)\b/, type: 'builtin' },
        { regex: /^(f?"[^"]*"|f?'[^']*')/, type: 'string' },
        { regex: /^(#.*)$/, type: 'comment' },
      );
    }

    for (const { regex, type } of patterns) {
      const match = remaining.match(regex);
      if (match) {
        tokens.push({ type, value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Add single character as normal
      tokens.push({ type: 'normal', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

// Get color class for token type
function getTokenColor(type: TokenType): string {
  switch (type) {
    case 'keyword': return 'text-neon-pink';
    case 'builtin': return 'text-neon-cyan';
    case 'string': return 'text-neon-green';
    case 'bracket': return 'text-neon-yellow';
    case 'comment': return 'text-muted-foreground italic';
    case 'url': return 'text-neon-cyan';
    default: return 'text-white/80';
  }
}

// Render highlighted code
function highlightCode(code: string, format: ExportFormat): React.ReactNode[] {
  const lines = code.split('\n');

  return lines.map((line, lineIndex) => {
    const tokens = tokenizeLine(line, format);

    return (
      <div key={lineIndex} className="table-row group hover:bg-white/5">
        <span className="table-cell pr-4 text-right text-muted-foreground/50 select-none w-8 group-hover:text-muted-foreground">
          {lineIndex + 1}
        </span>
        <span className="table-cell whitespace-pre">
          {tokens.map((token, i) => (
            <span key={i} className={getTokenColor(token.type)}>
              {token.value}
            </span>
          ))}
        </span>
      </div>
    );
  });
}

interface CodeExportPanelProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function CodeExportPanel({ isExpanded = false, onToggleExpand }: CodeExportPanelProps) {
  const { challenge, receipt, requestConfig, addDebugLog } = useFlowStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("typescript");
  const [copied, setCopied] = useState(false);

  const generateCode = (): string => {
    const url = requestConfig.targetUrl || "https://api.example.com/protected";
    const method = "GET";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

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
  const highlightedCode = useMemo(() => highlightCode(code, selectedFormat), [code, selectedFormat]);

  return (
    <div className="h-full flex flex-col">
      {/* Header with Expand Button */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-neon-yellow/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-yellow to-orange-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Export as Code
              </h2>
              <p className="text-xs text-muted-foreground">
                Copy request code for your app
              </p>
            </div>
          </div>
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className={cn(
                "p-2 rounded-lg transition-all flex items-center gap-1.5",
                isExpanded
                  ? "bg-neon-yellow/20 text-neon-yellow"
                  : "hover:bg-white/10 text-muted-foreground hover:text-neon-yellow"
              )}
              title={isExpanded ? "Collapse panel" : "Expand panel"}
            >
              <svg
                className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  isExpanded && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-xs font-medium">
                {isExpanded ? "Collapse" : "Expand"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Format Selector */}
      <div className="flex border-b border-border bg-card/30">
        {FORMATS.map((format) => (
          <button
            key={format.id}
            onClick={() => setSelectedFormat(format.id)}
            className={cn(
              "flex-1 px-3 py-3 text-xs font-medium transition-all relative flex items-center justify-center gap-2 group",
              selectedFormat === format.id
                ? `${format.color} bg-white/5`
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <span className={cn(
              "transition-transform",
              selectedFormat === format.id ? "scale-110" : "group-hover:scale-105"
            )}>
              {format.icon}
            </span>
            {format.label}
            {selectedFormat === format.id && (
              <div className={cn(
                "absolute bottom-0 left-2 right-2 h-0.5 rounded-full",
                format.id === "curl" ? "bg-neon-green" :
                  format.id === "typescript" ? "bg-blue-400" : "bg-yellow-400"
              )} />
            )}
          </button>
        ))}
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-auto p-4">
        <div className="relative group">
          {/* Code container */}
          <div className="bg-black rounded-xl border border-border overflow-hidden">
            {/* Code header bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {selectedFormat === "curl" ? "terminal" :
                  selectedFormat === "typescript" ? "request.ts" : "request.py"}
              </span>
            </div>

            {/* Code with line numbers */}
            <pre className="p-4 text-xs font-mono overflow-x-auto">
              <code className="table w-full">
                {highlightedCode}
              </code>
            </pre>
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={cn(
              "absolute top-12 right-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5",
              copied
                ? "bg-neon-green text-black"
                : "bg-white/10 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100"
            )}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="border-t border-border p-4 grid grid-cols-2 gap-3">
        {/* Challenge Card */}
        <div className={cn(
          "rounded-lg border p-3 transition-all",
          challenge
            ? "bg-neon-green/5 border-neon-green/30"
            : "bg-card/50 border-border"
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Challenge
            </span>
            {challenge ? (
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            ) : (
              <div className="w-2 h-2 rounded-full border border-muted-foreground/50" />
            )}
          </div>
          {challenge ? (
            <p className="text-xs font-mono text-neon-green truncate">
              {challenge.amount} {challenge.asset}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Not loaded</p>
          )}
        </div>

        {/* Receipt Card */}
        <div className={cn(
          "rounded-lg border p-3 transition-all",
          receipt
            ? "bg-neon-cyan/5 border-neon-cyan/30"
            : "bg-card/50 border-border"
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Receipt
            </span>
            {receipt ? (
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            ) : (
              <div className="w-2 h-2 rounded-full border border-muted-foreground/50" />
            )}
          </div>
          {receipt ? (
            <p className="text-xs font-mono text-neon-cyan truncate">
              {receipt.id.slice(0, 16)}...
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Not generated</p>
          )}
        </div>
      </div>
    </div>
  );
}
