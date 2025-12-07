# a402 Studio (Beep Playground)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Sui](https://img.shields.io/badge/Sui-Blockchain-4DA2FF)](https://sui.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-000?logo=vercel)](https://turbo.build/)

Developer playground and inspector for the **a402 (HTTP 402 Payment Required)** flow on **Sui** using **USDC** and the **Beep** SDK. Explore the payment lifecycle, validate challenges/receipts, run streaming payments, and exercise Beep MCP tools from one UI.

## Highlights

- Payment playground with **Sandbox** (mock) and **Live** (Beep Checkout Widget) toggles, step tracker, debug logs, and history.
- Inspector + request builder: paste or fetch challenges/receipts, validate against the a402 schema, cross-check fields, and export cURL / TypeScript / Python snippets.
- Streaming payments: issue/start/pause/stop Beep streaming sessions with a local status cache for fast UI feedback.
- MCP utilities: list and invoke Beep MCP tools through a server-side proxy.
- Backend helpers: CORS proxy, mock a402 challenge/receipt generators, Beep verification helpers, and on-chain format checks.

## Architecture

- **Frontend**: Next.js 15 (Turbopack), React 19, Tailwind, Zustand stores for payment/streaming/MCP state, `@beep-it/checkout-widget`, `@beep-it/sdk-core`, `@mysten/sui`, `@mysten/dapp-kit`.
- **Backend**: Express (ESM) with routes for `/a402`, `/proxy`, `/beep`, `/streaming`, `/mcp`; CORS allowlist via `CORS_ORIGINS`; Beep SDK server-side helpers.
- **Shared**: `packages/shared` contains shared TypeScript types; `tsconfig.base.json` provides workspace TS config; Turbo orchestrates tasks.

## Repository Layout

```
apps/
├── web/       # Next.js frontend (Payment / Streaming / MCP playground)
└── api/       # Express backend (a402, proxy, Beep, streaming, MCP)
packages/
└── shared/    # Shared TypeScript types
docs: README.md, PROJECT_STATUS.md, USER_FLOW.md, AI_PROJECT_NOTES.md
```

## Prerequisites

- Node.js **20+**
- Yarn **1.x** (classic)
- Sui wallet (for live payments) and Beep API keys (publishable + secret) if you want live flows; sandbox mode works without them.

## Setup

1) Install dependencies

```bash
git clone https://github.com/mertkaradayi/a402-studio.git
cd a402-studio
yarn install
```

2) Configure environment

Create `apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUI_NETWORK=testnet        # or mainnet
NEXT_PUBLIC_BEEP_PUBLISHABLE_KEY=pk_test_xxx   # required for live payments
NEXT_PUBLIC_BEEP_SERVER_URL=https://api.justbeep.it
NEXT_PUBLIC_BEEP_FACILITATOR_PUBKEY=optional_for_sig_checks
```

Create `apps/api/.env`:

```
PORT=3001
CORS_ORIGINS=http://localhost:3000      # comma-separated or "*" for dev
BEEP_SECRET_KEY=sk_test_xxx             # required for /beep, /streaming, /mcp
BEEP_PUBLISHABLE_KEY=pk_test_xxx        # optional fallback for MCP/proxy
BEEP_API_URL=https://api.justbeep.it
BEEP_MCP_URL=https://api.justbeep.it/mcp
```

3) Run locally

- Full stack: `yarn dev` (web on http://localhost:3000, API on http://localhost:3001)
- Frontend only: `yarn dev:web`
- API only: `yarn dev:api`

## Scripts

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `yarn dev`       | Start frontend + backend     |
| `yarn dev:web`   | Frontend only                |
| `yarn dev:api`   | Backend only                 |
| `yarn build`     | Production build (all apps)  |
| `yarn lint`      | Lint all packages            |
| `yarn typecheck` | Type-check all packages      |
| `yarn clean`     | Clean Turbo + root node_modules |

## Backend API Surface

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/health` | GET | Service health check |
| `/proxy` | POST | CORS-bypass proxy for arbitrary HTTP calls |
| `/proxy/beep/payment-status/:referenceKey` | GET | Check Beep payment status with publishable key |
| `/a402/challenge` | POST | Return a mock a402 challenge (402 status) |
| `/a402/verify` | POST | Basic receipt validation + nonce replay guard |
| `/a402/verify-beep` | POST | Server-side Beep verification using API keys |
| `/a402/verify-onchain` | POST | Receipt checks + Sui tx hash format guard |
| `/a402/receipt/:id` | GET | Mock receipt lookup |
| `/a402/simulate-payment` | POST | Mock payment delay + receipt |
| `/beep/pay` | POST | Wrap `requestAndPurchaseAsset` (Beep SDK) |
| `/streaming/issue` | POST | Issue a streaming invoice (Beep SDK) |
| `/streaming/start` | POST | Start streaming session |
| `/streaming/pause` | POST | Pause streaming session |
| `/streaming/stop` | POST | Stop streaming session |
| `/streaming/status/:invoiceId` | GET | Read cached streaming session state |
| `/mcp/tools` | GET | List MCP tools (initializes session) |
| `/mcp/call` | POST | Call an MCP tool with parameters |

## Frontend Modes

- **Payment**: Toggle Sandbox vs Live. Simulate end-to-end a402 flow with mock data, or run live Beep Checkout payments. Step indicator, debug log, history, and receipt/challenge validation panels.
- **Streaming**: Issue/start/pause/stop streaming payments against the backend Beep helper; uses local cache for status display.
- **MCP**: Initialize/list Beep MCP tools and invoke them via the backend to avoid CORS/key exposure.
- **Inspector & Export**: Validate any challenge/receipt JSON, cross-check fields, and export integration snippets (cURL/TS/Python). Includes reference-key lookup and webhook preview helpers.

## Notes & Limitations

- Live payments and streaming require Beep API keys; without them the UI falls back to sandbox flows.
- On-chain verification currently checks formats only; replace with real Sui RPC queries for production.
- Nonce/receipt tracking is in-memory; restart clears state. Add persistence before deploying.
- When serving the frontend from a remote domain, expose the API (ngrok/Railway) and set `NEXT_PUBLIC_API_URL` + `CORS_ORIGINS` accordingly.

## License

© 2025 Mert Karadayi. All rights reserved. See `LICENSE` for details.
