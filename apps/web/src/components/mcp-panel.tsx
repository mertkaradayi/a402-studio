"use client";

import { useState } from "react";
import { useMCPStore } from "@/stores/mcp-store";
import { MCPFlowDiagram } from "./mcp-flow-diagram";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PanelTab = "flow" | "logs" | "code" | "history";

// Code templates
const CODE_TEMPLATES = {
  server: `import express from 'express';
import { BeepClient } from '@beep-it/sdk-core';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Initialize Beep client (server-side only)
const beep = new BeepClient({
  apiKey: process.env.BEEP_API_KEY!, // beep_sk_...
});

// Create MCP server
const server = new Server(
  { name: 'my-paid-tools', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Define a paid tool
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'premium_analysis',
    description: 'AI-powered analysis (requires payment)',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Analysis query' }
      },
      required: ['query']
    }
  }]
}));

// Handle tool invocation with 402 flow
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'premium_analysis') {
    // Check for payment reference
    if (!args.paymentReference) {
      // Issue 402 Payment Required
      const payment = await beep.payments.requestAndPurchaseAsset({
        assets: [{ assetId: 'analysis-product-uuid', quantity: 1 }],
        generateQrCode: true,
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'payment_required',
            referenceKey: payment.referenceKey,
            paymentUrl: payment.paymentUrl,
            amount: payment.amount,
          })
        }],
        isError: false,
      };
    }

    // Payment reference provided - execute tool
    const result = await performAnalysis(args.query);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }]
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);`,

  client: `import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@anthropic/sdk/mcp';

// Connect to MCP server
const transport = new StreamableHTTPClientTransport(
  new URL('https://seller-server.example.com/mcp')
);

const client = new Client(
  { name: 'buyer-agent', version: '1.0.0' },
  {}
);

await client.connect(transport);

// Discover available tools
const { tools } = await client.listTools();
console.log('Available tools:', tools.map(t => t.name));

// Invoke a paid tool
async function invokePaidTool(query: string) {
  // Phase 1: Initial call (will return 402)
  const response = await client.callTool({
    name: 'premium_analysis',
    arguments: { query }
  });

  const data = JSON.parse(response.content[0].text);

  if (data.status === 'payment_required') {
    console.log('Payment required:', data.amount);
    console.log('Pay at:', data.paymentUrl);

    // ... user completes payment via wallet ...

    // Phase 2: Retry with payment reference
    const finalResponse = await client.callTool({
      name: 'premium_analysis',
      arguments: {
        query,
        paymentReference: data.referenceKey
      }
    });

    return JSON.parse(finalResponse.content[0].text);
  }

  return data;
}

// Use it
const result = await invokePaidTool('Analyze market trends');
console.log('Result:', result);`,

  tool: `import { z } from 'zod';
import { BeepClient } from '@beep-it/sdk-core';

// Tool input schema
export const myToolSchema = z.object({
  query: z.string().describe('The query to process'),
  paymentReference: z.string().optional().describe('Payment reference from 402 response'),
});

export type MyToolInput = z.infer<typeof myToolSchema>;

// Tool handler
export async function myToolHandler(
  params: MyToolInput,
  beepClient: BeepClient
) {
  // If no payment reference, require payment
  if (!params.paymentReference) {
    const payment = await beepClient.payments.requestAndPurchaseAsset({
      assets: [{ assetId: 'my-product-uuid', quantity: 1 }],
      generateQrCode: true,
      paymentLabel: 'My Tool Access',
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'payment_required',
          payment: {
            referenceKey: payment.referenceKey,
            paymentUrl: payment.paymentUrl,
            qrCode: payment.qrCode,
            amount: payment.amount,
            expiresAt: payment.expiresAt,
          },
          instructions: 'Complete payment, then retry with paymentReference'
        })
      }]
    };
  }

  // Payment verified - execute the actual tool logic
  const result = await processQuery(params.query);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        status: 'success',
        result,
      })
    }]
  };
}`,
};

