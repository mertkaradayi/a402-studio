import { Router, Request, Response } from "express";
import axios, { AxiosError } from "axios";

export const mcpRouter = Router();

// Base MCP endpoint (JSON-RPC over HTTP)
const MCP_BASE_URL = process.env.BEEP_MCP_URL || `${process.env.BEEP_API_URL || "https://api.justbeep.it"}/mcp`;

// Preferred auth: secret key, fallback to publishable (still server-side)
const BEEP_SECRET_KEY = process.env.BEEP_SECRET_KEY;
const BEEP_PUBLISHABLE_KEY = process.env.BEEP_PUBLISHABLE_KEY;

const AUTH_HEADER = BEEP_SECRET_KEY
  ? `Bearer ${BEEP_SECRET_KEY}`
  : BEEP_PUBLISHABLE_KEY
    ? `Bearer ${BEEP_PUBLISHABLE_KEY}`
    : undefined;

function requireAuthOrThrow() {
  if (!AUTH_HEADER) {
    console.error("[MCP] Missing BEEP_SECRET_KEY or BEEP_PUBLISHABLE_KEY");
    throw Object.assign(new Error("BEEP_SECRET_KEY or BEEP_PUBLISHABLE_KEY must be set in apps/api/.env for MCP calls"), {
      statusCode: 500, // Internal Server Error as this is a config issue
    });
  }
}

function buildHeaders(sessionId?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Beep-Client": "beep-sdk",
  };

  if (AUTH_HEADER) headers["Authorization"] = AUTH_HEADER;
  if (sessionId) headers["mcp-session-id"] = sessionId;

  // Required by Beep MCP server
  headers["Accept"] = "application/json, text/event-stream";

  return headers;
}

async function initializeSession() {
  // requireAuthOrThrow(); // Relaxed: Allow init without keys (upstream might allow it)
  try {
    const resp = await axios.post(
      MCP_BASE_URL,
      {
        jsonrpc: "2.0",
        id: "init",
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05", // Required by MCP SDK
          capabilities: {},
          clientInfo: { name: "a402-playground", version: "1.0.0" },
        },
      },
      { headers: buildHeaders() }
    );

    const sessionId = resp.headers["mcp-session-id"] as string | undefined;
    if (!sessionId) {
      console.error("[MCP] Init failed: No session ID returned", resp.data);
      throw new Error("MCP initialize did not return mcp-session-id header");
    }
    return sessionId;
  } catch (error: any) {
    console.error("[MCP] Initialize error:", error.response?.data || error.message);
    throw error;
  }
}

// Helper to parse SSE-wrapped JSON
function parseSSEResponse(data: any) {
  let responseData = data;

  // Handle SSE-wrapped response
  if (typeof responseData === "string" && responseData.includes("event: message") && responseData.includes("data: ")) {
    try {
      const dataLine = responseData.split("\n").find(line => line.startsWith("data: "));
      if (dataLine) {
        const jsonStr = dataLine.replace("data: ", "").trim();
        responseData = JSON.parse(jsonStr);
      }
    } catch (e) {
      console.error("[MCP] Failed to parse SSE response:", e);
    }
  }

  // Handle nested SSE in 'tools' or other properties
  if (responseData && typeof responseData.tools === "string" && responseData.tools.startsWith("event:")) {
    try {
      const dataLine = responseData.tools.split("\n").find((line: string) => line.startsWith("data: "));
      if (dataLine) {
        const jsonStr = dataLine.replace("data: ", "").trim();
        const parsed = JSON.parse(jsonStr);
        if (parsed.result) responseData = { ...responseData, ...parsed.result };
        else responseData = { ...responseData, ...parsed };
        delete responseData.tools;
      }
    } catch (e) {
      console.error("[MCP] Failed to parse SSE tools property:", e);
    }
  }

  return responseData;
}

