"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useMCPStore, MCPTool, MCPInvocation } from "@/stores/mcp-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const categoryBadge = (category?: MCPTool["category"]) => {
  switch (category) {
    case "free":
      return "bg-neon-green/10 text-neon-green";
    case "paid":
      return "bg-neon-yellow/10 text-neon-yellow";
    case "streaming":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function MCPWidget() {
  const {
    tools,
    sessionId,
    toolsLoading,
    toolsError,
    selectedTool,
    currentInvocation,
    selectTool,
    clearSelectedTool,
    startInvocation,
    setInvocationStatus,
    setPaymentRequired,
    setInvocationResult,
    setInvocationError,
    addFlowStep,
    updateFlowStepStatus,
    addLog,
    resetInvocation,
    clearFlowSteps,
    setTools,
    setSessionId,
    setToolsLoading,
    setToolsError,
    isSimulationMode,
  } = useMCPStore();

  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"result" | "request" | "curl" | "raw">("result");
  const [mcpTarget, setMcpTarget] = useState<string | null>(null);

  // Fetch tools (Live vs Simulation)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setToolsLoading(true);
      setToolsError(null);

      // SIMULATION MODE
      if (useMCPStore.getState().isSimulationMode) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (cancelled) return;

        const MOCK_TOOLS: MCPTool[] = [
          {
            name: "beep_create_product",
            description: "Create a new product in the Beep system",
            category: "free",
            requiresPayment: false,
            parameters: [
              { name: "name", type: "string", description: "Product name", required: true, example: "Premium Subscription" },
              { name: "price", type: "number", description: "Price in USDC", required: true, example: "9.99" },
              { name: "currency", type: "string", description: "Currency code", required: false, default: "USDC" },
            ],
          },
          {
            name: "beep_pay_for_asset",
            description: "Request access to an asset (requires payment via Beep)",
            category: "paid",
            requiresPayment: true,
            parameters: [
              { name: "assetId", type: "string", description: "Asset UUID", required: true, example: "prod_12345678" },
              { name: "quantity", type: "number", description: "Quantity", required: false, default: 1 },
            ],
          },
          {
            name: "beep_create_invoice",
            description: "Create a one-off payment invoice",
            category: "paid",
            requiresPayment: true,
            parameters: [
              { name: "amount", type: "string", description: "Amount", required: true, example: "10.00" },
              { name: "description", type: "string", description: "Payment description", required: true, example: "Consultation Fee" },
            ],
          },
          {
            name: "beep_list_products",
            description: "List all available products",
            category: "free",
            requiresPayment: false,
            parameters: [],
          },
          {
            name: "beep_get_product",
            description: "Get details of a specific product",
            category: "free",
            requiresPayment: false,
            parameters: [
              { name: "productId", type: "string", description: "Product ID", required: true, example: "prod_123" },
            ],
          },
          {
            name: "beep_list_invoices",
            description: "List all invoices",
            category: "free",
            requiresPayment: false,
            parameters: [],
          },
          {
            name: "beep_get_invoice",
            description: "Get details of a specific invoice",
            category: "free",
            requiresPayment: false,
            parameters: [
              { name: "invoiceId", type: "string", description: "Invoice ID", required: true, example: "inv_123" },
            ],
          },
        ];

        setTools(MOCK_TOOLS);
        setSessionId("sim-session-123");
        setToolsLoading(false);
        return;
      }

      // LIVE MODE
      try {
        const resp = await fetch(`${API_BASE}/mcp/tools`);
        const data = await resp.json();
        if (cancelled) return;
        if (!resp.ok) throw new Error(data?.error || "Failed to load MCP tools");

        const parsedTools = Array.isArray(data.tools)
          ? data.tools.map((tool: any): MCPTool => ({
            name: tool.name,
            description: tool.description || "",
            category: tool.category,
            requiresPayment: tool.requiresPayment ?? false,
            parameters: tool.inputSchema?.properties
              ? Object.entries(tool.inputSchema.properties).map(([key, value]: [string, any]) => ({
                name: key,
                type: value.type || "string",
                description: value.description || "",
                required: tool.inputSchema?.required?.includes(key) || false,
                example: value.example,
              }))
              : tool.parameters || [],
          }))
          : [];

        setTools(parsedTools);
        if (data.sessionId) setSessionId(data.sessionId);
        if (data.target) setMcpTarget(data.target as string);
      } catch (err) {
        if (cancelled) return;
        setToolsError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setToolsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [setTools, setSessionId, setToolsLoading, setToolsError, useMCPStore.getState().isSimulationMode]);

  const handleSelectTool = (tool: MCPTool) => {
    selectTool(tool.name);
    const initial: Record<string, string> = {};
    tool.parameters.forEach((param) => {
      if (param.example !== undefined) {
        initial[param.name] = typeof param.example === "string" ? param.example : JSON.stringify(param.example);
      } else if (param.default !== undefined) {
        initial[param.name] = typeof param.default === "string" ? param.default : JSON.stringify(param.default);
      } else {
        initial[param.name] = "";
      }
    });
    setParamValues(initial);
  };

  const parseParamValue = (value: string, type: string): unknown => {
    if (!value) return undefined;
    try {
      if (type === "array" || type === "object") return JSON.parse(value);
      if (type === "number") return parseFloat(value);
      if (type === "boolean") return value === "true";
      return value;
    } catch {
      return value;
    }
  };

  const handleInvokeTool = useCallback(async (overrideParams?: Record<string, unknown>) => {
    if (!selectedTool) return;

    const parameters: Record<string, unknown> = overrideParams || {};
    if (!overrideParams) {
      selectedTool.parameters.forEach((param) => {
        const value = paramValues[param.name];
        if (value) parameters[param.name] = parseParamValue(value, param.type);
      });
    }

    clearFlowSteps();
    const requestBody = {
      jsonrpc: "2.0",
      id: `call-${selectedTool.name}`,
      method: "tools/call",
      params: {
        name: selectedTool.name,
        arguments: parameters,
      },
    };

    const curlCommand = `curl -X POST ${API_BASE}/mcp/call \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '${JSON.stringify({
      sessionId: useMCPStore.getState().sessionId,
      name: selectedTool.name,
      parameters: parameters
    }, null, 2)}'`;

    startInvocation(selectedTool.name, parameters, requestBody, curlCommand);
    setInvocationStatus("invoking");

    addFlowStep({
      type: "client_request",
      title: "Client Request",
      description: `Invoking ${selectedTool.name}`,
      data: { tool: selectedTool.name, parameters },
      status: "active",
    });

    addLog({
      type: "request",
      direction: "client_to_server",
      title: `tools/call ${selectedTool.name}`,
      data: parameters,
    });

    // SIMULATION MODE INVOCATION
    if (useMCPStore.getState().isSimulationMode) {
      setTimeout(() => {
        // Payment Simulation for paid tools
        if ((selectedTool.requiresPayment || selectedTool.category === "paid") && !overrideParams?.paymentReference) {
          const paymentData = {
            amount: "1.00",
            currency: "USDC",
            referenceKey: `ref_${Date.now()}`,
            paymentUrl: "https://beep.it/simulate-payment",
            expiry: new Date(Date.now() + 3600000).toISOString(),
          };

          addFlowStep({
            type: "server_402",
            title: "402 Payment Required",
            description: "Simulation: Payment required",
            data: paymentData,
            status: "active",
          });

          addLog({ type: "response", direction: "server_to_client", title: "HTTP 402 (Simulated)", data: paymentData });

          setPaymentRequired({
            referenceKey: paymentData.referenceKey,
            paymentUrl: paymentData.paymentUrl,
            amount: paymentData.amount,
            expiresAt: paymentData.expiry,
            raw: paymentData,
          });
          return;
        }

        // Success Simulation
        const mockResult: Record<string, unknown> = {
          success: true,
          message: `Executed ${selectedTool.name} successfully`,
          timestamp: new Date().toISOString(),
          simulated: true,
        };

        // Specific mock logic per tool
        if (selectedTool.name === "beep_create_product") {
          mockResult.product = {
            id: `prod_${Date.now()}`,
            name: parameters.name,
            price: parameters.price,
            currency: parameters.currency || "USDC",
            createdAt: new Date().toISOString(),
          };
          mockResult.message = "Product created successfully";
        } else if (selectedTool.name === "beep_pay_for_asset") {
          mockResult.access = {
            granted: true,
            assetId: parameters.assetId,
            quantity: parameters.quantity || 1,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          };
        } else if (selectedTool.name === "beep_create_invoice") {
          mockResult.invoice = {
            id: `inv_${Date.now()}`,
            status: "paid", // since this runs after "payment" check
            amount: parameters.amount,
            paidAt: new Date().toISOString(),
          };
        } else if (selectedTool.name === "beep_list_products") {
          mockResult.products = [
            { id: "prod_1", name: "Basic Plan", price: "9.99", currency: "USDC" },
            { id: "prod_2", name: "Pro Plan", price: "29.99", currency: "USDC" },
            { id: "prod_3", name: "Enterprise", price: "99.99", currency: "USDC" },
          ];
          mockResult.message = "Found 3 products";
        } else if (selectedTool.name === "beep_get_product") {
          mockResult.product = {
            id: parameters.productId || "prod_123",
            name: "Example Product",
            price: "19.99",
            currency: "USDC",
            description: "Retrieved product details",
            createdAt: new Date(Date.now() - 10000000).toISOString(),
          };
        } else if (selectedTool.name === "beep_list_invoices") {
          mockResult.invoices = [
            { id: "inv_1", amount: "5.00", status: "paid", description: "Coffee" },
            { id: "inv_2", amount: "150.00", status: "pending", description: "Design work" },
          ];
          mockResult.message = "Found 2 invoices";
        } else if (selectedTool.name === "beep_get_invoice") {
          mockResult.invoice = {
            id: parameters.invoiceId || "inv_123",
            amount: "50.00",
            status: "pending",
            paymentUrl: "https://pay.justbeep.it/inv_123",
            createdAt: new Date().toISOString(),
          };
        } else {
          mockResult.data = { ...parameters };
        }

        addFlowStep({
          type: "server_result",
          title: "Tool Result",
          description: "Simulation complete",
          data: mockResult,
          status: "complete",
        });

        addLog({ type: "response", direction: "server_to_client", title: "Tool Success (Simulated)", data: mockResult });
        setInvocationResult(mockResult);
      }, 1500); // 1.5s delay
      return;
    }

    // LIVE MODE INVOCATION
    try {
      const resp = await fetch(`${API_BASE}/mcp/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, name: selectedTool.name, parameters }),
      });

      const data = await resp.json();
      const steps = useMCPStore.getState().flowSteps;
      if (steps[0]) updateFlowStepStatus(steps[0].id, "complete");

      if (data.sessionId) setSessionId(data.sessionId);
      if (data.target) setMcpTarget(data.target as string);

      if (resp.status === 402) {
        const payment = data.raw?.payment || data.raw?.result?.payment || data.raw?.paymentRequired || data.raw;
        addFlowStep({
          type: "server_402",
          title: "402 Payment Required",
          description: "Server requires payment",
          data: payment,
          status: "active",
        });

        addLog({ type: "response", direction: "server_to_client", title: "HTTP 402 Payment Required", data: payment });

        setPaymentRequired({
          referenceKey: payment?.referenceKey || payment?.paymentReference || "",
          paymentUrl: payment?.paymentUrl || payment?.url || "",
          qrCode: payment?.qrCode,
          amount: payment?.amount?.toString?.() || payment?.price?.toString?.() || "",
          expiresAt: payment?.expiresAt || payment?.expiry || "",
          raw: payment,
        });
        return;
      }

      if (resp.ok) {
        const resultPayload = data.result ?? data.raw ?? data;
        addFlowStep({
          type: "server_result",
          title: "Tool Result",
          description: "Execution complete",
          data: resultPayload,
          status: "complete",
        });

        addLog({ type: "response", direction: "server_to_client", title: "Tool Success", data: resultPayload });

        setInvocationResult(resultPayload);
      } else {
        const hint = data?.hint as string | undefined;
        const errorMsg = (data?.error as string | undefined) || `Invocation failed (HTTP ${resp.status})`;
        const combined = hint ? `${errorMsg} — Hint: ${hint}` : errorMsg;
        addLog({
          type: "error",
          direction: "server_to_client",
          title: "Tool Error",
          data: { error: data?.error, hint: data?.hint, details: data?.details, status: resp.status },
        });
        setInvocationError(combined);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addLog({ type: "error", direction: "system", title: "Invocation Error", data: { error: message } });
      setInvocationError(message);
    }
  }, [selectedTool, paramValues, sessionId, clearFlowSteps, startInvocation, setInvocationStatus, addFlowStep, addLog, setSessionId, setPaymentRequired, setInvocationResult, setInvocationError]);

  const handleRetryWithReference = useCallback(() => {
    if (!selectedTool || !currentInvocation?.paymentRequired) return;
    const merged = {
      ...currentInvocation.parameters,
      paymentReference: currentInvocation.paymentRequired.referenceKey,
    };
    handleInvokeTool(merged);
  }, [selectedTool, currentInvocation, handleInvokeTool]);

  const handleReset = () => {
    resetInvocation();
    clearSelectedTool();
    setParamValues({});
  };

  const renderToolList = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Available Tools</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Fetched live from MCP</p>
        </div>
        {sessionId && (
          <span className="text-[10px] font-mono text-muted-foreground" title="mcp-session-id">
            {sessionId.slice(0, 10)}…
          </span>
        )}
      </div>

      {toolsLoading && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Loading tools…
        </div>
      )}

      {toolsError && (
        <Card className="border-destructive/20">
          <CardContent className="p-4 text-sm text-destructive">{toolsError}</CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => handleSelectTool(tool)}
            className={cn(
              "w-full p-4 rounded-xl border border-border/60 bg-card text-left transition-all",
              "hover:border-border hover:bg-muted/30"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-foreground">{tool.name}</span>
                  {tool.category && tool.category !== "unknown" && (
                    <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-medium uppercase", categoryBadge(tool.category))}>
                      {tool.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{tool.description}</p>
              </div>
              <svg className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderInvocationForm = (): React.ReactNode => {
    if (!selectedTool) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          {sessionId && (
            <span className="text-[10px] font-mono text-muted-foreground" title="mcp-session-id">
              {sessionId.slice(0, 10)}…
            </span>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-mono">{selectedTool.name}</CardTitle>
              {selectedTool.category && selectedTool.category !== "unknown" && (
                <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium uppercase", categoryBadge(selectedTool.category))}>
                  {selectedTool.category}
                </span>
              )}
            </div>
          </CardHeader>
          {selectedTool.description && (
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedTool.description}</p>
            </CardContent>
          )}
        </Card>

        {selectedTool.parameters.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Parameters</h3>
            <div className="space-y-4">
              {selectedTool.parameters.map((param) => (
                <div key={param.name} className="space-y-2">
                  <label className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                    <span className="font-mono text-foreground">{param.name}</span>
                    <span className="text-muted-foreground/70">({param.type})</span>
                    {param.required && <span className="text-primary">*</span>}
                  </label>
                  <Input
                    value={paramValues[param.name] || ""}
                    onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                    placeholder={param.description}
                    className="font-mono text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {currentInvocation?.status !== "invoking" && currentInvocation?.status !== "awaiting_payment" && (
          <Button onClick={() => handleInvokeTool()} className="w-full" size="lg">
            Invoke Tool
          </Button>
        )}

        {currentInvocation?.status === "invoking" && (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-3" />
            Invoking...
          </div>
        )}

        {currentInvocation?.status === "awaiting_payment" && currentInvocation.paymentRequired && (
          <Card className="border-neon-yellow/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neon-yellow flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Payment Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono font-medium">{currentInvocation.paymentRequired.amount || "?"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs truncate max-w-[170px]" title={currentInvocation.paymentRequired.referenceKey}>
                  {currentInvocation.paymentRequired.referenceKey || ""}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                {currentInvocation.paymentRequired.paymentUrl && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(currentInvocation.paymentRequired!.paymentUrl, "_blank")}
                  >
                    Pay
                  </Button>
                )}
                <Button className="flex-1" onClick={handleRetryWithReference}>
                  Check Status
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentInvocation?.status === "complete" && !!currentInvocation.result && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  currentInvocation.status === "complete" ? "bg-neon-green" :
                    currentInvocation.status === "error" ? "bg-destructive" :
                      "bg-neon-yellow animate-pulse"
                )} />
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Result
                  {currentInvocation.completedAt && (
                    <span className="text-xs font-normal text-muted-foreground ml-auto font-mono">
                      {((currentInvocation.completedAt - currentInvocation.startedAt) / 1000).toFixed(2)}s
                    </span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>

            <div className="p-0">
              {/* Tabs Header */}
              <div className="flex border-b border-border/40">
                {["Result", "Request", "cURL", "Raw"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase() as any)}
                    className={cn(
                      "px-4 py-2.5 text-xs font-medium transition-colors",
                      activeTab === tab.toLowerCase()
                        ? "text-foreground border-b-2 border-primary bg-muted/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <CardContent className="p-0">
                <div className="p-4 overflow-x-auto whitespace-pre-wrap break-all text-muted-foreground min-h-[120px] max-h-[400px] overflow-y-auto scrollbar-thin">
                  {activeTab === "result" && (
                    <pre className="text-xs font-mono">
                      {(() => {
                        try {
                          // Smart JSON parsing for nested content
                          const resultAny = currentInvocation.result as any;
                          const content = resultAny?.content;
                          if (Array.isArray(content) && content[0]?.type === 'text' && typeof content[0]?.text === 'string') {
                            const innerText = content[0].text.trim();
                            if (innerText.startsWith('{') || innerText.startsWith('[')) {
                              try {
                                const parsedInner = JSON.parse(innerText);
                                return JSON.stringify(parsedInner, null, 2);
                              } catch { } // fallback
                            }
                          }
                          return JSON.stringify(currentInvocation.result, null, 2);
                        } catch {
                          return JSON.stringify(currentInvocation.result, null, 2);
                        }
                      })()}
                    </pre>
                  )}

                  {activeTab === "request" && (
                    <pre className="text-xs font-mono text-neon-cyan">
                      {JSON.stringify(currentInvocation.requestBody || {}, null, 2)}
                    </pre>
                  )}

                  {activeTab === "curl" && (
                    <div className="relative group">
                      <pre className="text-xs font-mono text-primary whitespace-pre-wrap break-all">
                        {currentInvocation.curlCommand || "No cURL available"}
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigator.clipboard.writeText(currentInvocation.curlCommand || "")}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </Button>
                    </div>
                  )}

                  {activeTab === "raw" && (
                    <pre className="text-xs font-mono text-muted-foreground">
                      {JSON.stringify(currentInvocation.raw, null, 2)}
                    </pre>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {currentInvocation?.status === "error" && (
          <Card className="border-destructive/20">
            <CardContent className="pt-4">
              <p className="text-sm text-destructive">{currentInvocation.error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0c12]/60 backdrop-blur-sm">
      <div className="px-6 py-5 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">MCP Inspector</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isSimulationMode ? "Simulated tool execution" : "Live MCP connection"}
              {mcpTarget && !isSimulationMode && (
                <span className="ml-2 font-mono text-[11px] text-muted-foreground/80" title="MCP target">
                  {mcpTarget}
                </span>
              )}
            </p>
          </div>
          <div className={cn(
            "px-2.5 py-1 rounded-lg text-xs font-medium border border-white/10",
            isSimulationMode
              ? "bg-muted text-muted-foreground"
              : "bg-neon-green/10 text-neon-green"
          )}>
            {isSimulationMode ? "Simulation" : "Live"}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="max-w-xl mx-auto">
          {selectedTool ? renderInvocationForm() : renderToolList()}
        </div>
      </div>
    </div>
  );
}
