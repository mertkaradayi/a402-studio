import type { A402Challenge, A402Receipt, SchemaValidationResult, VerificationResult } from "@/stores/flow-store";

/**
 * Validate a402 challenge against the spec
 */
export function validateChallengeSchema(challenge: unknown): SchemaValidationResult {
  const errors: SchemaValidationResult["errors"] = [];

  if (!challenge || typeof challenge !== "object") {
    return {
      valid: false,
      errors: [{ field: "root", message: "Challenge must be a valid object", severity: "error" }],
      score: 0,
    };
  }

  const c = challenge as Record<string, unknown>;

  // Required fields
  if (!c.amount || typeof c.amount !== "string") {
    errors.push({ field: "amount", message: "Missing or invalid 'amount' field (required string)", severity: "error" });
  } else if (isNaN(parseFloat(c.amount as string))) {
    errors.push({ field: "amount", message: "Amount must be a valid number string", severity: "error" });
  }

  if (!c.asset || typeof c.asset !== "string") {
    errors.push({ field: "asset", message: "Missing or invalid 'asset' field (required string)", severity: "error" });
  } else if (!["USDC", "USDT", "SUI"].includes(c.asset as string)) {
    errors.push({ field: "asset", message: `Unknown asset '${c.asset}'. Expected: USDC, USDT, or SUI`, severity: "warning" });
  }

  if (!c.chain || typeof c.chain !== "string") {
    errors.push({ field: "chain", message: "Missing or invalid 'chain' field (required string)", severity: "error" });
  } else if (!["sui-testnet", "sui-mainnet"].includes(c.chain as string)) {
    errors.push({ field: "chain", message: `Unknown chain '${c.chain}'. Expected: sui-testnet or sui-mainnet`, severity: "warning" });
  }

  if (!c.recipient || typeof c.recipient !== "string") {
    errors.push({ field: "recipient", message: "Missing or invalid 'recipient' field (required string)", severity: "error" });
  } else if (!(c.recipient as string).startsWith("0x")) {
    errors.push({ field: "recipient", message: "Recipient should be a valid Sui address starting with '0x'", severity: "warning" });
  }

  if (!c.nonce || typeof c.nonce !== "string") {
    errors.push({ field: "nonce", message: "Missing or invalid 'nonce' field (required string)", severity: "error" });
  } else if ((c.nonce as string).length < 8) {
    errors.push({ field: "nonce", message: "Nonce should be at least 8 characters for security", severity: "warning" });
  }

  // Optional but recommended fields
  if (c.expiry === undefined) {
    errors.push({ field: "expiry", message: "Missing 'expiry' field (recommended for security)", severity: "warning" });
  } else if (typeof c.expiry !== "number") {
    errors.push({ field: "expiry", message: "Expiry must be a Unix timestamp (number)", severity: "error" });
  } else if ((c.expiry as number) < Date.now() / 1000) {
    errors.push({ field: "expiry", message: "Challenge has already expired", severity: "error" });
  }

  if (c.callback !== undefined && typeof c.callback !== "string") {
    errors.push({ field: "callback", message: "Callback must be a valid URL string", severity: "error" });
  }

  // Calculate score
  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;
  const score = Math.max(0, 100 - errorCount * 20 - warningCount * 5);

  return {
    valid: errorCount === 0,
    errors,
    score,
  };
}

/**
 * Validate a402 receipt against the spec
 */
export function validateReceiptSchema(receipt: unknown): SchemaValidationResult {
  const errors: SchemaValidationResult["errors"] = [];

  if (!receipt || typeof receipt !== "object") {
    return {
      valid: false,
      errors: [{ field: "root", message: "Receipt must be a valid object", severity: "error" }],
      score: 0,
    };
  }

  const r = receipt as Record<string, unknown>;

  // Required fields
  if (!r.id && !r.receipt_id) {
    errors.push({ field: "id", message: "Missing 'id' or 'receipt_id' field (required)", severity: "error" });
  }

  if (!r.payer || typeof r.payer !== "string") {
    errors.push({ field: "payer", message: "Missing or invalid 'payer' field (required string)", severity: "error" });
  } else if (!(r.payer as string).startsWith("0x")) {
    errors.push({ field: "payer", message: "Payer should be a valid Sui address starting with '0x'", severity: "warning" });
  }

  if (!r.merchant && !r.recipient) {
    errors.push({ field: "merchant", message: "Missing 'merchant' or 'recipient' field (required)", severity: "error" });
  }

  if (!r.amount || typeof r.amount !== "string") {
    errors.push({ field: "amount", message: "Missing or invalid 'amount' field (required string)", severity: "error" });
  }

  if (!r.txHash && !r.tx_hash) {
    errors.push({ field: "txHash", message: "Missing 'txHash' or 'tx_hash' field (required)", severity: "error" });
  } else {
    const hash = (r.txHash || r.tx_hash) as string;
    if (!hash.startsWith("0x") || hash.length < 64) {
      errors.push({ field: "txHash", message: "Transaction hash should be a 64+ char hex string starting with '0x'", severity: "warning" });
    }
  }

  if (!r.signature) {
    errors.push({ field: "signature", message: "Missing 'signature' field (required for verification)", severity: "error" });
  } else if (typeof r.signature === "string" && !r.signature.startsWith("0x") && !r.signature.startsWith("sig_")) {
    errors.push({ field: "signature", message: "Signature format looks invalid", severity: "warning" });
  }

  if (!r.requestNonce && !r.request_nonce) {
    errors.push({ field: "requestNonce", message: "Missing 'requestNonce' field (required for replay protection)", severity: "warning" });
  }

  if (!r.chain) {
    errors.push({ field: "chain", message: "Missing 'chain' field (recommended)", severity: "warning" });
  }

  if (!r.issuedAt && !r.issued_at) {
    errors.push({ field: "issuedAt", message: "Missing 'issuedAt' timestamp (recommended)", severity: "warning" });
  }

  // Calculate score
  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;
  const score = Math.max(0, 100 - errorCount * 20 - warningCount * 5);

  return {
    valid: errorCount === 0,
    errors,
    score,
  };
}

