import { create } from "zustand";

// App modes
export type AppMode = "demo" | "test-endpoint" | "inspector";

// Preset scenarios
export type PresetScenario =
  | "valid-payment"
  | "expired-nonce"
  | "wrong-amount"
  | "invalid-signature"
  | "chain-mismatch"
  | "custom";

export interface A402Challenge {
  amount: string;
  asset: string;
  chain: string;
  recipient: string;
  nonce: string;
  expiry?: number;
  callback?: string;
}

export interface A402Receipt {
  id: string;
  requestNonce: string;
  payer: string;
  merchant: string;
  amount: string;
  asset: string;
  chain: string;
  txHash: string;
  signature: string;
  issuedAt: number;
}

export interface RequestConfig {
  targetUrl: string;
  amount: string;
  chain: string;
  description: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string; severity: "error" | "warning" }>;
  score: number; // 0-100 compliance score
}

export interface VerificationResult {
  valid: boolean;
  errors: string[];
  checks: {
    amountMatch: boolean;
    chainMatch: boolean;
    nonceValid: boolean;
    signatureValid: boolean;
    notExpired: boolean;
    recipientMatch: boolean;
  };
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  mode: AppMode;
  request: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
  };
  response: {
    status: number;
    headers?: Record<string, string>;
    body: string;
  };
  validation?: SchemaValidationResult;
}

export interface DebugLogEntry {
  type: "info" | "warning" | "error" | "success";
  message: string;
  timestamp: number;
}

interface FlowState {
  // App mode
  currentMode: AppMode;

  // Preset scenario (for demo mode)
  selectedPreset: PresetScenario;

  // Step 1: Request configuration
  requestConfig: RequestConfig;

  // Step 2: Received challenge
  challenge: A402Challenge | null;
  rawChallengeResponse: string | null;
  challengeValidation: SchemaValidationResult | null;

  // Step 3-4: Payment and receipt
  receipt: A402Receipt | null;
  rawReceipt: string | null;

  // Step 5: Verification result
  verificationResult: VerificationResult | null;

  // Request history
  history: HistoryEntry[];

  // Debug logs
  debugLogs: DebugLogEntry[];

  // Inspector mode - pasted content
  inspectorInput: string;
  inspectorType: "challenge" | "receipt";

  // Loading states
  isLoading: boolean;

  // Actions - Mode
  setCurrentMode: (mode: AppMode) => void;
  setSelectedPreset: (preset: PresetScenario) => void;

  // Actions - Request
  setRequestConfig: (config: Partial<RequestConfig>) => void;
  setChallenge: (challenge: A402Challenge, rawResponse: string) => void;
  setChallengeValidation: (validation: SchemaValidationResult | null) => void;

  // Actions - Receipt
  setReceipt: (receipt: A402Receipt, rawReceipt: string) => void;
  setVerificationResult: (result: VerificationResult) => void;

  // Actions - History
  addHistoryEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;

  // Actions - Debug
  addDebugLog: (type: DebugLogEntry["type"], message: string) => void;
  clearDebugLogs: () => void;

  // Actions - Inspector
  setInspectorInput: (input: string) => void;
  setInspectorType: (type: "challenge" | "receipt") => void;

  // Actions - Loading
  setLoading: (loading: boolean) => void;

  // Actions - Reset
  resetFlow: () => void;
}

const initialRequestConfig: RequestConfig = {
  targetUrl: "https://api.example.com/protected-resource",
  amount: "0.50",
  chain: "sui-testnet",
  description: "API call payment",
};

