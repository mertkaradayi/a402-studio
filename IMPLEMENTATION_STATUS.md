# a402 Playground & Inspector

> **For LLMs**: This document provides complete context about this project. Read this first before making any changes.

---

## What Is This Project?

### The Problem We're Solving

Developers building on the **a402 protocol** (HTTP 402 Payment Required) need a way to:
1. **Learn** how the a402 payment flow works
2. **Test** their API endpoints that return 402 challenges
3. **Debug** payment receipts and verify they match challenges
4. **Integrate** a402 into their applications with code examples

Currently, there's no visual tool for this. Developers have to manually craft HTTP requests, parse JSON responses, and verify receipts by hand.

### What Is a402?

**a402** is a protocol that uses HTTP status code 402 (Payment Required) to enable machine-to-machine payments. Here's how it works:

```
1. Client requests a protected resource
   GET /api/premium-data

2. Server returns 402 with a "challenge"
   HTTP/1.1 402 Payment Required
   {
     "amount": "0.50",
     "asset": "USDC",
     "chain": "sui-testnet",
     "recipient": "0x1234...",
     "nonce": "unique_nonce_123",
     "expiry": 1699999999
   }

3. Client pays via Beep (on Sui blockchain) and gets a "receipt"
   {
     "id": "rcpt_abc123",
     "payer": "0xuser...",
     "merchant": "0x1234...",
     "amount": "0.50",
     "txHash": "0xtx...",
     "signature": "0xsig...",
     "requestNonce": "unique_nonce_123"
   }

4. Client retries with receipt in header
   GET /api/premium-data
   X-RECEIPT: <base64-encoded-receipt>

5. Server verifies receipt and returns data
   HTTP/1.1 200 OK
   { "data": "premium content" }
```

### What Is Beep?

**Beep** is an agentic finance protocol on the **Sui blockchain**. It handles:
- USDC payments on Sui
- Receipt generation with cryptographic signatures
- Facilitator-based payment verification

### Our Solution

The **a402 Playground & Inspector** is a web-based developer tool with three modes:

1. **Demo Mode**: Learn the flow with preset scenarios (valid payment, expired nonce, wrong amount, etc.)
2. **Test Endpoint Mode**: Test your real API endpoints and validate 402 responses
3. **Inspector Mode**: Paste any challenge/receipt JSON to decode and verify

---

## Project Goal & Vision

### Immediate Goal (Hackathon MVP)
Build a fully functional UI that demonstrates the a402 flow with mock data, allowing developers to:
- Understand how challenges and receipts work
- Validate their JSON structures against the a402 spec
- Export code snippets to integrate a402 into their apps

### Future Goal (Post-Hackathon)
Connect to real infrastructure:
- Real Beep SDK for actual USDC payments on Sui testnet
- Real Sui RPC for on-chain transaction verification
- Wallet connection for signing transactions
- Database for persistent nonce tracking

---

## Current Status: What's Done

### Frontend (100% UI Complete)

The entire UI is built and functional with mock data:

| Component | Status | File |
|-----------|--------|------|
| Mode selector (Demo/Test/Inspector) | ✅ Complete | `flow-playground.tsx` |
| Demo mode with 5 presets | ✅ Complete | `modes/demo-mode.tsx` |
| Test Endpoint mode | ✅ Complete | `modes/test-endpoint-mode.tsx` |
| Inspector mode | ✅ Complete | `modes/inspector-mode.tsx` |
| Challenge tab viewer | ✅ Complete | `panels/tabs/challenge-tab.tsx` |
| Receipt tab viewer | ✅ Complete | `panels/tabs/receipt-tab.tsx` |
| Verify tab | ✅ Complete | `panels/tabs/verify-tab.tsx` |
| Sui transaction tab | ✅ Complete | `panels/tabs/sui-tab.tsx` |
| Code export (cURL/TS/Python) | ✅ Complete | `panels/code-export-panel.tsx` |
| Request history | ✅ Complete | `panels/history-panel.tsx` |
| Schema validation display | ✅ Complete | `shared/schema-validation-display.tsx` |
| Verification result display | ✅ Complete | `shared/verification-display.tsx` |

### Validators (100% Complete)

Both validators are fully implemented in `lib/validators.ts`:

**Challenge Validator** checks:
- `amount`: Required string, must be valid number
- `asset`: Required string, warns if not USDC/USDT/SUI
- `chain`: Required string, warns if not sui-testnet/sui-mainnet
- `recipient`: Required string, warns if not 0x format
- `nonce`: Required string, warns if < 8 chars
- `expiry`: Recommended, errors if already expired

