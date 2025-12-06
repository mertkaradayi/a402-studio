import { create } from "zustand";

export type FlowStep =
  | "request-builder"
  | "challenge-viewer"
  | "payment-trigger"
  | "receipt-decoder"
  | "verification"
  | "sui-explorer"
  | "debug-inspector"
  | "paste-inspector"
  | "code-snippets";

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

export interface VerificationResult {
  valid: boolean;
  errors: string[];
  checks: {
    amountMatch: boolean;
    chainMatch: boolean;
    nonceValid: boolean;
    signatureValid: boolean;
  };
}

interface FlowState {
  // Current step in the flow
  currentStep: FlowStep;

  // Step 1: Request configuration
  requestConfig: RequestConfig;

  // Step 2: Received challenge
  challenge: A402Challenge | null;
  rawChallengeResponse: string | null;

  // Step 3-4: Payment and receipt
  receipt: A402Receipt | null;
  rawReceipt: string | null;

  // Step 5: Verification result
  verificationResult: VerificationResult | null;

  // Step 6: Sui transaction info
  suiTxInfo: {
    txHash: string;
    from: string;
    to: string;
    amount: string;
    timestamp: string;
  } | null;

  // Step 7: Debug errors/logs
  debugLogs: Array<{
    type: "info" | "warning" | "error";
    message: string;
    timestamp: number;
  }>;

  // Step 8: Paste-in receipt for standalone inspection
  pastedReceipt: string | null;

  // Loading states
  isLoading: boolean;

  // Actions
  setCurrentStep: (step: FlowStep) => void;
  setRequestConfig: (config: Partial<RequestConfig>) => void;
  setChallenge: (challenge: A402Challenge, rawResponse: string) => void;
  setReceipt: (receipt: A402Receipt, rawReceipt: string) => void;
  setVerificationResult: (result: VerificationResult) => void;
  setSuiTxInfo: (info: FlowState["suiTxInfo"]) => void;
  addDebugLog: (type: "info" | "warning" | "error", message: string) => void;
  clearDebugLogs: () => void;
  setPastedReceipt: (receipt: string) => void;
  setLoading: (loading: boolean) => void;
  resetFlow: () => void;
}

const initialRequestConfig: RequestConfig = {
  targetUrl: "https://api.example.com/protected-resource",
  amount: "0.50",
  chain: "sui-testnet",
  description: "API call payment",
};

export const useFlowStore = create<FlowState>((set) => ({
  currentStep: "request-builder",
  requestConfig: initialRequestConfig,
  challenge: null,
  rawChallengeResponse: null,
  receipt: null,
  rawReceipt: null,
  verificationResult: null,
  suiTxInfo: null,
  debugLogs: [],
  pastedReceipt: null,
  isLoading: false,

  setCurrentStep: (step) => set({ currentStep: step }),

  setRequestConfig: (config) =>
    set((state) => ({
      requestConfig: { ...state.requestConfig, ...config },
    })),

  setChallenge: (challenge, rawResponse) =>
    set({
      challenge,
      rawChallengeResponse: rawResponse,
      currentStep: "challenge-viewer",
    }),

  setReceipt: (receipt, rawReceipt) =>
    set({
      receipt,
      rawReceipt,
      currentStep: "receipt-decoder",
    }),

  setVerificationResult: (result) =>
    set({
      verificationResult: result,
      currentStep: "verification",
    }),

  setSuiTxInfo: (info) =>
    set({
      suiTxInfo: info,
      currentStep: "sui-explorer",
    }),

  addDebugLog: (type, message) =>
    set((state) => ({
      debugLogs: [
        ...state.debugLogs,
        { type, message, timestamp: Date.now() },
      ],
    })),

  clearDebugLogs: () => set({ debugLogs: [] }),

  setPastedReceipt: (receipt) => set({ pastedReceipt: receipt }),

  setLoading: (loading) => set({ isLoading: loading }),

  resetFlow: () =>
    set({
      currentStep: "request-builder",
      requestConfig: initialRequestConfig,
      challenge: null,
      rawChallengeResponse: null,
      receipt: null,
      rawReceipt: null,
      verificationResult: null,
      suiTxInfo: null,
      debugLogs: [],
      pastedReceipt: null,
      isLoading: false,
    }),
}));
