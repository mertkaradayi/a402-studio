# Beep Agent Guide (Local Doc Hub)

Use this single page as your **routing map** into the local Markdown docs. Each section gives a one‑line purpose, a TL;DR, and the exact file(s) to open next. All files live beside this guide.

## How to navigate fast
- Need a concept? Open the matching **Overview** file in each section.
- Need implementation details? Jump to the **Developer Guide / Protocol Specs** links.
- Need numbers, assets, or timelines? Check the **Supported Assets**, **Rewards**, or **Launching soon** links.

## Beep at a glance
- Agentic finance stack on **Sui**: autonomous yield, USDC-native payments, and verifiable HTTP‑402 (a402) paywalls.
- Non‑custodial by design: users hold keys; agents act with scoped session keys; every movement is on-chain and receipt-backed.
- Core pillars: **Agentic Yield**, **Beep Pay + a402**, **Agent Trader (Labs)**, and **Beeper Points/Rewards**.

## Agentic Yield (earn)
- What it is: Autonomous DeFi agent that scans Sui/Base/Solana yields, rebalances, and compounds USDC with gas-aware logic.
- Read next:
  - Overview: `documentation.justbeep.it_product-overview_agentic-yield.md`
  - What/Why: `documentation.justbeep.it_product-overview_agentic-yield_what-is-agentic-yield.md`, `documentation.justbeep.it_product-overview_agentic-yield_why-should-i-use-beeps-agentic-yield.md`
  - Architecture & primitives (vaults, pools, strategies, compounding): `documentation.justbeep.it_product-overview_agentic-yield_core-concepts.md`
  - Getting started (10‑second flow): `documentation.justbeep.it_product-overview_agentic-yield_start-earning-yield.md`
  - Supported assets (USDC live; SUI/Walrus/xBTC planned, multi-asset testing live internally): `documentation.justbeep.it_product-overview_agentic-yield_supported-assets.md`
  - Security & risk posture (whitelisted audited protocols, session-key revocation, transparency): `documentation.justbeep.it_product-overview_agentic-yield_security.md`
  - FAQs (custody model, key rotation, fees, rebalance cadence, bridging stance): `documentation.justbeep.it_product-overview_agentic-yield_faqs.md`

## Beep Pay + a402 (pay)
- What it is: Zero‑fee, sub‑second USDC checkout with yield-backed gas sponsorship; HTTP‑402 native receipts for agents/APIs.
- Beep Pay product page: `documentation.justbeep.it_product-overview_beep-pay.md`
- Beep Pay developer guide (Checkout Widget + SDK): `documentation.justbeep.it_product-overview_beep-pay_developer-guide.md`
  - Includes install (`@beep-it/checkout-widget`, `@beep-it/sdk-core`), props, asset payloads, payment flow, errors.
- Zero-fee settlement mechanics (gas sponsorship + yield-share math): `documentation.justbeep.it_product-overview_beep-pay_zero-fee-settlement-flow.md`
- a402 protocol (HTTP 402 payments for agents):
  - Concept & benefits: `documentation.justbeep.it_product-overview_agent-to-agent-payments-a402.md`
  - Protocol specs (5-stage lifecycle, receipt format, facilitator duties, error codes): `documentation.justbeep.it_product-overview_agent-to-agent-payments-a402_protocol-specs.md`
  - MCP integration for servers/agents (HTTP/SSE/stdio transports, tools, cURL examples): `documentation.justbeep.it_product-overview_agent-to-agent-payments-a402_developer-guide-a402-less-than-greater-than-mcp-pay.md`
  - CLI scaffolding (init MCP servers/clients, roles, commands, npm install @beep-it/cli): `documentation.justbeep.it_product-overview_agent-to-agent-payments-a402_developer-guide-a402-less-than-greater-than-mcp-cli.md`

## Agent Trader (Labs)
- What it is: Beep Labs’ showcase of LLM trading agents running on Bluefin perps; users keep funds in Agentic Yield but earn bonus points based on agent performance.
- Read next:
  - Overview page: `documentation.justbeep.it_product-overview_agent-trader.md`
  - What/launch details (Season One Grand Prix starts Dec 2, runs 14 days; auto opt-in ≥100 USDC): `documentation.justbeep.it_product-overview_agent-trader_what-is-agent-trader.md`
  - Architecture (inputs, decision loop, execution, risk layer, UX, Bluefin integration): `documentation.justbeep.it_product-overview_agent-trader_core-concepts.md`
  - FAQs (eligibility, balance rules, leverage, models used, leaderboard): `documentation.justbeep.it_product-overview_agent-trader_faqs.md`
  - Season rewards & formula (bonus = seasonPoints × agentReturnMultiplier; corporate capital only): `documentation.justbeep.it_product-overview_agent-trader_agent-trader-season-one-grand-prix-rewards.md`
  - Supported trading pairs (BTC, SUI, ETH, SOL, HYPE, WAL, DEEP perps): `documentation.justbeep.it_product-overview_agent-trader_supported-assets.md`

## Rewards & Points
- Beeper Boost tiers (Spark/Ignite/Blaze) tied to AUAM milestones; daily points based on TWAB and multipliers.
- File: `documentation.justbeep.it_product-overview_rewards.md`
- Agent Trader bonuses link back to Season One rewards file above.