**Receipt Validator** checks:
- `id` or `receipt_id`: Required
- `payer`: Required, warns if not 0x format
- `merchant` or `recipient`: Required
- `amount`: Required string
- `txHash` or `tx_hash`: Required, warns if not valid hex
- `signature`: Required, warns if invalid format
- `requestNonce`: Recommended for replay protection
- `chain`: Recommended
- `issuedAt`: Recommended

### State Management (100% Complete)

Zustand store in `stores/flow-store.ts` manages:
- Current app mode
- Selected preset scenario
- Challenge and receipt data
- Validation results
- Request history (last 50 entries)
- Debug logs
- Loading states

### Preset Scenarios (100% Complete)

Five preset scenarios in `flow-store.ts`:
1. **Valid Payment**: All fields correct, passes all checks
2. **Expired Nonce**: Challenge expiry is in the past
3. **Wrong Amount**: Receipt amount doesn't match challenge
4. **Invalid Signature**: Malformed signature format
5. **Chain Mismatch**: Receipt chain differs from challenge chain

### Backend (Scaffolded with Mocks)

Express API in `apps/api/src/index.ts`:
- `GET /health`: Health check
- `POST /a402/challenge`: Returns mock 402 challenge
- `POST /a402/verify`: Mock verification (no real crypto)
- `GET /a402/receipt/:id`: Mock receipt lookup
- `POST /a402/simulate-payment`: Mock payment simulation

---

## Current Status: What's NOT Done

### Critical Missing Pieces

These are required for the app to work with real payments:

#### 1. Real HTTP Requests (Test Endpoint Mode)
**Current**: Simulates responses, doesn't make real HTTP calls
**Problem**: CORS blocks browser requests to external APIs
**Solution needed**: Backend proxy endpoint

```typescript
// NEEDS TO BE IMPLEMENTED in apps/api/src/index.ts
app.post('/proxy', async (req, res) => {
  const { url, method, headers, body } = req.body;
  // Make real HTTP request from server (no CORS)
  // Return response to frontend
});
```

#### 2. Wallet Connection
**Current**: No wallet integration
**Needed**: `@mysten/dapp-kit` for Sui wallet connection
**Purpose**: Sign transactions for real payments

```typescript
// NEEDS TO BE IMPLEMENTED
import { ConnectButton, useWallet } from '@mysten/dapp-kit';

// User connects wallet
// App can sign and submit transactions
```

#### 3. Beep SDK Integration
**Current**: Mock payment simulation
**Needed**: `@beep-it/sdk-core` or Beep MCP
**Purpose**: Create real USDC payments on Sui

```typescript
// NEEDS TO BE IMPLEMENTED
import { BeepClient } from '@beep-it/sdk-core';

const beep = new BeepClient({ network: 'testnet' });
const receipt = await beep.pay({
  amount: challenge.amount,
  recipient: challenge.recipient,
  nonce: challenge.nonce
});
```

#### 4. Sui RPC Integration
**Current**: Mock transaction data
**Needed**: `@mysten/sui` SDK
**Purpose**: Verify transactions exist on-chain

```typescript
// NEEDS TO BE IMPLEMENTED
import { SuiClient } from '@mysten/sui/client';

const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });
const tx = await client.getTransactionBlock({ digest: receipt.txHash });
// Verify tx exists and matches receipt
```

#### 5. Real Signature Verification
**Current**: Just checks if signature starts with "0x"
**Needed**: Verify against Beep facilitator public key
**Purpose**: Ensure receipt wasn't forged

```typescript
// NEEDS TO BE IMPLEMENTED
import { verifySignature } from '@beep-it/sdk-core';

const isValid = verifySignature(receipt, facilitatorPublicKey);
```

---

## Architecture

### File Structure

