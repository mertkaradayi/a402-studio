import { create } from "zustand";

// MCP Tool definition
export interface MCPTool {
  name: string;
  description: string;
  category: "free" | "paid" | "streaming";
  parameters: MCPToolParameter[];
  requiresPayment: boolean;
}

export interface MCPToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required: boolean;
  default?: unknown;
  example?: unknown;
}

// Flow step for visualization
export type MCPFlowStepType =
  | "client_request"
  | "server_402"
  | "payment_pending"
  | "payment_complete"
  | "client_retry"
  | "server_result"
  | "error";

export interface MCPFlowStep {
  id: string;
  type: MCPFlowStepType;
  title: string;
  description: string;
  timestamp: number;
  data?: Record<string, unknown>;
  status: "pending" | "active" | "complete" | "error";
}

// Tool invocation state
export interface MCPInvocation {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  status: "idle" | "invoking" | "awaiting_payment" | "retrying" | "complete" | "error";
  paymentRequired?: {
    referenceKey: string;
    paymentUrl: string;
    qrCode?: string;
    amount: string;
    expiresAt: string;
  };
  result?: unknown;
  error?: string;
  startedAt: number;
  completedAt?: number;
}

// Log entry
export interface MCPLogEntry {
  id: string;
  type: "request" | "response" | "payment" | "error" | "info";
  direction: "client_to_server" | "server_to_client" | "system";
  title: string;
  data?: unknown;
  timestamp: number;
}

// Preset MCP tools matching beep-sdk
export const PRESET_MCP_TOOLS: MCPTool[] = [
  {
    name: "checkBeepApi",
    description: "Health check for Beep API connectivity",
    category: "free",
    requiresPayment: false,
    parameters: [],
  },
  {
    name: "requestAndPurchaseAsset",
    description: "Initiate asset purchase with HTTP 402 payment flow",
    category: "paid",
    requiresPayment: true,
    parameters: [
      {
        name: "assetIds",
        type: "array",
        description: "Array of asset UUIDs to purchase",
        required: true,
        example: ["asset_uuid_1", "asset_uuid_2"],
      },
      {
        name: "generateQrCode",
        type: "boolean",
        description: "Whether to generate QR code for payment",
        required: false,
        default: true,
      },
      {
        name: "paymentLabel",
        type: "string",
        description: "Label shown in wallet during payment",
        required: false,
        example: "My Store Purchase",
      },
      {
        name: "paymentReference",
        type: "string",
        description: "Reference key from 402 response (for retry)",
        required: false,
      },
    ],
  },
  {
    name: "issuePayment",
    description: "Create a streaming payment invoice for usage-based billing",
    category: "streaming",
    requiresPayment: true,
    parameters: [
      {
        name: "assetChunks",
        type: "array",
        description: "Array of assets with quantities",
        required: true,
        example: [{ assetId: "uuid", quantity: 1, name: "API Call" }],
      },
      {
        name: "payingMerchantId",
        type: "string",
        description: "ID of merchant being charged",
        required: true,
        example: "merchant_123",
      },
      {
        name: "invoiceId",
        type: "string",
        description: "Optional existing invoice to add charges to",
        required: false,
      },
    ],
  },
  {
    name: "checkPaymentStatus",
    description: "Query the status of a payment by reference key",
    category: "free",
    requiresPayment: false,
    parameters: [
      {
        name: "referenceKey",
        type: "string",
        description: "Payment reference key to check",
        required: true,
        example: "ref_abc123",
      },
    ],
  },
  {
    name: "startStreaming",
    description: "Begin billing for a streaming payment session",
    category: "streaming",
    requiresPayment: true,
    parameters: [
      {
        name: "invoiceId",
        type: "string",
        description: "Invoice ID from issuePayment",
        required: true,
        example: "inv_xyz789",
      },
    ],
  },
  {
    name: "pauseStreaming",
    description: "Temporarily halt streaming charges",
    category: "streaming",
    requiresPayment: false,
    parameters: [
      {
        name: "invoiceId",
        type: "string",
        description: "Invoice ID to pause",
        required: true,
      },
    ],
  },
  {
    name: "stopStreaming",
    description: "Permanently stop streaming and finalize all charges",
    category: "streaming",
    requiresPayment: false,
    parameters: [
      {
        name: "invoiceId",
        type: "string",
        description: "Invoice ID to stop",
        required: true,
      },
    ],
  },
];

interface MCPStore {
  // Available tools
  tools: MCPTool[];

  // Currently selected tool
  selectedTool: MCPTool | null;

  // Current invocation
  currentInvocation: MCPInvocation | null;

  // Flow steps for visualization
  flowSteps: MCPFlowStep[];