// Helper to retry calls if session fails (400/401)
async function withSessionRetry<T>(
  action: (sid: string) => Promise<{ data: any; sessionId: string; status: number }>,
  initialSessionId: string
) {
  try {
    return await action(initialSessionId);
  } catch (error) {
    const axiosError = error as AxiosError;
    // If session invalid (400) or auth failed (401), try to re-init once
    if (axiosError.response?.status === 400 || axiosError.response?.status === 401) {
      console.log("[MCP] Session invalid/expired, re-initializing...");
      const newSessionId = await initializeSession();
      return await action(newSessionId);
    }
    throw error;
  }
}

async function callToolsList(sessionId: string) {
  return withSessionRetry(async (sid) => {
    requireAuthOrThrow();
    const resp = await axios.post(
      MCP_BASE_URL,
      {
        jsonrpc: "2.0",
        id: "tools-list",
        method: "tools/list",
        params: {},
      },
      { headers: buildHeaders(sid) }
    );

    const newSessionId = (resp.headers["mcp-session-id"] as string) || sid;
    const responseData = parseSSEResponse(resp.data);

    return { data: responseData, sessionId: newSessionId, status: resp.status };
  }, sessionId);
}

async function callTool(sessionId: string, name: string, parameters: Record<string, unknown> = {}) {
  return withSessionRetry(async (sid) => {
    requireAuthOrThrow();
    const resp = await axios.post(
      MCP_BASE_URL,
      {
        jsonrpc: "2.0",
        id: `call-${name}`,
        method: "tools/call",
        params: {
          name,
          arguments: parameters,
        },
      },
      { headers: buildHeaders(sid), validateStatus: () => true }
    );

    const newSessionId = (resp.headers["mcp-session-id"] as string) || sid;
    const responseData = parseSSEResponse(resp.data);

    return { data: responseData, sessionId: newSessionId, status: resp.status };
  }, sessionId);
}

// GET /mcp/tools -> returns live tools list and sessionId to reuse
mcpRouter.get("/tools", async (req: Request, res: Response) => {
  try {
    const existing = (req.query.sessionId as string) || undefined;
    const sessionId = existing || await initializeSession();
    const { data, sessionId: nextSessionId, status } = await callToolsList(sessionId);

    return res.status(status).json({ sessionId: nextSessionId, tools: data?.result?.tools ?? data?.tools ?? data });
  } catch (error) {
    const axiosError = error as AxiosError & { statusCode?: number };
    const status = axiosError.statusCode || axiosError.response?.status || 500;
    return res.status(status).json({
      error: axiosError.message,
      details: axiosError.response?.data,
      hint: !AUTH_HEADER ? "Set BEEP_SECRET_KEY or BEEP_PUBLISHABLE_KEY in apps/api/.env" : undefined,
      target: MCP_BASE_URL,
    });
  }
});

// POST /mcp/call -> invoke a tool with parameters
mcpRouter.post("/call", async (req: Request, res: Response) => {
  const { sessionId: providedSessionId, name, parameters } = req.body as {
    sessionId?: string;
    name: string;
    parameters?: Record<string, unknown>;
  };

  if (!name) {
    return res.status(400).json({ error: "tool name is required" });
  }

  try {
    const sessionId = providedSessionId || await initializeSession();

    // Auto-inject apiKey if required by tool and available in env
    const finalParameters = { ...parameters };
    if (!finalParameters.apiKey && BEEP_SECRET_KEY) {
      finalParameters.apiKey = BEEP_SECRET_KEY;
    }

    const result = await callTool(sessionId, name, finalParameters);

    return res.status(result.status).json({
      sessionId: result.sessionId,
      status: result.status,
      raw: result.data,
      result: result.data?.result,
      error: result.data?.error,
    });
  } catch (error) {
    const axiosError = error as AxiosError & { statusCode?: number };
    const status = axiosError.statusCode || axiosError.response?.status || 500;
    return res.status(status).json({
      error: axiosError.message,
      details: axiosError.response?.data,
      hint: !AUTH_HEADER ? "Set BEEP_SECRET_KEY or BEEP_PUBLISHABLE_KEY in apps/api/.env" : undefined,
      target: MCP_BASE_URL,
    });
  }
});