```
sui-hack-2/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx        # Root layout with fonts
│   │   │   │   ├── page.tsx          # Home page (renders FlowPlayground)
│   │   │   │   └── globals.css       # Tailwind + custom neon colors
│   │   │   ├── components/
│   │   │   │   ├── flow-playground.tsx    # MAIN COMPONENT - mode selector, layout
│   │   │   │   ├── modes/
│   │   │   │   │   ├── demo-mode.tsx          # Left: presets, Center: tabs, Right: code
│   │   │   │   │   ├── test-endpoint-mode.tsx # Left: request builder, Center: response
│   │   │   │   │   └── inspector-mode.tsx     # Left: paste JSON, Right: results
│   │   │   │   ├── panels/
│   │   │   │   │   ├── center-panel.tsx       # Tabbed viewer container
│   │   │   │   │   ├── code-export-panel.tsx  # cURL/TS/Python export
│   │   │   │   │   ├── history-panel.tsx      # Request history sidebar
│   │   │   │   │   └── tabs/
│   │   │   │   │       ├── challenge-tab.tsx  # Shows raw + parsed challenge
│   │   │   │   │       ├── receipt-tab.tsx    # Shows raw + parsed receipt
│   │   │   │   │       ├── verify-tab.tsx     # Verification checks
│   │   │   │   │       └── sui-tab.tsx        # Transaction details
│   │   │   │   └── shared/
│   │   │   │       ├── schema-validation-display.tsx  # Reusable validation UI
│   │   │   │       └── verification-display.tsx       # Reusable verification UI
│   │   │   ├── lib/
│   │   │   │   ├── utils.ts           # cn() helper for classnames
│   │   │   │   └── validators.ts      # Schema validators + code generators
│   │   │   └── stores/
│   │   │       └── flow-store.ts      # Zustand store + preset data
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   └── api/                          # Express backend
│       ├── src/
│       │   └── index.ts              # All endpoints
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/                       # Shared TypeScript types
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── package.json                      # Root workspace config
├── turbo.json                        # Turborepo config
└── IMPLEMENTATION_STATUS.md          # This file
```

### Data Flow

```
User Action                    Zustand Store                 Component Update
───────────────────────────────────────────────────────────────────────────────
Select preset          →      setSelectedPreset()      →    DemoMode re-renders
Load Challenge         →      setChallenge()           →    ChallengeTab shows data
Simulate Payment       →      setReceipt()             →    ReceiptTab shows data
Verify Receipt         →      setVerificationResult()  →    VerifyTab shows checks
Test Endpoint          →      addHistoryEntry()        →    HistoryPanel updates
```

### Key Types

```typescript
// Challenge from server (402 response body)
interface A402Challenge {
  amount: string;      // "0.50"
  asset: string;       // "USDC"
  chain: string;       // "sui-testnet"
  recipient: string;   // "0x1234..."
  nonce: string;       // "unique_nonce_123"
  expiry?: number;     // Unix timestamp
  callback?: string;   // Optional callback URL
}

// Receipt from Beep after payment
interface A402Receipt {
  id: string;           // "rcpt_abc123"
  requestNonce: string; // Must match challenge.nonce
  payer: string;        // "0xuser..."
  merchant: string;     // Must match challenge.recipient
  amount: string;       // Must match challenge.amount
  asset: string;        // "USDC"
  chain: string;        // Must match challenge.chain
  txHash: string;       // Sui transaction hash
  signature: string;    // Cryptographic proof
  issuedAt: number;     // Unix timestamp
}

// Validation result for schema checks
interface SchemaValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: "error" | "warning";
  }>;
  score: number;  // 0-100 compliance percentage
}

// Verification result for receipt-vs-challenge checks
interface VerificationResult {
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
```

---

## How To Run

```bash
# 1. Install dependencies
yarn install

# 2. Run both frontend and backend
yarn dev

# Or run individually:
yarn dev:web   # Frontend at http://localhost:3000
yarn dev:api   # Backend at http://localhost:3001
```

---

## Step-by-Step Implementation Guide

### Phase 1: Backend Proxy (Priority: HIGH)

**Goal**: Enable Test Endpoint mode to make real HTTP requests

**Files to modify**: `apps/api/src/index.ts`

**Steps**:
1. Add a new endpoint `POST /proxy`
2. Accept `{ url, method, headers, body }` in request body
3. Use `fetch` or `axios` to make the actual HTTP request
4. Return the response (status, headers, body) to frontend
5. Handle errors gracefully

**Code template**:
```typescript
app.post('/proxy', async (req, res) => {
  try {
    const { url, method, headers, body } = req.body;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseBody = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    res.json({
      status: response.status,
      headers: responseHeaders,
      body: responseBody,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Frontend change**: Update `test-endpoint-mode.tsx` to call `/proxy` instead of simulating

---

### Phase 2: Sui RPC Integration (Priority: HIGH)

**Goal**: Verify transactions exist on Sui blockchain

**Files to modify**:
- `apps/web/package.json` (add dependency)
- `apps/web/src/lib/sui-client.ts` (new file)
- `apps/web/src/components/panels/tabs/sui-tab.tsx`

**Steps**:
1. Install `@mysten/sui`: `yarn workspace web add @mysten/sui`
2. Create Sui client wrapper
3. Add function to fetch transaction by hash
4. Update SuiTab to show real transaction data
5. Add transaction verification to VerifyTab

**Code template**:
```typescript
// lib/sui-client.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const client = new SuiClient({ url: getFullnodeUrl('testnet') });

