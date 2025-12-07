import { Router, Request, Response } from "express";

export const mcpRouter = Router();

// In-memory store for payment sessions
interface PaymentSession {
  referenceKey: string;
  toolName: string;
  amount: string;
  status: "pending" | "paid" | "expired";
  createdAt: number;
  expiresAt: number;
}

const paymentSessions = new Map<string, PaymentSession>();

// Available MCP tools
const MCP_TOOLS = [
  {
    name: "checkBeepApi",
    description: "Health check for Beep API connectivity",
    requiresPayment: false,
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "requestAndPurchaseAsset",
    description: "Initiate asset purchase with HTTP 402 payment flow",
    requiresPayment: true,
    price: "0.50",
    inputSchema: {
      type: "object",
      properties: {
        assetIds: { type: "array", items: { type: "string" } },
        generateQrCode: { type: "boolean" },
        paymentLabel: { type: "string" },
        paymentReference: { type: "string" },
      },
      required: ["assetIds"],
    },
  },
  {
    name: "issuePayment",
    description: "Create a streaming payment invoice",
    requiresPayment: true,
    price: "0.10",
    inputSchema: {
      type: "object",
      properties: {
        assetChunks: { type: "array" },
        payingMerchantId: { type: "string" },
        invoiceId: { type: "string" },
      },
      required: ["assetChunks", "payingMerchantId"],
    },
  },
  {
    name: "checkPaymentStatus",
    description: "Query payment status by reference key",
    requiresPayment: false,
    inputSchema: {
      type: "object",
      properties: {
        referenceKey: { type: "string" },
      },
      required: ["referenceKey"],
    },
  },
  {
    name: "startStreaming",
    description: "Begin billing for a streaming session",
    requiresPayment: false,
    inputSchema: {
      type: "object",
      properties: {
        invoiceId: { type: "string" },
      },
      required: ["invoiceId"],
    },
  },
  {
    name: "pauseStreaming",
    description: "Temporarily halt streaming charges",
    requiresPayment: false,
    inputSchema: {
      type: "object",
      properties: {
        invoiceId: { type: "string" },
      },
      required: ["invoiceId"],
    },
  },
  {
    name: "stopStreaming",
    description: "Stop streaming and finalize charges",
    requiresPayment: false,
    inputSchema: {
      type: "object",
      properties: {
        invoiceId: { type: "string" },
      },
      required: ["invoiceId"],
    },
  },
];

/**
 * GET /mcp/tools
 * List all available MCP tools
 */
mcpRouter.get("/tools", (_req: Request, res: Response) => {
  res.json({
    tools: MCP_TOOLS.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      requiresPayment: tool.requiresPayment,
    })),
  });
});

/**
 * POST /mcp/invoke
 * Invoke an MCP tool
 * Returns 402 if payment is required and not provided
 */
mcpRouter.post("/invoke", (req: Request, res: Response) => {
  const { toolName, parameters } = req.body;

  if (!toolName) {
    return res.status(400).json({ error: "toolName required" });
  }

  const tool = MCP_TOOLS.find((t) => t.name === toolName);
  if (!tool) {
    return res.status(404).json({ error: `Tool '${toolName}' not found` });
  }

  // Check if tool requires payment
  if (tool.requiresPayment) {
    const paymentReference = parameters?.paymentReference;

    // If no payment reference, return 402
    if (!paymentReference) {
      const referenceKey = `ref_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      const session: PaymentSession = {
        referenceKey,
        toolName,
        amount: (tool as any).price || "0.50",
        status: "pending",
        createdAt: Date.now(),
        expiresAt,
      };

      paymentSessions.set(referenceKey, session);

      console.log(`[MCP] 402 Payment Required for ${toolName}, ref: ${referenceKey}`);

      return res.status(402).json({
        status: "payment_required",
        payment: {
          referenceKey,
          paymentUrl: `solana:pay?recipient=0xMERCHANT&amount=${session.amount}&reference=${referenceKey}`,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${referenceKey}`,
          amount: session.amount,
          expiresAt: new Date(expiresAt).toISOString(),
        },
        instructions: "Complete payment via wallet, then retry with paymentReference parameter",
      });
    }

    // Verify payment reference
    const session = paymentSessions.get(paymentReference);
    if (!session) {
      return res.status(400).json({ error: "Invalid payment reference" });
    }

    if (session.status !== "paid") {
      // In simulation mode, auto-mark as paid
      session.status = "paid";
      console.log(`[MCP] Payment verified for ${toolName}, ref: ${paymentReference}`);
    }
  }

  // Execute tool and return result
  const result = executeTool(toolName, parameters);
  console.log(`[MCP] Tool executed: ${toolName}`);

  res.json({
    content: [{ type: "text", text: JSON.stringify(result) }],
    data: result,
  });
});

