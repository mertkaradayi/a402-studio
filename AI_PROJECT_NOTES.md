# a402 Studio / Beep Playground — Working Notes

- Author: ChatGPT (assistant); Updated: 2025-12-07
- Purpose: Quick mental model so I don't need re-intro.

## What This Project Is
- Developer playground and inspector for the a402 (HTTP 402 Payment Required) flow on Sui using USDC.
- Modes: Demo (presets), Test Endpoint (proxy real 402 APIs), Inspector (validate challenge/receipt JSON), Code Export, History.
- Frontend: Next.js 15 + React 19 + Zustand; Backend: Express (scaffold); Monorepo with shared types.

## Current Implementation Snapshot (from docs)
- UI, validators, store, mock backend routes scaffolded (`/a402/challenge`, `/a402/verify`, `/a402/simulate-payment`, etc.).
- Missing for real flows: backend proxy for CORS, Sui RPC reads, wallet connect, Beep SDK payments, real signature verification, persistence for nonces/history.
- Transaction tab and payment actions currently mock only.

## Key Files/Locations
- Frontend entry: `apps/web/src/app/page.tsx`; main UI: `apps/web/src/components/flow-playground.tsx`.
- Validation: `apps/web/src/lib/validators.ts`; state: `apps/web/src/stores/flow-store.ts`.
- Backend entry: `apps/api/src/index.ts`; routes scaffold: `apps/api/src/routes/a402.ts` (proxy route to be added).
- Shared types: `packages/shared/src/index.ts`.
- Project docs: `README.md`, `USER_FLOW.md`, `PROJECT_STATUS.md`.
- Beep references: repo `../beep-sdk` (packages `core`, `checkout-widget`, `cli`, `mcp`).

## Beep SDK Context (external repo)
- `@beep-it/sdk-core`: TypeScript client for invoices/payments (browser-safe public client).
- `@beep-it/checkout-widget`: React drop-in payment widget.
- `@beep-it/cli`: scaffolds MCP servers/templates.
- Monorepo uses pnpm; check `packages/core/README.md` etc. for API surfaces.

## Likely Next Steps (from status guide)
1) Add backend proxy `/proxy` to bypass CORS for Test Endpoint mode.
2) Wire Sui RPC client to populate real tx data; swap mock txn display.
3) Add wallet connect via `@mysten/dapp-kit`; surface connect button.
4) Integrate Beep payments (SDK or MCP) to create real receipts.
5) Verify signatures with facilitator public key.
6) Persist nonces/history (SQLite or hosted DB).

## Open Questions
- Which Beep package/version to use? (npm scope and API confirmation needed.)
- Network defaults: testnet vs mainnet toggle; how to surface in UI/env.
- Source of facilitator public key for signature verification.
- Should proxy allow arbitrary headers/body or enforce allowlist/rate limits?

