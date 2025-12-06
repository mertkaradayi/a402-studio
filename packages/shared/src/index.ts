// a402 Protocol Types

/**
 * Payment challenge returned by a server with HTTP 402
 */
export interface A402Challenge {
  /** Amount to pay (e.g., "0.50") */
  amount: string;
  /** Asset type (e.g., "USDC") */
  asset: string;
  /** Chain identifier (e.g., "sui-testnet", "sui-mainnet") */
  chain: string;
  /** Merchant vault address to receive payment */
  recipient: string;
  /** Unique identifier for replay protection */
  nonce: string;
  /** Unix timestamp when challenge expires (optional) */
  expiry?: number;
  /** URL to call after payment (optional) */
  callback?: string;
}

/**
 * Payment receipt issued after successful payment
 */
export interface A402Receipt {
  /** Unique receipt identifier */
  id: string;
  /** Nonce from the original challenge */
  requestNonce: string;
  /** Payer wallet address */
  payer: string;
  /** Merchant vault address */
  merchant: string;
  /** Payment amount */
  amount: string;
  /** Asset type */
  asset: string;
  /** Chain where payment was made */
  chain: string;
  /** On-chain transaction hash */
  txHash: string;
  /** Facilitator signature for verification */
  signature: string;
  /** Unix timestamp when receipt was issued */
  issuedAt: number;
}

/**
 * Result of receipt verification
 */
export interface VerificationResult {
  /** Whether the receipt is valid */
  valid: boolean;
  /** List of validation errors if invalid */
  errors: string[];
  /** Individual check results */
  checks: {
    amountMatch: boolean;
    chainMatch: boolean;
    nonceValid: boolean;
    signatureValid: boolean;
  };
}

/**
 * Request configuration for the playground
 */
export interface RequestConfig {
  /** Target URL for the protected resource */
  targetUrl: string;
  /** Payment amount */
  amount: string;
  /** Chain to use */
  chain: string;
  /** Optional description */
  description: string;
}

/**
 * Sui transaction info for the explorer view
 */
export interface SuiTransactionInfo {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  status: "pending" | "success" | "failed";
  gasUsed?: string;
}

/**
 * Debug log entry
 */
export interface DebugLogEntry {
  type: "info" | "warning" | "error";
  message: string;
  timestamp: number;
}

// a402 HTTP Headers
export const A402_HEADERS = {
  PAYMENT_REQUEST: "X-A402-Payment-Request",
  RECEIPT: "X-A402-Receipt",
  VERSION: "X-A402-Version",
  ERROR: "X-A402-Error",
  ERROR_DETAILS: "X-A402-Details",
} as const;

// a402 Error Codes
export const A402_ERROR_CODES = {
  PAYMENT_REQUIRED: 402,
  NONCE_COLLISION: 409,
  EXPIRED_PAYMENT: 410,
  INVALID_RECEIPT: 422,
  CHAIN_FINALITY_ERROR: 424,
  RATE_LIMIT: 429,
  INTERNAL_ERROR: 500,
} as const;

export type A402ErrorCode =
  (typeof A402_ERROR_CODES)[keyof typeof A402_ERROR_CODES];
