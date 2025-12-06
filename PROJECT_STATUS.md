# a402 Playground & Inspector — Project Status

> **Last Updated**: December 6, 2025

A comprehensive overview of what's completed, what's pending, and step-by-step guides for implementing remaining features.

---

## Table of Contents

1. [Completed Features](#1-completed-features)
2. [Uncompleted Features](#2-uncompleted-features)
3. [Step-by-Step Implementation Guide](#3-step-by-step-implementation-guide)
   - [Step 1: Backend Proxy](#step-1-backend-proxy-for-cors-bypass)
   - [Step 2: Sui RPC Integration](#step-2-sui-rpc-integration)
   - [Step 3: Wallet Connection](#step-3-sui-wallet-connection)
   - [Step 4: Beep SDK Integration](#step-4-beep-sdk-integration)
   - [Step 5: Signature Verification](#step-5-real-signature-verification)
   - [Step 6: Database Integration](#step-6-database-integration)

---

## 1. Completed Features

### Frontend UI (100% Complete)

1. **Main Layout & Mode Selector** — `flow-playground.tsx`
   - Three-mode tab system (Demo / Test Endpoint / Inspector)
   - Responsive layout with proper styling

2. **Demo Mode** — `modes/demo-mode.tsx`
   - 5 preset scenarios: Valid Payment, Expired Nonce, Wrong Amount, Invalid Signature, Chain Mismatch
   - Interactive flow demonstration

3. **Test Endpoint Mode** — `modes/test-endpoint-mode.tsx`
   - Request builder UI for testing real 402 endpoints
   - URL, method, headers, and body configuration

4. **Inspector Mode** — `modes/inspector-mode.tsx`
   - JSON paste functionality for challenges and receipts
   - Real-time schema validation

5. **Challenge Tab** — `panels/tabs/challenge-tab.tsx`
   - Raw and parsed challenge display
   - Field-by-field breakdown

6. **Receipt Tab** — `panels/tabs/receipt-tab.tsx`
   - Raw and parsed receipt display
   - All receipt fields visualized

7. **Verify Tab** — `panels/tabs/verify-tab.tsx`
   - Cross-validation between challenge and receipt
   - Visual pass/fail indicators

8. **Sui Transaction Tab** — `panels/tabs/sui-tab.tsx`
   - Transaction details display (currently mock data)

9. **Code Export Panel** — `panels/code-export-panel.tsx`
   - Export in cURL, TypeScript, and Python
   - Copy-to-clipboard functionality

10. **Request History Panel** — `panels/history-panel.tsx`
    - Last 50 requests tracked
    - Quick replay functionality

11. **Schema Validation Display** — `shared/schema-validation-display.tsx`
    - Reusable validation result component
    - Error/warning severity indicators

12. **Verification Display** — `shared/verification-display.tsx`
    - Reusable verification result component

---

### Validators (100% Complete)

13. **Challenge Validator** — `lib/validators.ts`
    - `amount`: Required, must be valid number
    - `asset`: Required, warns if not USDC/USDT/SUI
    - `chain`: Required, warns if not sui-testnet/sui-mainnet
    - `recipient`: Required, warns if not 0x format
    - `nonce`: Required, warns if < 8 chars
    - `expiry`: Recommended, errors if already expired

14. **Receipt Validator** — `lib/validators.ts`
    - `id` or `receipt_id`: Required
    - `payer`: Required, warns if not 0x format
    - `merchant` or `recipient`: Required
    - `amount`: Required string
    - `txHash` or `tx_hash`: Required, warns if invalid hex
    - `signature`: Required, warns if invalid format
    - `requestNonce`: Recommended
    - `chain`: Recommended
    - `issuedAt`: Recommended

---

### State Management (100% Complete)

15. **Zustand Store** — `stores/flow-store.ts`
    - Current mode management
    - Selected preset handling
    - Challenge/receipt data state
    - Validation results state
    - Request history (50 entries)
    - Debug logs
    - Loading states

---

### Backend API (Scaffolded — Mock Only)

16. **Health Endpoint** — `GET /health`

17. **Challenge Generation** — `POST /a402/challenge`
    - Returns mock 402 challenge
    - Generates unique nonce
    - 5-minute expiry

18. **Receipt Verification** — `POST /a402/verify`
    - Basic field validation
    - In-memory nonce tracking (replay protection)
    - **NOT doing real crypto verification**

19. **Receipt Lookup** — `GET /a402/receipt/:id`
    - Mock receipt data

20. **Payment Simulation** — `POST /a402/simulate-payment`
    - Simulates 1.5s payment delay
    - Returns mock receipt

---

## 2. Uncompleted Features

### Critical Missing (Required for Real Payments)

| # | Feature | Current State | Priority |
|---|---------|---------------|----------|
| 1 | Backend Proxy for CORS | Not implemented | **HIGH** |
| 2 | Sui RPC Integration | Mock transaction data | **HIGH** |
| 3 | Sui Wallet Connection | No wallet integration | **MEDIUM** |
| 4 | Beep SDK Integration | Mock payment simulation | **MEDIUM** |
| 5 | Real Signature Verification | Just checks "0x" prefix | **LOW** |
| 6 | Database for Nonce/History | In-memory only | **LOW** |

### Feature Details

1. **Backend Proxy (CORS)**
   - Test Endpoint mode cannot make real HTTP calls
   - Browser blocks cross-origin requests
   - Need server-side proxy endpoint

2. **Sui RPC Integration**
   - Cannot verify transactions on-chain
   - Transaction tab shows mock data
   - Need `@mysten/sui` SDK

3. **Wallet Connection**
   - Cannot sign transactions
   - Cannot create real payments
   - Need `@mysten/dapp-kit`

4. **Beep SDK**
   - Cannot process real USDC payments
   - Cannot get real receipts
   - Need Beep SDK or MCP integration

5. **Signature Verification**
   - Receipts not cryptographically verified
   - Could accept forged receipts
   - Need facilitator public key

6. **Database**
   - Nonces lost on server restart
   - History not persisted
   - No audit trail

---

## 3. Step-by-Step Implementation Guide

---

### Step 1: Backend Proxy for CORS Bypass

**Goal**: Allow Test Endpoint mode to make real HTTP requests

**Estimated Time**: 30 minutes

#### 1.1 Update API dependencies

```bash
cd apps/api
yarn add axios
```

#### 1.2 Create proxy route

Create `apps/api/src/routes/proxy.ts`:

```typescript
import { Router, Request, Response } from "express";
import axios from "axios";

export const proxyRouter = Router();

proxyRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { url, method = "GET", headers = {}, body } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const response = await axios({
      url,
      method,
      headers,
      data: body,
      timeout: 10000,
      validateStatus: () => true, // Accept all status codes
    });

    res.json({
      status: response.status,
      headers: response.headers,
      body: response.data,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Proxy request failed",
    });
  }
});
```

#### 1.3 Register the route

In `apps/api/src/index.ts`:

```typescript
import { proxyRouter } from "./routes/proxy";

// Add with other routes
app.use("/proxy", proxyRouter);
```

#### 1.4 Update frontend to use proxy

In `apps/web/src/components/modes/test-endpoint-mode.tsx`:

```typescript
// Replace direct fetch with proxy call
const response = await fetch("http://localhost:3001/proxy", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: targetUrl,
    method: httpMethod,
    headers: customHeaders,
    body: requestBody,
  }),
});
```

---

### Step 2: Sui RPC Integration

**Goal**: Verify transactions exist on-chain

**Estimated Time**: 1-2 hours

#### 2.1 Install Sui SDK

```bash
cd apps/web
yarn add @mysten/sui
```

#### 2.2 Create Sui client utility

Create `apps/web/src/lib/sui-client.ts`:

```typescript
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Create client for testnet (change to mainnet for production)
export const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

export async function getTransaction(txDigest: string) {
  try {
    return await suiClient.getTransactionBlock({
      digest: txDigest,
      options: {
        showEffects: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
  } catch {
    return null;
  }
}

export async function verifyTransaction(
  txHash: string,
  expectedAmount: string,
  expectedRecipient: string
): Promise<{ valid: boolean; error?: string; details?: any }> {
  const tx = await getTransaction(txHash);
  
  if (!tx) {
    return { valid: false, error: "Transaction not found on-chain" };
  }

  // Check if transaction was successful
  if (tx.effects?.status?.status !== "success") {
    return { valid: false, error: "Transaction failed on-chain" };
  }

  return {
    valid: true,
    details: {
      digest: tx.digest,
      timestamp: tx.timestampMs,
      sender: tx.transaction?.data.sender,
      gasUsed: tx.effects?.gasUsed,
    },
  };
}
```

#### 2.3 Update Sui Tab component

Modify `apps/web/src/components/panels/tabs/sui-tab.tsx`:

```typescript
import { useState, useEffect } from "react";
import { getTransaction } from "@/lib/sui-client";

// Add state for real transaction data
const [txData, setTxData] = useState<any>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Add useEffect to fetch real data
useEffect(() => {
  if (receipt?.txHash && !receipt.txHash.includes("MOCK")) {
    setLoading(true);
    getTransaction(receipt.txHash)
      .then(setTxData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }
}, [receipt?.txHash]);
```

---

### Step 3: Sui Wallet Connection

**Goal**: Allow users to connect Sui wallets for real payments

**Estimated Time**: 2-3 hours

#### 3.1 Install dependencies

```bash
cd apps/web
yarn add @mysten/dapp-kit @tanstack/react-query
```

#### 3.2 Create providers wrapper

Create `apps/web/src/components/providers.tsx`:

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { ReactNode, useState } from "react";

const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
```

#### 3.3 Update root layout

In `apps/web/src/app/layout.tsx`:

```typescript
import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### 3.4 Create wallet button component

Create `apps/web/src/components/wallet-button.tsx`:

```typescript
"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";

export function WalletButton() {
  const account = useCurrentAccount();

  return (
    <div className="flex items-center gap-2">
      <ConnectButton />
      {account && (
        <span className="text-xs text-muted-foreground">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </span>
      )}
    </div>
  );
}
```

#### 3.5 Add wallet button to header

In `apps/web/src/components/flow-playground.tsx`:

```typescript
import { WalletButton } from "./wallet-button";

// Add to header section
<header className="flex justify-between items-center">
  <h1>a402 Playground</h1>
  <WalletButton />
</header>
```

---

### Step 4: Beep SDK Integration

**Goal**: Enable real USDC payments via Beep

**Estimated Time**: 3-4 hours

> **Note**: Beep SDK availability may vary. This guide covers MCP-based integration.

#### 4.1 Research Beep documentation

Review these files in your project:
- `just-beep-it-docs/documentation.justbeep.it_product-overview_beep-pay_developer-guide.md`
- `just-beep-it-docs/documentation.justbeep.it_product-overview_agent-to-agent-payments-a402*.md`

#### 4.2 Install Beep packages (when available)

```bash
# Check npm for latest package names
yarn add @beep-it/sdk-core  # or similar
```

#### 4.3 Create Beep client utility

Create `apps/web/src/lib/beep-client.ts`:

```typescript
// Structure will depend on actual Beep SDK API
import type { A402Challenge, A402Receipt } from "@shared/types";

export async function createBeepPayment(
  challenge: A402Challenge,
  payerAddress: string,
  signTransaction: (tx: any) => Promise<any>
): Promise<A402Receipt> {
  // 1. Create payment transaction
  // 2. Sign with connected wallet
  // 3. Submit to Beep facilitator
  // 4. Get receipt
  
  throw new Error("Implement with actual Beep SDK");
}

export async function verifyBeepReceipt(
  receipt: A402Receipt,
  facilitatorPublicKey: string
): Promise<boolean> {
  // Verify signature against facilitator key
  throw new Error("Implement with actual Beep SDK");
}
```

#### 4.4 Update payment simulation to use real Beep

In Demo mode, replace mock simulation with:

```typescript
import { createBeepPayment } from "@/lib/beep-client";
import { useCurrentAccount, useSignTransaction } from "@mysten/dapp-kit";

// In component
const account = useCurrentAccount();
const { mutateAsync: signTransaction } = useSignTransaction();

async function handlePayment() {
  if (!account) {
    alert("Please connect wallet first");
    return;
  }
  
  const receipt = await createBeepPayment(
    challenge,
    account.address,
    signTransaction
  );
  
  setReceipt(receipt);
}
```

---

### Step 5: Real Signature Verification

**Goal**: Cryptographically verify receipt signatures

**Estimated Time**: 1-2 hours

#### 5.1 Get facilitator public key

From Beep documentation or API, retrieve the facilitator public key for the appropriate network (testnet/mainnet).

#### 5.2 Update validators

In `apps/web/src/lib/validators.ts`:

```typescript
import { verifyPersonalMessage } from "@mysten/sui/utils";

const FACILITATOR_PUBKEY = "your_facilitator_public_key";

export function verifySignature(receipt: A402Receipt): boolean {
  if (!receipt.signature) return false;
  
  try {
    // Reconstruct the message that was signed
    const message = JSON.stringify({
      id: receipt.id,
      payer: receipt.payer,
      merchant: receipt.merchant,
      amount: receipt.amount,
      chain: receipt.chain,
      requestNonce: receipt.requestNonce,
    });
    
    // Verify against facilitator public key
    return verifyPersonalMessage(message, receipt.signature, FACILITATOR_PUBKEY);
  } catch {
    return false;
  }
}
```

#### 5.3 Update verification display

In `verifyReceiptAgainstChallenge` function:

```typescript
checks.signatureValid = verifySignature(receipt);
if (!checks.signatureValid) {
  errors.push("Signature verification failed");
}
```

---

### Step 6: Database Integration

**Goal**: Persist nonces and history

**Estimated Time**: 2-4 hours

#### Option A: SQLite (Simple, Local)

```bash
cd apps/api
yarn add better-sqlite3
yarn add -D @types/better-sqlite3
```

Create `apps/api/src/db/index.ts`:

```typescript
import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "../../data/a402.db"));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS nonces (
    nonce TEXT PRIMARY KEY,
    used_at INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

export function isNonceUsed(nonce: string): boolean {
  const row = db.prepare("SELECT 1 FROM nonces WHERE nonce = ?").get(nonce);
  return !!row;
}

export function markNonceUsed(nonce: string): void {
  db.prepare("INSERT INTO nonces (nonce, used_at) VALUES (?, ?)")
    .run(nonce, Date.now());
}

export function addHistoryEntry(type: string, data: any): void {
  db.prepare("INSERT INTO history (type, data, created_at) VALUES (?, ?, ?)")
    .run(type, JSON.stringify(data), Date.now());
}
```

#### Option B: Supabase (Hosted, Collaborative)

1. Create project at [supabase.com](https://supabase.com)
2. Create tables for nonces and history
3. Use Supabase JS client in API

---

## Quick Reference: File Locations

| What | Location |
|------|----------|
| Frontend entry | `apps/web/src/app/page.tsx` |
| Main component | `apps/web/src/components/flow-playground.tsx` |
| Validators | `apps/web/src/lib/validators.ts` |
| State store | `apps/web/src/stores/flow-store.ts` |
| API entry | `apps/api/src/index.ts` |
| API routes | `apps/api/src/routes/a402.ts` |
| Shared types | `packages/shared/src/index.ts` |
| Beep docs | `just-beep-it-docs/` |

---

## Recommended Implementation Order

1. **Backend Proxy** — Unblocks Test Endpoint mode
2. **Sui RPC** — Shows real transaction data
3. **Wallet Connection** — Foundation for real payments
4. **Beep SDK** — Real USDC payments
5. **Signature Verification** — Security hardening
6. **Database** — Production persistence

---

## Resources

- [Sui Documentation](https://docs.sui.io)
- [Beep Documentation](https://docs.beep.it)
- [a402 Protocol](https://github.com/anthropics/a402)
- [@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit)