## Resources, Community, Legal
- Resources hub: `documentation.justbeep.it_product-overview_resources.md`
  - General FAQs (stack summary, x402 vs a402, zero-fee model, walletless sessions): `documentation.justbeep.it_product-overview_resources_faqs.md`
  - Tutorials/Videos placeholder: `documentation.justbeep.it_product-overview_resources_tutorials-videos.md`
  - Community links (GitHub, Discord, X, feedback): `documentation.justbeep.it_product-overview_resources_community.md`
  - Legal links (ToS, Privacy): `documentation.justbeep.it_product-overview_resources_legal.md`
- Roadmap / Launching soon (new assets, strategies, AP2, on-chain credit): `documentation.justbeep.it_product-overview_launching-soon.md`

## Quick task routes (for agents)
- **Integrate USDC checkout**: start with Beep Pay developer guide → zero-fee settlement → protocol specs if you need receipts.
- **Build an MCP-capable payment server**: use the a402 MCP CLI guide (`init-mcp`) → MCP Pay integration guide for transport/auth/tool calls.
- **Explain security/custody**: pull from Agentic Yield security + FAQs; emphasize session keys, per-user vaults, whitelisted protocols.
- **Answer “what chains/assets?”**: Yield supports USDC on Sui today; testing SUI/Walrus/xBTC; payments settle on Sui; Agent Trader trades Bluefin perps listed in supported-assets file.
- **Points/loyalty questions**: combine Rewards file with Agent Trader rewards page (for seasonal multipliers).

## File index by topic
### Agentic Yield
- `documentation.justbeep.it_product-overview_agentic-yield.md` — landing/why built.
- `documentation.justbeep.it_product-overview_agentic-yield_what-is-agentic-yield.md` — definition + scan/score/execute loop.
- `documentation.justbeep.it_product-overview_agentic-yield_why-should-i-use-beeps-agentic-yield.md` — benefits vs manual farming.
- `documentation.justbeep.it_product-overview_agentic-yield_core-concepts.md` — vaults/pools/strategies/compounding.
- `documentation.justbeep.it_product-overview_agentic-yield_start-earning-yield.md` — 10‑second loom demo and flow.
- `documentation.justbeep.it_product-overview_agentic-yield_supported-assets.md` — live and upcoming assets.
- `documentation.justbeep.it_product-overview_agentic-yield_security.md` — permissions, risk policy, transparency.
- `documentation.justbeep.it_product-overview_agentic-yield_faqs.md` — custody, fees, cadence, bridges, supported chains.

### Beep Pay / a402
- `documentation.justbeep.it_product-overview_beep-pay.md` — product pitch, one-line integration.
- `documentation.justbeep.it_product-overview_beep-pay_developer-guide.md` — widget/SDK usage, props, assets, errors.
- `documentation.justbeep.it_product-overview_beep-pay_zero-fee-settlement-flow.md` — gas sponsorship & yield-share economics.
- `documentation.justbeep.it_product-overview_agent-to-agent-payments-a402.md` — a402 concept and positioning (vs x402/L402).
- `documentation.justbeep.it_product-overview_agent-to-agent-payments-a402_protocol-specs.md` — handshake, payload fields, receipts, errors.
- `documentation.justbeep.it_product-overview_agent-to-agent-payments-a402_developer-guide-a402-less-than-greater-than-mcp-pay.md` — MCP server integration, transports, tools, cURL.
- `documentation.justbeep.it_product-overview_agent-to-agent-payments-a402_developer-guide-a402-less-than-greater-than-mcp-cli.md` — CLI scaffolding, commands, roles, npm install.

### Agent Trader (Labs)
- `documentation.justbeep.it_product-overview_agent-trader.md` — entry page and key features.
- `documentation.justbeep.it_product-overview_agent-trader_what-is-agent-trader.md` — launch details, benefits.
- `documentation.justbeep.it_product-overview_agent-trader_core-concepts.md` — pipeline/architecture.
- `documentation.justbeep.it_product-overview_agent-trader_faqs.md` — season rules, models, risk, leaderboard.
- `documentation.justbeep.it_product-overview_agent-trader_agent-trader-season-one-grand-prix-rewards.md` — bonus formula and eligibility.
- `documentation.justbeep.it_product-overview_agent-trader_supported-assets.md` — Bluefin perp tickers for Season One.

### Rewards & Resources
- `documentation.justbeep.it_product-overview_rewards.md` — Beeper Boost tiers and points math.
- `documentation.justbeep.it_product-overview_resources.md` — hub.
- `documentation.justbeep.it_product-overview_resources_faqs.md` — high-level protocol FAQs.
- `documentation.justbeep.it_product-overview_resources_tutorials-videos.md` — tutorials placeholder.
- `documentation.justbeep.it_product-overview_resources_community.md` — community links.
- `documentation.justbeep.it_product-overview_resources_legal.md` — ToS & Privacy links.
- `documentation.justbeep.it_product-overview_launching-soon.md` — upcoming assets/strategies/AP2/credit.

### Other / Root
- `documentation.justbeep.it_.md` — original GitBook landing “What is Beep?” page and site nav.

## Usage notes for downstream agents
- All payment/yield actions are **non-custodial**; always mention session-key revocation path when surfacing security claims.
- Payments and receipts are **USDC-first on Sui**; Base/Solana referenced in yield scans but settlement truth is Sui today.
- For codegen, prefer SDK + MCP transport examples in the developer guides; avoid inventing endpoints not listed there.
- When answering timeline questions, cite the explicit dates in Agent Trader and Launching Soon pages (Season One starts Dec 2, 2025; runs 14 days).
