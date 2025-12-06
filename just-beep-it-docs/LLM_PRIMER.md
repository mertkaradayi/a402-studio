# Beep on Sui — LLM Briefing (Hackathon Ready)

Purpose: give an LLM the minimum, high-signal context to ideate or build on Beep during the Sui hackathon. All referenced files are local to this repo.

## What Beep is
- Agentic finance stack on **Sui**: autonomous yield, USDC‑native payments, and HTTP‑402 (“Payment Required”) agent‑to‑agent paywalls.
- Non‑custodial: users hold keys; agents act via scoped session keys; all movements and receipts are on‑chain and verifiable.
- Three live pillars:
  1) **Agentic Yield** – autonomous DeFi allocation + compounding for USDC on Sui (scans Sui/Base/Solana, settles on Sui).
  2) **Beep Pay + a402** – zero‑fee USDC checkout, gas sponsored via yield; a402 protocol brings payments into HTTP.
  3) **Agent Trader (Labs)** – LLM trading agents on Bluefin perps; users keep funds in yield and earn bonus points if agents profit.
- Rewards layer (Beeper Points) incentivizes TVL and seasonal events.

## Key reference files (open as needed)
- Core intro: `documentation.justbeep.it_.md`
- Agentic Yield: `documentation.justbeep.it_product-overview_agentic-yield*.md` (what, why, core-concepts, start-earning, assets, security, faqs)
- Payments / a402: `documentation.justbeep.it_product-overview_beep-pay*.md`, `documentation.justbeep.it_product-overview_agent-to-agent-payments-a402*.md`
- MCP server + CLI: `documentation.justbeep.it_product-overview_agent-to-agent-payments-a402_developer-guide-a402-less-than-greater-than-mcp-pay.md`, `...mcp-cli.md`
- Agent Trader: `documentation.justbeep.it_product-overview_agent-trader*.md`
- Rewards & roadmap: `documentation.justbeep.it_product-overview_rewards.md`, `documentation.justbeep.it_product-overview_launching-soon.md`

## Core primitives (use these when reasoning)
- **Vault**: per-user/per-agent smart account on Sui; holds assets, signs moves via session keys.
- **Pool**: external yield venue (Scallop, Navi, Bluefin, Momentum, etc.).
- **Strategy**: scan → score → execute → compound loop; gas-aware; whitelisted protocols only.
- **Receipt**: cryptographic proof for payments (a402/x402); issued by facilitator; includes payer, recipient, amount, chain, nonce.
- **Gas sponsorship & yield-share**: protocol covers gas; reimbursed from yield, incentives, or sponsor pool; merchant still gets full USDC.

## Supported assets (today vs near-term)
- Live: USDC on Sui (yield + payments).
- In testing / “launching soon”: SUI, Walrus, xBTC; multi-asset baskets for yield.
- Agent Trader perps: BTC/SUI/ETH/SOL/HYPE/WAL/DEEP on Bluefin.

## Security stance
- Non-custodial; session-key revocation stops agents instantly.
- Protocol uses audited/whitelisted venues; facilitators are stateless, trust anchored on-chain.
- Transparent tx history; receipts are verifiable.

## Hackathon-friendly build ideas
Pick one and adapt; all can leverage Beep’s SDK/MCP and zero-fee payments:
1) **API Paywall-as-Code**: Drop-in a402 middleware for any Sui dApp backend; pay-per-call with verifiable receipts and gas sponsorship.
2) **Agentic Treasury Copilot**: An LLM tool that reads vault state + pool data, proposes strategy changes, and triggers Agentic Yield compounding via MCP.
3) **Usage-Based SaaS Billing**: Checkout widget + serverless verifier; charge per inference or per DB query; receipts double as audit logs.
4) **Sui Event Ticketing**: On-chain tickets gated by a402 receipts; secondary sales auto‑split via Beep Pay and emit fresh receipts.
5) **Agent B2B Market**: Marketplace where agents sell “tools” priced in USDC; payments cleared via a402; delivery unlocked by verified receipt.
6) **Gasless Consumer Onboarding**: Walletless “session vaults” that auto-top with sponsored gas and settle via Beep Pay when balance depletes.

## Fast start paths for an agent
- Integrate payments: see Beep Pay developer guide for SDK + widget; zero-fee flow in `...zero-fee-settlement-flow.md`.
- Build payment-aware tools: use MCP server guide and CLI (`beep init-mcp`) to expose tools that require payment before execution.
- Explain custody/safety: cite Agentic Yield security + FAQs; emphasize session-key revocation and per-user vaults.
- Answer timelines: Agent Trader Season One starts Dec 2, 2025, runs 14 days; roadmap in `launching-soon.md`.

## Constraints to respect
- Settlement truth is Sui today; cross-chain references are for yield scanning, not settlement.
- Whitelist-only protocol interactions; do not assume arbitrary contract calls.
- Fees: no deposit/withdrawal fees; performance fee on APY; payments are gas-sponsored (effective merchant fee ~0).

## If more detail is needed
- Open `AGENT_GUIDE.md` (local hub) for a complete file map and section-by-section summaries.
