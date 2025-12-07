"use client";

import React, { useState, useCallback } from "react";
import { useMCPStore, MCPTool, MCPInvocation } from "@/stores/mcp-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Tool category colors
const categoryColors = {
  free: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  paid: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  streaming: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const categoryLabels = {
  free: "Free",
  paid: "Paid (402)",
  streaming: "Streaming",
};

export function MCPWidget() {
  const {
    tools,
    selectedTool,
    currentInvocation,
    isSimulationMode,
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
  } = useMCPStore();

  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  const handleSelectTool = (tool: MCPTool) => {
    selectTool(tool.name);
    const initialValues: Record<string, string> = {};
    tool.parameters.forEach((param) => {
      initialValues[param.name] = "";
    });
    setParamValues(initialValues);
  };

  const handleInvokeTool = useCallback(async () => {
    if (!selectedTool) return;

    // Build parameters
    const parameters: Record<string, unknown> = {};
    selectedTool.parameters.forEach((param) => {
      parameters[param.name] = paramValues[param.name];
    });

    clearFlowSteps();
    startInvocation(selectedTool.name, parameters);

    addFlowStep({
      type: "client_request",
      title: "Client Request",
      description: `Invoking ${selectedTool.name}`,
      data: { tool: selectedTool.name, parameters },
      status: "active",
    });

    // Simulation logic
    if (isSimulationMode) {
      await new Promise((r) => setTimeout(r, 500));

      const mockResult = { success: true, timestamp: new Date().toISOString() };

      setInvocationResult(mockResult);

      addFlowStep({
        type: "server_result",
        title: "Simulated Result",
        description: "Success",
        data: mockResult,
        status: "complete"
      });
    }

  }, [selectedTool, paramValues, isSimulationMode, startInvocation, addFlowStep, setInvocationResult]);

  const handleReset = () => {
    resetInvocation();
    clearSelectedTool();
    setParamValues({});
  };

  if (selectedTool) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleReset} className="pl-0 gap-2">
          ← Back to tools
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{selectedTool.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{selectedTool.description}</p>

            <div className="space-y-4">
              {selectedTool.parameters.map((param) => (
                <div key={param.name}>
                  <label className="text-xs font-medium block mb-1">{param.name}</label>
                  <Input
                    value={paramValues[param.name] || ""}
                    onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                    placeholder={param.description}
                  />
                </div>
              ))}

              {!currentInvocation && (
                <Button onClick={handleInvokeTool} className="w-full">
                  Invoke Tool
                </Button>
              )}

              {currentInvocation && (
                <div className="p-4 bg-muted rounded-md font-mono text-xs">
                  Status: {currentInvocation.status}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium mb-4">Available Tools</h2>
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => handleSelectTool(tool)}
          className="w-full p-3 rounded-lg border text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm">{tool.name}</span>
            <span className={cn("text-[10px] uppercase px-1.5 py-0.5 rounded border", categoryColors[tool.category])}>
              {categoryLabels[tool.category]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
        </button>
      ))}
    </div>
  );
}