export function MCPPanel() {
  const { logs, invocationHistory, clearLogs, clearHistory } = useMCPStore();
  const [activeTab, setActiveTab] = useState<PanelTab>("flow");
  const [selectedCodeTemplate, setSelectedCodeTemplate] = useState<keyof typeof CODE_TEMPLATES>("server");
  const [copied, setCopied] = useState(false);

  const tabs: { id: PanelTab; label: string }[] = [
    { id: "flow", label: "Flow" },
    { id: "logs", label: `Logs${logs.length > 0 ? ` (${logs.length})` : ""}` },
    { id: "code", label: "Code" },
    { id: "history", label: "History" },
  ];

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(CODE_TEMPLATES[selectedCodeTemplate]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString();
  };

  const logTypeColors = {
    request: "border-l-primary",
    response: "border-l-neon-green",
    payment: "border-l-amber-500",
    error: "border-l-destructive",
    info: "border-l-muted-foreground",
  };

  const directionIcons = {
    client_to_server: "→",
    server_to_client: "←",
    system: "•",
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0c12]/60 backdrop-blur-sm">
      {/* Tab Navigation */}
      <div className="px-4 pt-4 pb-2 border-b border-white/10 bg-white/5">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all border border-transparent",
                activeTab === tab.id
                  ? "bg-[#0b0b0d] text-white shadow-md shadow-black/30 border border-white/10"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Flow Diagram Tab */}
        {activeTab === "flow" && <MCPFlowDiagram />}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="p-4 space-y-2">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No logs yet</p>
                <p className="text-xs mt-1">Invoke a tool to see activity logs</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="sm" onClick={clearLogs}>
                    Clear
                  </Button>
                </div>
                {[...logs].reverse().map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "p-2 rounded text-sm border-l-2 bg-muted/30",
                      logTypeColors[log.type]
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{directionIcons[log.direction]}</span>
                        <span className="font-medium">{log.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    {log.data !== undefined && log.data !== null && (
                      <pre className="text-xs font-mono bg-background/50 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Code Templates Tab */}
        {activeTab === "code" && (
          <div className="p-4 space-y-4">
            {/* Template selector */}
            <div className="flex gap-2">
              {(Object.keys(CODE_TEMPLATES) as Array<keyof typeof CODE_TEMPLATES>).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedCodeTemplate(key)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize",
                    selectedCodeTemplate === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Code display */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm capitalize">
                  {selectedCodeTemplate === "server" && "MCP Server (Seller)"}
                  {selectedCodeTemplate === "client" && "MCP Client (Buyer)"}
                  {selectedCodeTemplate === "tool" && "Tool Definition"}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto max-h-[400px] overflow-y-auto">
                  {CODE_TEMPLATES[selectedCodeTemplate]}
                </pre>
              </CardContent>
            </Card>

            {/* Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              {selectedCodeTemplate === "server" && (
                <p>This template creates an MCP server that exposes paid tools using the HTTP 402 flow with Beep payments.</p>
              )}
              {selectedCodeTemplate === "client" && (
                <p>This template shows how to connect to an MCP server and handle the 402 payment flow for paid tools.</p>
              )}
              {selectedCodeTemplate === "tool" && (
                <p>This template shows how to define a tool with Zod schema and implement the payment-gated handler.</p>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="p-4 space-y-3">
            {invocationHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No invocation history</p>
                <p className="text-xs mt-1">Completed invocations will appear here</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    Clear
                  </Button>
                </div>
                {invocationHistory.map((inv) => (
                  <Card key={inv.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <span className="font-mono">{inv.toolName}</span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded uppercase",
                          inv.status === "complete" && "bg-neon-green/10 text-neon-green",
                          inv.status === "error" && "bg-destructive/10 text-destructive"
                        )}>
                          {inv.status}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started</span>
                        <span>{new Date(inv.startedAt).toLocaleString()}</span>
                      </div>
                      {inv.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration</span>
                          <span>{inv.completedAt - inv.startedAt}ms</span>
                        </div>
                      )}
                      {inv.paymentRequired && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment</span>
                          <span className="text-amber-500">{inv.paymentRequired.amount} USDC</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