  // Activity log
  logs: MCPLogEntry[];

  // Invocation history
  invocationHistory: MCPInvocation[];

  // Simulation mode
  isSimulationMode: boolean;

  // Actions - Tool Selection
  selectTool: (toolName: string) => void;
  clearSelectedTool: () => void;

  // Actions - Invocation
  startInvocation: (toolName: string, parameters: Record<string, unknown>) => void;
  setInvocationStatus: (status: MCPInvocation["status"]) => void;
  setPaymentRequired: (payment: MCPInvocation["paymentRequired"]) => void;
  setInvocationResult: (result: unknown) => void;
  setInvocationError: (error: string) => void;
  completeInvocation: () => void;
  resetInvocation: () => void;

  // Actions - Flow Steps
  addFlowStep: (step: Omit<MCPFlowStep, "id" | "timestamp">) => void;
  updateFlowStepStatus: (stepId: string, status: MCPFlowStep["status"]) => void;
  clearFlowSteps: () => void;

  // Actions - Logging
  addLog: (log: Omit<MCPLogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;

  // Actions - History
  saveToHistory: () => void;
  clearHistory: () => void;

  // Actions - Mode
  setSimulationMode: (mode: boolean) => void;

  // Actions - Reset
  resetAll: () => void;
  resetMCP: () => void;
}

export const useMCPStore = create<MCPStore>((set, get) => ({
  tools: PRESET_MCP_TOOLS,
  selectedTool: null,
  currentInvocation: null,
  flowSteps: [],
  logs: [],
  invocationHistory: [],
  isSimulationMode: true,

  selectTool: (toolName) => {
    const tool = get().tools.find((t) => t.name === toolName) || null;
    set({ selectedTool: tool });
  },

  clearSelectedTool: () => {
    set({ selectedTool: null });
  },

  startInvocation: (toolName, parameters) => {
    const invocation: MCPInvocation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      toolName,
      parameters,
      status: "invoking",
      startedAt: Date.now(),
    };
    set({ currentInvocation: invocation });
  },

  setInvocationStatus: (status) => {
    set((state) => ({
      currentInvocation: state.currentInvocation
        ? { ...state.currentInvocation, status }
        : null,
    }));
  },

  setPaymentRequired: (payment) => {
    set((state) => ({
      currentInvocation: state.currentInvocation
        ? { ...state.currentInvocation, paymentRequired: payment, status: "awaiting_payment" }
        : null,
    }));
  },

  setInvocationResult: (result) => {
    set((state) => ({
      currentInvocation: state.currentInvocation
        ? { ...state.currentInvocation, result, status: "complete", completedAt: Date.now() }
        : null,
    }));
  },

  setInvocationError: (error) => {
    set((state) => ({
      currentInvocation: state.currentInvocation
        ? { ...state.currentInvocation, error, status: "error", completedAt: Date.now() }
        : null,
    }));
  },

  completeInvocation: () => {
    const current = get().currentInvocation;
    if (current) {
      const completedInvocation: MCPInvocation = {
        ...current,
        status: "complete" as const,
        completedAt: Date.now(),
      };
      set((state) => ({
        currentInvocation: completedInvocation,
        invocationHistory: [completedInvocation, ...state.invocationHistory].slice(0, 20),
      }));
    }
  },

  resetInvocation: () => {
    set({ currentInvocation: null, flowSteps: [] });
  },

  addFlowStep: (step) => {
    const newStep: MCPFlowStep = {
      ...step,
      id: `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    set((state) => ({
      flowSteps: [...state.flowSteps, newStep],
    }));
  },

  updateFlowStepStatus: (stepId, status) => {
    set((state) => ({
      flowSteps: state.flowSteps.map((s) =>
        s.id === stepId ? { ...s, status } : s
      ),
    }));
  },

  clearFlowSteps: () => {
    set({ flowSteps: [] });
  },

  addLog: (log) => {
    const newLog: MCPLogEntry = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    set((state) => ({
      logs: [...state.logs, newLog],
    }));
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  saveToHistory: () => {
    const current = get().currentInvocation;
    if (current) {
      set((state) => ({
        invocationHistory: [current, ...state.invocationHistory].slice(0, 20),
      }));
    }
  },

  clearHistory: () => {
    set({ invocationHistory: [] });
  },

  setSimulationMode: (mode) => {
    set({ isSimulationMode: mode });
  },

  resetAll: () => {
    set({
      selectedTool: null,
      currentInvocation: null,
      flowSteps: [],
      logs: [],
    });
  },

  resetMCP: () => {
    set({
      selectedTool: null,
      currentInvocation: null,
      flowSteps: [],
      logs: [],
    });
  },
}));
