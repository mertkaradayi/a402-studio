---
url: "https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts"
title: "core concepts | Beep | Agentic Finance Protocol for AI Payments, A2A Commerce, and Yield on SUI"
---

[![Logo](https://documentation.justbeep.it/~gitbook/image?url=https%3A%2F%2F2720193548-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FXodcgn3uvYazoeBEqfgN%252Fsites%252Fsite_x3c2R%252Flogo%252Fus71QJ4dCSb0PtVQio7u%252FBeep%2520logo%2520_%2520mega.png%3Falt%3Dmedia%26token%3D5693182c-0222-4124-ad65-0d2df26cd7bd&width=260&dpr=4&quality=100&sign=92fc6c34&sv=2)![Logo](https://documentation.justbeep.it/~gitbook/image?url=https%3A%2F%2F2720193548-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FXodcgn3uvYazoeBEqfgN%252Fsites%252Fsite_x3c2R%252Flogo%252Fus71QJ4dCSb0PtVQio7u%252FBeep%2520logo%2520_%2520mega.png%3Falt%3Dmedia%26token%3D5693182c-0222-4124-ad65-0d2df26cd7bd&width=260&dpr=4&quality=100&sign=92fc6c34&sv=2)](https://documentation.justbeep.it/)

`Ctrl`  `k`

GitBook Assistant

GitBook Assistant

GitBook Assistant

Working...Thinking...

GitBook Assistant

##### Good night

I'm here to help you with the docs.

What is this page about?What should I read next?Can you give an example?

`Ctrl`  `i`

AIBased on your context

Send

- [What is Beep?](https://documentation.justbeep.it/)
- Product Overview

  - [Agentic Yield](https://documentation.justbeep.it/product-overview/agentic-yield)


- [what is agentic yield?](https://documentation.justbeep.it/product-overview/agentic-yield/what-is-agentic-yield)
- [why should I use beep's agentic yield?](https://documentation.justbeep.it/product-overview/agentic-yield/why-should-i-use-beeps-agentic-yield)
- [core concepts](https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts)
- [start earning yield](https://documentation.justbeep.it/product-overview/agentic-yield/start-earning-yield)
- [supported assets](https://documentation.justbeep.it/product-overview/agentic-yield/supported-assets)
- [security](https://documentation.justbeep.it/product-overview/agentic-yield/security)
- [FAQs](https://documentation.justbeep.it/product-overview/agentic-yield/faqs)

  - [Beep Pay](https://documentation.justbeep.it/product-overview/beep-pay)
  - [Agent to Agent payments (a402)](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402)
  - [Agent Trader](https://documentation.justbeep.it/product-overview/agent-trader)
  - [Rewards](https://documentation.justbeep.it/product-overview/rewards)
  - [Resources](https://documentation.justbeep.it/product-overview/resources)
  - [Launching soon](https://documentation.justbeep.it/product-overview/launching-soon)

[Powered by GitBook](https://www.gitbook.com/?utm_source=content&utm_medium=trademark&utm_campaign=frgr0Kse7wRCOlaPSZd7)

On this page

- [🏦 Vaults](https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts#vaults)
- [Pools](https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts#pools)
- [🧠 Strategies](https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts#strategies)
- [♻️ Compounding](https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts#compounding)
- [🧩 TLDR;](https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts#tldr)

GitBook AssistantAsk

1. [Product Overview](https://documentation.justbeep.it/product-overview)
2. [Agentic Yield](https://documentation.justbeep.it/product-overview/agentic-yield)

# core concepts

Agentic Yield isn’t a black box it’s a bunch of simple primitives wired together for ai-agents.
If you understand how vaults, pools, and strategies interact, you can build, debug, or extend your own agent logic pretty easily.

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts\#vaults)    🏦 Vaults

A **vault** is your agent’s working account inside Sui defi protocols.
It’s a smart contract object on Sui that holds your tokens, tracks positions, and exposes a clean interface for deposits, withdrawals, and reallocation. You (or your agent) are the only one with valid permissions to execute actions inside it.

Vaults handle:

- Token deposits / redemptions

- Balance tracking

- Yield accrual and performance history


Each user or agent gets its own vault. There’s no shared pool risk — your wallet is isolated, composable, and fully on-chain.

> Think of it as a programmable wallet that knows how to farm.

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts\#pools)    Pools

A **pool** is an external liquidity source — like Scallop, Navi, Momentum, SUILend, Bluefin, etc. — where the agent actually earns yield.
Pools define the _where_ of your yield, not the _how_.

Each pool has:

- Supported asset (e.g., USDC)

- Current APY / APR

- Liquidity depth

- Utilization rate

- Risk score


Your agent constantly monitors all active pools on Sui.
When conditions change in your vault's favor — new incentives, liquidity shifts, or risk events — the agent updates its pool scores in real time.

> Pools are the data layer the agent reads before deciding what to do next.

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts\#strategies)    🧠 Strategies

A **strategy** is a logic module that decides _how_ to allocate across pools.
This is where your agent actually gets its brain.

Each strategy implements a few key interfaces:

Copy

```
interface Strategy {
  scan(): Opportunity[];
  score(opportunity: Opportunity): number;
  execute(opportunity: Opportunity): Txn[];
  compound(): Txn[];
}
```

Under the hood, strategies use on-chain data, oracles, and historical signals to calculate expected net yield after gas and risk.

Common strategies include:

- **Lending Aggregator:** Find best stablecoin lending rate.

- **LP Auto-Compounder:** Reinvest rewards from LP positions.

- **Rewards Optimizer:** Rotate between vaults with boosted rewards.


### [Direct link to heading](https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts\#compounding)    ♻️ Compounding

Compounding is where the magic happens.
Whenever the agent detects accrued yield above a threshold, it rolls it back into the base strategy.

The flow looks like this:

1. Harvest rewards from the current pool.

2. Swap / convert if needed (e.g., reward token → USDC).

3. Re-deposit into the best-performing pool.


This process can happen multiple times a day, depending on gas conditions and profit margin.

Beep agents calculate compounding frequency dynamically — they only act when it’s economically positive to do so (i.e., net yield > gas + slippage).

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agentic-yield/core-concepts\#tldr)    🧩 TLDR;

At runtime:

- The **vault** holds assets.

- The **strategy** picks targets.

- The **pools** supply yield.

- The **compounding loop** keeps it growing.


[Previouswhy should I use beep's agentic yield?](https://documentation.justbeep.it/product-overview/agentic-yield/why-should-i-use-beeps-agentic-yield) [Nextstart earning yield](https://documentation.justbeep.it/product-overview/agentic-yield/start-earning-yield)

Last updated 22 days ago