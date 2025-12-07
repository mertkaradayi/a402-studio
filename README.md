# a402 Studio

A developer tool for understanding and testing the **a402 protocol** — the HTTP 402 Payment Required standard for machine-to-machine payments. Built for the Sui blockchain with USDC payments.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Sui](https://img.shields.io/badge/Sui-Blockchain-4DA2FF)](https://sui.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## What is a402?

When a client requests a protected resource, the server responds with HTTP 402 containing a payment challenge. The client pays (via USDC on Sui), gets a cryptographic receipt, and retries the request with the receipt attached. The server verifies the receipt and returns the content.

```
Client                          Server
  │                               │
  │──── GET /premium-data ───────▶│
  │                               │
  │◀─── 402 + Payment Challenge ──│
  │                               │
  │──── [pays USDC via wallet] ──▶│  (Sui blockchain)
  │                               │
  │◀─── Receipt with signature ───│
  │                               │
  │──── GET + X-RECEIPT header ──▶│
  │                               │
  │◀─── 200 + Protected Data ─────│
```

## What This Tool Does

**a402 Studio** is a playground for developers to:

1. **Learn** the a402 flow with interactive preset scenarios
2. **Make real payments** using your Sui wallet (USDC)
3. **Test your API** that returns 402 challenges
4. **Inspect** any challenge/receipt JSON and validate it against the spec
5. **Export code** in cURL, TypeScript, or Python

## Features

### Demo Mode

Two sub-modes:

- **Learning Mode** — Load preset scenarios (valid payment, expired nonce, wrong amount, etc.) and simulate the full flow with mock data
- **Beep Live Mode** — Make real USDC payments on Sui using your connected wallet

### Test Endpoint Mode

Enter any URL that returns a 402 challenge. The tool will:
- Make the request through a backend proxy (bypasses CORS)
- Parse and validate the 402 response
- Let you complete the payment flow

### Inspector Mode

Paste any challenge or receipt JSON to:
- Validate against the a402 schema
- See field-by-field breakdowns
- Cross-verify challenge against receipt

### Wallet Integration

Connect any Sui wallet (Sui Wallet, Suiet, etc.):
- Sign transactions directly from the browser
- Make real USDC payments on testnet or mainnet
- View transaction confirmations on SuiScan

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS with custom neon theme |
| State | Zustand |
| Wallet | @mysten/dapp-kit |
| Blockchain | @mysten/sui |
| Backend | Express.js |
| Monorepo | Turborepo + Yarn workspaces |

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.x
- A Sui wallet browser extension

### Install

```bash
git clone https://github.com/mertkaradayi/a402-studio.git
cd a402-studio
yarn install
```

### Configure

```bash
cp apps/web/.env.example apps/web/.env.local
```

Set your network:
```
NEXT_PUBLIC_SUI_NETWORK=testnet  # or mainnet
```

### Run

```bash
yarn dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Project Structure

```
apps/
├── web/                      # Next.js frontend
│   └── src/
│       ├── components/
│       │   ├── beep/         # Wallet payment component
│       │   ├── modes/        # Demo, Test, Inspector UIs
│       │   ├── panels/       # Tabs and sidebars
│       │   └── wallet-button.tsx
│       ├── lib/
│       │   ├── validators.ts     # Schema validation
│       │   ├── sui-client.ts     # Sui RPC utils
│       │   └── signature-verification.ts
│       └── stores/
│           └── flow-store.ts     # Zustand state
└── api/                      # Express backend
    └── src/
        └── routes/
            ├── a402.ts       # Challenge/verify endpoints
            └── proxy.ts      # CORS bypass proxy

packages/
└── shared/                   # Shared TypeScript types
```

## Backend API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/proxy` | POST | Proxy external requests (CORS bypass) |
| `/a402/challenge` | POST | Generate a 402 challenge |
| `/a402/verify` | POST | Verify a receipt |
| `/a402/verify-onchain` | POST | Verify against challenge + tx format |
| `/a402/simulate-payment` | POST | Mock payment for testing |

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start frontend + backend |
| `yarn dev:web` | Frontend only |
| `yarn dev:api` | Backend only |
| `yarn build` | Production build |
| `yarn lint` | Lint all packages |

## How It Works

### Payment Flow (BeepCheckout Component)

When you click "Pay" in Beep Live mode:

1. Component fetches your USDC coin objects from Sui RPC
2. Builds a transaction that splits and transfers USDC to recipient
3. Wallet extension prompts for signature
4. Transaction is executed on-chain
5. Component waits for confirmation
6. Receipt is generated with transaction digest

### Validation

Challenges are validated for:
- Required fields: `amount`, `asset`, `chain`, `recipient`, `nonce`
- Recommended: `expiry` (warns if expired)
- Format: hex addresses, valid numbers

Receipts are validated for:
- Required: `id`, `payer`, `merchant`, `amount`, `txHash`, `signature`
- Cross-check: matches challenge values

## Limitations

- Real signature verification requires the facilitator's public key (not publicly available)
- Nonce tracking is in-memory only (resets on server restart)
- Beep Live mode sends USDC to your own wallet address as a demo

## License

© 2025 Mert Karadayi. All rights reserved.

See [LICENSE](./LICENSE) for details.