export const useFlowStore = create<FlowState>((set) => ({
  currentMode: "demo",
  selectedPreset: "valid-payment",
  requestConfig: initialRequestConfig,
  challenge: null,
  rawChallengeResponse: null,
  challengeValidation: null,
  receipt: null,
  rawReceipt: null,
  verificationResult: null,
  history: [],
  debugLogs: [],
  inspectorInput: "",
  inspectorType: "receipt",
  isLoading: false,

  setCurrentMode: (mode) => set({ currentMode: mode }),

  setSelectedPreset: (preset) => set({ selectedPreset: preset }),

  setRequestConfig: (config) =>
    set((state) => ({
      requestConfig: { ...state.requestConfig, ...config },
    })),

  setChallenge: (challenge, rawResponse) =>
    set({
      challenge,
      rawChallengeResponse: rawResponse,
    }),

  setChallengeValidation: (validation) =>
    set({ challengeValidation: validation }),

  setReceipt: (receipt, rawReceipt) =>
    set({
      receipt,
      rawReceipt,
    }),

  setVerificationResult: (result) =>
    set({ verificationResult: result }),

  addHistoryEntry: (entry) =>
    set((state) => ({
      history: [
        {
          ...entry,
          id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          timestamp: Date.now(),
        },
        ...state.history,
      ].slice(0, 50), // Keep last 50 entries
    })),

  clearHistory: () => set({ history: [] }),

  addDebugLog: (type, message) =>
    set((state) => ({
      debugLogs: [
        ...state.debugLogs,
        { type, message, timestamp: Date.now() },
      ],
    })),

  clearDebugLogs: () => set({ debugLogs: [] }),

  setInspectorInput: (input) => set({ inspectorInput: input }),

  setInspectorType: (type) => set({ inspectorType: type }),

  setLoading: (loading) => set({ isLoading: loading }),

  resetFlow: () =>
    set({
      requestConfig: initialRequestConfig,
      challenge: null,
      rawChallengeResponse: null,
      challengeValidation: null,
      receipt: null,
      rawReceipt: null,
      verificationResult: null,
      debugLogs: [],
      inspectorInput: "",
      isLoading: false,
    }),
}));

