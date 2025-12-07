"use client";

import { useState } from "react";
import { useFlowStore } from "@/stores/flow-store";
import { validateChallengeSchema } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { SchemaValidationDisplay } from "../shared/schema-validation-display";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function TestEndpointMode() {
  const {
    addDebugLog,
    addHistoryEntry,
    setChallengeValidation,
    challengeValidation,
    setChallenge,
    isLoading,
    setLoading,
  } = useFlowStore();

  const [url, setUrl] = useState("https://");
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [headers, setHeaders] = useState<string>("{}");
  const [body, setBody] = useState<string>("");
  const [response, setResponse] = useState<{
    status: number;
    headers: Record<string, string>;
    body: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setChallengeValidation(null);
    addDebugLog("info", `Testing endpoint: ${method} ${url}`);

    try {
      // Parse custom headers
      let customHeaders: Record<string, string> = {};
      try {
        customHeaders = JSON.parse(headers);
      } catch {
        // Ignore header parse errors
      }

      // Parse body for POST requests
      let parsedBody: unknown = undefined;
      if (method === "POST" && body) {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          parsedBody = body; // Send as raw string if not valid JSON
        }
      }

      addDebugLog("info", "Sending request through backend proxy...");

      // Make request through backend proxy to bypass CORS
      const proxyResponse = await fetch(`${API_URL}/proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          method,
          headers: customHeaders,
          body: parsedBody,
        }),
      });

      const proxyData = await proxyResponse.json();

      // Check if proxy returned an error
      if (proxyData.error) {
        throw new Error(proxyData.error);
      }

      // Format the body for display
      let formattedBody: string;
      if (typeof proxyData.body === "string") {
        // Try to pretty-print JSON
        try {
          formattedBody = JSON.stringify(JSON.parse(proxyData.body), null, 2);
        } catch {
          formattedBody = proxyData.body;
        }
      } else {
        formattedBody = JSON.stringify(proxyData.body, null, 2);
      }

      const responseData = {
        status: proxyData.status,
        headers: proxyData.headers,
        body: formattedBody,
      };

      setResponse(responseData);
      addDebugLog("success", `Received ${proxyData.status} ${proxyData.statusText}`);

      // Validate the response against a402 schema
      let validationResult = null;
      try {
        const parsed = typeof proxyData.body === "string"
          ? JSON.parse(proxyData.body)
          : proxyData.body;
        validationResult = validateChallengeSchema(parsed);
        setChallengeValidation(validationResult);

        if (validationResult.valid) {
          setChallenge(parsed, `HTTP/1.1 ${responseData.status}\n${JSON.stringify(responseData.headers, null, 2)}\n\n${responseData.body}`);
          addDebugLog("success", `Valid a402 challenge! Compliance score: ${validationResult.score}%`);
        } else {
          addDebugLog("warning", `Response received but not a valid a402 challenge. ${validationResult.errors.length} issues found.`);
        }
      } catch {
        addDebugLog("info", "Response body is not JSON - skipping a402 validation");
      }

      // Add to history
      addHistoryEntry({
        mode: "test-endpoint",
        request: {
          url,
          method,
          headers: customHeaders,
          body: body || undefined,
        },
        response: responseData,
        validation: validationResult || undefined,
      });

    } catch (err) {
      let message = err instanceof Error ? err.message : "Unknown error";

      // Provide more helpful error messages
      if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
        message = `Cannot connect to API server at ${API_URL}`;
      }

      setError(message);
      addDebugLog("error", `Request failed: ${message}`);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Request Builder */}
      <div className="w-96 border-r border-border flex-shrink-0 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-neon-yellow uppercase tracking-wide">
              Test Your Endpoint
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Send a request to your API and validate the 402 response
            </p>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Endpoint URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-yellow focus:border-neon-yellow font-mono"
              placeholder="https://api.example.com/protected"
            />
          </div>

          {/* Method Selector */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Method
            </label>
            <div className="flex gap-2">
              {(["GET", "POST"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    method === m
                      ? "bg-neon-yellow text-black"
                      : "bg-card border border-border text-muted-foreground hover:text-white"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Headers */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Headers (JSON)
            </label>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className="w-full h-20 px-3 py-2 bg-input border border-border rounded-md text-xs text-white font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-yellow focus:border-neon-yellow resize-none"
              placeholder='{"Authorization": "Bearer ..."}'
            />
          </div>

          {/* Body (for POST) */}
          {method === "POST" && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Body (JSON)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-24 px-3 py-2 bg-input border border-border rounded-md text-xs text-white font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-yellow focus:border-neon-yellow resize-none"
                placeholder='{"action": "purchase"}'
              />
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleTestEndpoint}
            disabled={isLoading || !url.startsWith("http")}
            className="w-full px-4 py-3 bg-neon-yellow text-black font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Request"}
          </button>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-card/50 p-3 rounded-lg">
            <p>
              <span className="text-neon-green font-medium">✓ Proxy Active:</span> Requests
              are routed through the backend proxy to bypass CORS restrictions.
            </p>
          </div>
        </div>
      </div>

      {/* Center Panel - Response & Validation */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!response && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-20">↖</div>
              <p className="text-muted-foreground">
                Enter your endpoint URL and send a request
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                We'll validate the response against the a402 specification
              </p>
            </div>
          </div>
        )}

        {response && (
          <>
            {/* Response Status */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "text-4xl font-bold",
                  response.status === 402 ? "text-neon-cyan" : "text-muted-foreground"
                )}
              >
                {response.status}
              </div>
              <div>
                <div className="text-sm text-white font-medium">
                  {response.status === 402 ? "Payment Required" : "Response"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {response.status === 402
                    ? "Correct status for a402"
                    : "Expected 402 for a402 flow"}
                </div>
              </div>
            </div>

            {/* Schema Validation */}
            {challengeValidation && (
              <SchemaValidationDisplay
                validation={challengeValidation}
                title="a402 Challenge Validation"
              />
            )}

            {/* Raw Response */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Response Body
              </h3>
              <div className="bg-black rounded-lg border border-border overflow-hidden">
                <pre className="p-4 text-xs font-mono text-muted-foreground overflow-auto max-h-64">
                  {response.body}
                </pre>
              </div>
            </div>

            {/* Response Headers */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Response Headers
              </h3>
              <div className="bg-black rounded-lg border border-border overflow-hidden">
                <pre className="p-4 text-xs font-mono text-muted-foreground overflow-auto">
                  {JSON.stringify(response.headers, null, 2)}
                </pre>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