/**
 * Verify receipt against challenge
 */
export function verifyReceiptAgainstChallenge(
  receipt: A402Receipt,
  challenge: A402Challenge
): VerificationResult {
  const errors: string[] = [];

  const amountMatch = receipt.amount === challenge.amount;
  if (!amountMatch) {
    errors.push(`Amount mismatch: expected ${challenge.amount} ${challenge.asset}, got ${receipt.amount} ${receipt.asset}`);
  }

  const chainMatch = receipt.chain === challenge.chain;
  if (!chainMatch) {
    errors.push(`Chain mismatch: expected ${challenge.chain}, got ${receipt.chain}`);
  }

  const nonceValid = receipt.requestNonce === challenge.nonce;
  if (!nonceValid) {
    errors.push(`Nonce mismatch: expected ${challenge.nonce}, got ${receipt.requestNonce}`);
  }

  const recipientMatch = receipt.merchant === challenge.recipient;
  if (!recipientMatch) {
    errors.push(`Recipient mismatch: expected ${challenge.recipient}, got ${receipt.merchant}`);
  }

  // Check expiry
  const notExpired = !challenge.expiry || challenge.expiry > Date.now() / 1000;
  if (!notExpired) {
    const expiredAgo = Math.floor(Date.now() / 1000 - (challenge.expiry || 0));
    errors.push(`Challenge expired ${expiredAgo} seconds ago`);
  }

  // Mock signature validation (in real impl, would verify against facilitator public key)
  const signatureValid = receipt.signature.startsWith("0x") || receipt.signature.startsWith("sig_");
  if (!signatureValid) {
    errors.push("Invalid signature format - signature appears malformed");
  }

  return {
    valid: amountMatch && chainMatch && nonceValid && signatureValid && notExpired && recipientMatch,
    errors,
    checks: {
      amountMatch,
      chainMatch,
      nonceValid,
      signatureValid,
      notExpired,
      recipientMatch,
    },
  };
}

/**
 * Generate cURL command from request
 */
export function generateCurl(url: string, method: string, headers?: Record<string, string>, body?: string): string {
  let curl = `curl -X ${method} '${url}'`;

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      curl += ` \\\n  -H '${key}: ${value}'`;
    });
  }

  if (body) {
    curl += ` \\\n  -d '${body}'`;
  }

  return curl;
}

/**
 * Generate TypeScript code from request
 */
export function generateTypeScript(url: string, method: string, headers?: Record<string, string>, body?: string): string {
  const headersStr = headers
    ? `\n    headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n    ')},`
    : '';
  const bodyStr = body
    ? `\n    body: JSON.stringify(${body}),`
    : '';

  return `const response = await fetch('${url}', {
    method: '${method}',${headersStr}${bodyStr}
});

if (response.status === 402) {
    const challenge = await response.json();
    console.log('Payment required:', challenge);
    // Handle a402 payment flow
}

const data = await response.json();
console.log(data);`;
}

/**
 * Generate Python code from request
 */
export function generatePython(url: string, method: string, headers?: Record<string, string>, body?: string): string {
  const headersStr = headers
    ? `\nheaders = ${JSON.stringify(headers, null, 4)}\n`
    : '';
  const bodyStr = body
    ? `\ndata = ${body}\n`
    : '';

  return `import requests
${headersStr}${bodyStr}
response = requests.${method.toLowerCase()}(
    '${url}'${headers ? ',\n    headers=headers' : ''}${body ? ',\n    json=data' : ''}
)

if response.status_code == 402:
    challenge = response.json()
    print('Payment required:', challenge)
    # Handle a402 payment flow

print(response.json())`;
}