// Preset scenario data
export const PRESET_SCENARIOS: Record<PresetScenario, {
  name: string;
  description: string;
  challenge: A402Challenge;
  receipt: A402Receipt;
  expectedResult: "valid" | "invalid";
}> = {
  "valid-payment": {
    name: "Valid Payment",
    description: "A correctly formatted payment that passes all checks",
    challenge: {
      amount: "0.50",
      asset: "USDC",
      chain: "sui-testnet",
      recipient: "0x7d8f3c2a1b4e5f6789012345abcdef0123456789",
      nonce: "nonce_valid_12345",
      expiry: Math.floor(Date.now() / 1000) + 300,
    },
    receipt: {
      id: "rcpt_valid_001",
      requestNonce: "nonce_valid_12345",
      payer: "0x9a8b7c6d5e4f3210fedcba9876543210abcdef12",
      merchant: "0x7d8f3c2a1b4e5f6789012345abcdef0123456789",
      amount: "0.50",
      asset: "USDC",
      chain: "sui-testnet",
      txHash: "0xabc123def456789012345678901234567890abcdef1234567890abcdef123456",
      signature: "demo:valid",
      issuedAt: Math.floor(Date.now() / 1000),
    },
    expectedResult: "valid",
  },
  "expired-nonce": {
    name: "Expired Nonce",
    description: "Payment with an expired challenge (past expiry time)",
    challenge: {
      amount: "0.50",
      asset: "USDC",
      chain: "sui-testnet",
      recipient: "0x7d8f3c2a1b4e5f6789012345abcdef0123456789",
      nonce: "nonce_expired_999",
      expiry: Math.floor(Date.now() / 1000) - 600, // Expired 10 mins ago
    },
    receipt: {
      id: "rcpt_expired_001",
      requestNonce: "nonce_expired_999",
      payer: "0x9a8b7c6d5e4f3210fedcba9876543210abcdef12",
      merchant: "0x7d8f3c2a1b4e5f6789012345abcdef0123456789",
      amount: "0.50",
      asset: "USDC",
      chain: "sui-testnet",
      txHash: "0xdef456abc789012345678901234567890abcdef1234567890abcdef123456abc",
      signature: "demo:expired",
      issuedAt: Math.floor(Date.now() / 1000) - 300,
    },
    expectedResult: "invalid",
  },
  "wrong-amount": {
    name: "Wrong Amount",
    description: "Receipt amount doesn't match challenge requirement",
    challenge: {
      amount: "1.00",
      asset: "USDC",
      chain: "sui-testnet",
      recipient: "0x7d8f3c2a1b4e5f6789012345abcdef0123456789",
      nonce: "nonce_amount_777",
      expiry: Math.floor(Date.now() / 1000) + 300,
    },
    receipt: {
      id: "rcpt_wrongamt_001",
      requestNonce: "nonce_amount_777",
      payer: "0x9a8b7c6d5e4f3210fedcba9876543210abcdef12",
      merchant: "0x7d8f3c2a1b4e5f6789012345abcdef0123456789",
      amount: "0.50", // Wrong! Should be 1.00
      asset: "USDC",
      chain: "sui-testnet",
      txHash: "0x789abc123def456012345678901234567890abcdef1234567890abcdef789abc",
      signature: "demo:wrong-amount",
      issuedAt: Math.floor(Date.now() / 1000),
    },
    expectedResult: "invalid",
  },
  "invalid-signature": {
    name: "Invalid Signature",
    description: "Receipt with a malformed or invalid signature",
    challenge: {
      amount: "0.50",
      asset: "USDC",
      chain: "sui-testnet",
      recipient: "0x7d8f3c2a1b4e5f6789012345abcdef0123456789",
      nonce: "nonce_sig_555",
      expiry: Math.floor(Date.now() / 1000) + 300,
    },
    receipt: {
      id: "rcpt_badsig_001",
      requestNonce: "nonce_sig_555",
      payer: "0x9a8b7c6d5e4f3210fedcba9876543210abcdef12",
      merchant: "0x7d8f3c2a1b4e5f6789012345abcdef0123456789",
      amount: "0.50",
      asset: "USDC",
      chain: "sui-testnet",
      txHash: "0x456def789abc012345678901234567890abcdef1234567890abcdef456def789",
      signature: "INVALID_SIGNATURE", // Invalid!
      issuedAt: Math.floor(Date.now() / 1000),
    },
    expectedResult: "invalid",
  },
  "chain-mismatch": {
    name: "Chain Mismatch",
    description: "Receipt is for a different chain than requested",
    challenge: {
      amount: "0.50",
      asset: "USDC",
      chain: "sui-mainnet",
      recipient: "0x7d8f3c2a1b4e5f6789012345abcdef0123456789",
      nonce: "nonce_chain_333",
      expiry: Math.floor(Date.now() / 1000) + 300,
    },
    receipt: {
      id: "rcpt_chainmis_001",
      requestNonce: "nonce_chain_333",
      payer: "0x9a8b7c6d5e4f3210fedcba9876543210abcdef12",
      merchant: "0x7d8f3c2a1b4e5f6789012345abcdef0123456789",
      amount: "0.50",
      asset: "USDC",
      chain: "sui-testnet", // Wrong! Should be mainnet
      txHash: "0x123abc456def789012345678901234567890abcdef1234567890abcdef123abc",
      signature: "demo:chain-mismatch",
      issuedAt: Math.floor(Date.now() / 1000),
    },
    expectedResult: "invalid",
  },
  "custom": {
    name: "Custom",
    description: "Enter your own values",
    challenge: {
      amount: "",
      asset: "USDC",
      chain: "sui-testnet",
      recipient: "",
      nonce: "",
    },
    receipt: {
      id: "",
      requestNonce: "",
      payer: "",
      merchant: "",
      amount: "",
      asset: "USDC",
      chain: "sui-testnet",
      txHash: "",
      signature: "",
      issuedAt: 0,
    },
    expectedResult: "valid",
  },
};
