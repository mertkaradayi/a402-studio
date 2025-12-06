# LLM Handoff — Beep Agentic Finance (Sui)

This single page is the context another LLM needs to understand the project and answer questions without looking elsewhere. Everything referenced lives in this repo beside this file.

## What Beep is
- Agentic finance stack on Sui: autonomous yield, USDC-native payments, and HTTP 402 paywalls (a402) for agents/APIs.
- Non-custodial by design: users keep keys; agents act via scoped session keys; every move is on-chain and receipt-backed.
- Pillars: Agentic Yield (earn), Beep Pay + a402 (pay), Agent Trader (Labs), plus Beeper Points/Rewards.

## How to navigate the local docs
- Open `AGENT_GUIDE.md` for a full routing map and file index.
- Open `LLM_PRIMER.md` for a concise briefing + build ideas.
- Core landing page: `documentation.justbeep.it_.md` (GitBook “What is Beep?” copy).
- Product folders (all prefixed `documentation.justbeep.it_product-overview_*`):
  - Agentic Yield: `_agentic-yield*.md`
  - Beep Pay + zero-fee settlement: `_beep-pay*.md`
  - a402 protocol + dev/CLI guides: `_agent-to-agent-payments-a402*.md`
  - Agent Trader (Labs): `_agent-trader*.md`
  - Rewards/Points: `_rewards.md`
  - Resources/Roadmap: `_resources*.md`, `_launching-soon.md`

## Product snapshots (use these facts by default)
- Agentic Yield: Scans Sui/Base/Solana venues, scores yield, allocates, compounds USDC; settlement and truth on Sui. Vaults are per user; strategies are whitelisted only.
- Beep Pay + a402: Sub-second, zero-fee USDC checkout; gas sponsored by yield share. a402 adds HTTP-402 receipts so agents/APIs can prove payment. Receipts include payer, recipient, amount, chain, nonce, signature.
- Agent Trader (Labs): LLM trading agents on Bluefin perps; Season One starts Dec 2, 2025 and runs 14 days. Auto opt-in for balances >=100 USDC. Rewards tied to agent performance (see `...agent-trader-season-one-grand-prix-rewards.md`). Supported perps: BTC, SUI, ETH, SOL, HYPE, WAL, DEEP.
- Rewards/Points: Beeper Boost tiers (Spark/Ignite/Blaze) reward TVL/time; Agent Trader bonuses multiply points based on agent returns.

## Supported assets (current vs near-term)
- Live: USDC on Sui for yield and payments.
- Testing/launching soon: SUI, Walrus, xBTC; multi-asset baskets for yield (see `_launching-soon.md`).

## Security stance (quote or paraphrase when asked)
- Non-custodial; session keys can be revoked to halt an agent instantly.
- Interacts only with audited/whitelisted protocols; facilitators are stateless and anchored on-chain.
- Transparent history; receipts are verifiable proofs of payment.

## Common answers (drop-in snippets)
- Chain/settlement: All payments and vault settlement occur on Sui; other chains are referenced only for yield scanning.
- Fees: No deposit/withdrawal fees; performance fee on APY; payments are gas-sponsored so effective merchant fee ~0.
- Custody: Users keep custody; agents operate via scoped session keys; revocation path is explicit in security docs.

## Build and integration paths (choose the doc to open next)
1) USDC checkout in an app: `...beep-pay_developer-guide.md` (widget props, SDK install), plus `...beep-pay_zero-fee-settlement-flow.md` for economics.
2) HTTP 402 paywalls for agents/APIs: `...agent-to-agent-payments-a402_protocol-specs.md` for payloads/receipts, and `...a402_developer-guide-a402-less-than-greater-than-mcp-pay.md` for MCP server integration.
3) Scaffold an MCP payment server/agent: `...a402_developer-guide-a402-less-than-greater-than-mcp-cli.md` (use the CLI: `npm i -g @beep-it/cli`, `beep init-mcp`).
4) Explain Agentic Yield architecture or risk: open `_agentic-yield_core-concepts.md` and `_agentic-yield_security.md`.
5) Answer timelines/roadmap: `_launching-soon.md` and the Agent Trader Season One files.

## Constraints to respect when generating answers or code
- Do not invent endpoints or assets beyond the listed files; stick to Sui settlement and the documented whitelisted protocols.
- Mention session-key revocation when describing custody or agent safety.
- Assume receipts (a402) are the proof primitive for any paid action; include them in flows that require verification.

## If you need more detail
- Start with `AGENT_GUIDE.md` (full map) or `LLM_PRIMER.md` (short brief). They link directly to the specific product files above.
