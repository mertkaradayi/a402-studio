---
url: "https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/core-concepts"
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

- [What is Beep?](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN)
- Product Overview

  - [Agentic Yield](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield)
  - [Beep Pay](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/beep-pay)
  - [Agent to Agent payments (a402)](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-to-agent-payments-a402)
  - [Agent Trader](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader)


- [what is agent trader?](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/what-is-agent-trader)
- [core concepts](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/core-concepts)
- [FAQ's](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/faqs)
- [Agent Trader: Season One Grand Prix Rewards](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/agent-trader-season-one-grand-prix-rewards)
- [supported assets](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/supported-assets)

  - [Rewards](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/rewards)
  - [Resources](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/resources)
  - [Launching soon](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/launching-soon)

[Powered by GitBook](https://www.gitbook.com/?utm_source=content&utm_medium=trademark&utm_campaign=frgr0Kse7wRCOlaPSZd7)

On this page

GitBook AssistantAsk

1. [Product Overview](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview)
2. [Agent Trader](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader)

# core concepts

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/core-concepts\#high-level-architecture)    High-level architecture

The architecture of Agent Trader is organized into several key layers, each responsible for distinct functions:

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/core-concepts\#inputs)    Inputs

Utilizes data critical for decision-making:

- **Market data from Bluefin**: Includes prices, orderbooks, volume, funding rates, open interest (OI), and volatility indicators.

- **Portfolio state**: Details such as lab balances, open positions, margin requirements, and unrealized profit & loss (P&L).

- **Strategy config**: Defines parameters like risk profiles, leverage limits, asset availability, and trade cooldown periods.


#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/core-concepts\#agent-brain-decision-loop)    Agent brain (decision loop)

Handles the complete decision-making cycle:

1. **Observe**: Ingests current market and portfolio data.

2. **Analyze**: Evaluates features such as Exponential Moving Averages (EMAs), volatility bands, market trends, and bid-ask spreads.

3. **Plan**: The policy model decides trading factors like direction, position size, leverage, stop-loss, and target levels, including expiry and confidence measures.

4. **Act**: Issues structured trade actions based on analysis.

5. **Evaluate**: Monitors trade outcomes to inform future decisions.


#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/core-concepts\#execution-layer)    Execution layer

Ensures effective trade implementation:

- Directly connects with Bluefin APIs and contracts for order execution.

- Manages order retries, partial fills, and maintains stability during infrastructural disruptions.


#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/core-concepts\#risk-and-policy-layer)    Risk & policy layer

- **Guardrails**: LLM model uses daily maximum loss, asset-specific maximum exposure, leverage caps, and slippage-activated shutdowns.


#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/core-concepts\#ux-layer)    UX layer

Enhances user interaction and visibility:

- **Labs dashboard**: Displays the seasonal growth curve, trade logs with explanations, and current return estimates (R).

- **User view**: Leaderboard shows Time-Weighted Average Balance (TWAB) and Leaderboard shows Baseline Points


#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/core-concepts\#beep-bluefin-integration)    Beep × Bluefin integration

Represents the collaborative operation combining Beep Labs and Bluefin infrastructure for robust trading activities:

- **Beep**: Manages the agent's decision-making brain, capital allocation, and points management.

- **Bluefin**: Facilitates on-chain perpetual markets order execution


[Previouswhat is agent trader?](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/what-is-agent-trader) [NextFAQ's](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader/faqs)

Last updated 3 days ago