export async function getTransaction(txHash: string) {
  try {
    const tx = await client.getTransactionBlock({
      digest: txHash,
      options: {
        showEffects: true,
        showInput: true,
        showEvents: true,
      },
    });
    return tx;
  } catch (error) {
    return null;
  }
}

export async function verifyTransaction(txHash: string, expectedAmount: string, expectedRecipient: string) {
  const tx = await getTransaction(txHash);
  if (!tx) return { valid: false, error: 'Transaction not found' };

  // Parse transaction effects to verify payment
  // Return verification result
}
```

---

### Phase 3: Wallet Connection (Priority: MEDIUM)

**Goal**: Allow users to connect Sui wallet for real payments

**Files to modify**:
- `apps/web/package.json`
- `apps/web/src/app/layout.tsx` (add provider)
- `apps/web/src/components/wallet-button.tsx` (new file)
- `apps/web/src/components/flow-playground.tsx`

**Steps**:
1. Install dapp-kit: `yarn workspace web add @mysten/dapp-kit @tanstack/react-query`
2. Wrap app in providers (QueryClient, SuiClientProvider, WalletProvider)
3. Create WalletButton component
4. Add wallet button to header
5. Use wallet context in payment simulation

**Code template**:
```typescript
// app/layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';

const queryClient = new QueryClient();
const networks = { testnet: { url: getFullnodeUrl('testnet') } };

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
```

---

### Phase 4: Beep SDK Integration (Priority: MEDIUM)

**Goal**: Enable real USDC payments via Beep

**Note**: This depends on Beep SDK availability. May need to use Beep MCP instead.

**Steps**:
1. Research Beep SDK or MCP documentation
2. Install necessary packages
3. Create Beep client wrapper
4. Replace mock payment simulation with real Beep calls
5. Handle payment receipt from Beep

---

### Phase 5: Real Signature Verification (Priority: LOW)

**Goal**: Cryptographically verify receipt signatures

**Steps**:
1. Get Beep facilitator public key
2. Implement signature verification using Sui crypto libraries
3. Update `verifyReceiptAgainstChallenge` in `validators.ts`
4. Show signature verification status in UI

---

### Phase 6: Database Integration (Priority: LOW)

**Goal**: Persist nonces and history

**Options**:
- SQLite for simple local storage
- Supabase for hosted PostgreSQL
- Redis for fast key-value (nonce checking)

**Steps**:
1. Choose database solution
2. Create schema for nonces and history
3. Update backend to store/check nonces
4. Add history persistence

---

## Tech Stack Reference

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| Zustand | 5.x | State management |
| Express | 4.x | Backend API |
| Turborepo | 2.x | Monorepo build system |
| Yarn | 1.x | Package manager (workspaces) |

### Color Scheme

```css
--neon-pink: #FF00ED    /* Primary accent */
--neon-green: #73FF6D   /* Success states */
--neon-yellow: #FEE102  /* Warnings, highlights */
--neon-cyan: #04D9FF    /* Info, links */
--background: #121212   /* Dark background */
--card: #1A1A1A         /* Card backgrounds */
--border: #36363B       /* Borders */
```

---

## Common Tasks

### Adding a New Preset Scenario

1. Open `apps/web/src/stores/flow-store.ts`
2. Add to `PRESET_SCENARIOS` object:
```typescript
"new-scenario": {
  name: "New Scenario",
  description: "Description of what this tests",
  challenge: { /* challenge data */ },
  receipt: { /* receipt data */ },
  expectedResult: "valid" | "invalid",
}
```

### Adding a New Validation Check

1. Open `apps/web/src/lib/validators.ts`
2. Add check to `validateChallengeSchema` or `validateReceiptSchema`:
```typescript
if (!c.newField) {
  errors.push({
    field: "newField",
    message: "Missing 'newField' (required)",
    severity: "error"
  });
}
```

### Adding a New Export Format

1. Open `apps/web/src/lib/validators.ts`
2. Add new generator function:
```typescript
export function generateRust(url: string, method: string, ...): string {
  return `// Rust code here`;
}
```
3. Update `code-export-panel.tsx` to include new format in tabs

---

## Troubleshooting

### "Module not found" errors
Run `yarn install` from the root directory.

### CORS errors in Test Endpoint mode
This is expected. The proxy endpoint needs to be implemented (see Phase 1).

### Types not syncing
Run `yarn build` to rebuild shared types package.

### Tailwind classes not applying
Check that the class exists in `tailwind.config.ts` and the file is in `content` paths.

---

## Contact & Resources

- **a402 Protocol**: https://github.com/anthropics/a402
- **Beep Protocol**: https://docs.beep.it
- **Sui Documentation**: https://docs.sui.io
- **Project Repository**: [this repo]