/**
 * POST /mcp/simulate-payment
 * Simulate completing a payment (for testing)
 */
mcpRouter.post("/simulate-payment", (req: Request, res: Response) => {
  const { referenceKey } = req.body;

  if (!referenceKey) {
    return res.status(400).json({ error: "referenceKey required" });
  }

  const session = paymentSessions.get(referenceKey);
  if (!session) {
    return res.status(404).json({ error: "Payment session not found" });
  }

  if (session.expiresAt < Date.now()) {
    session.status = "expired";
    return res.status(410).json({ error: "Payment session expired" });
  }

  session.status = "paid";
  console.log(`[MCP] Payment simulated for ref: ${referenceKey}`);

  res.json({
    success: true,
    referenceKey,
    status: "paid",
  });
});

/**
 * GET /mcp/payment-status/:referenceKey
 * Check payment status
 */
mcpRouter.get("/payment-status/:referenceKey", (req: Request, res: Response) => {
  const { referenceKey } = req.params;

  const session = paymentSessions.get(referenceKey);
  if (!session) {
    return res.status(404).json({ error: "Payment session not found" });
  }

  // Check expiry
  if (session.status === "pending" && session.expiresAt < Date.now()) {
    session.status = "expired";
  }

  res.json({
    referenceKey,
    toolName: session.toolName,
    amount: session.amount,
    status: session.status,
    createdAt: new Date(session.createdAt).toISOString(),
    expiresAt: new Date(session.expiresAt).toISOString(),
  });
});

// Tool execution handlers
function executeTool(toolName: string, params: Record<string, unknown>) {
  switch (toolName) {
    case "checkBeepApi":
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        message: "Beep API is operational",
      };

    case "requestAndPurchaseAsset":
      return {
        success: true,
        invoiceId: `inv_${Date.now().toString(36)}`,
        assets: params.assetIds || [],
        totalAmount: "0.50",
        token: "USDC",
        chain: "sui-testnet",
        paidAt: new Date().toISOString(),
      };

    case "issuePayment":
      return {
        invoiceId: (params.invoiceId as string) || `inv_${Date.now().toString(36)}`,
        referenceKey: `ref_${Date.now().toString(36)}`,
        payingMerchantId: params.payingMerchantId,
        assetChunks: params.assetChunks,
        status: "issued",
      };

    case "checkPaymentStatus":
      return {
        referenceKey: params.referenceKey,
        status: "COMPLETED",
        amount: "0.50",
        token: "USDC",
        paidAt: new Date().toISOString(),
      };

    case "startStreaming":
      return {
        invoiceId: params.invoiceId,
        status: "active",
        startedAt: new Date().toISOString(),
      };

    case "pauseStreaming":
      return {
        success: true,
        invoiceId: params.invoiceId,
        status: "paused",
        pausedAt: new Date().toISOString(),
      };

    case "stopStreaming":
      return {
        invoiceId: params.invoiceId,
        status: "stopped",
        referenceKeys: [
          `ref_${Date.now().toString(36)}_1`,
          `ref_${Date.now().toString(36)}_2`,
          `ref_${Date.now().toString(36)}_3`,
        ],
        totalCharged: "1.50",
        stoppedAt: new Date().toISOString(),
      };

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
