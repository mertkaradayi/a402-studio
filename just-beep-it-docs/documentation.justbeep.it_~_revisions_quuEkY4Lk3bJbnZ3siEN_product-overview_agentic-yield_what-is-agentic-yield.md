---
url: "https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/what-is-agentic-yield"
title: "what is agentic yield? | Beep | Agentic Finance Protocol for AI Payments, A2A Commerce, and Yield on SUI"
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


- [what is agentic yield?](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/what-is-agentic-yield)
- [why should I use beep's agentic yield?](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/why-should-i-use-beeps-agentic-yield)
- [core concepts](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/core-concepts)
- [start earning yield](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/start-earning-yield)
- [supported assets](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/supported-assets)
- [security](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/security)
- [FAQs](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/faqs)

  - [Beep Pay](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/beep-pay)
  - [Agent to Agent payments (a402)](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-to-agent-payments-a402)
  - [Agent Trader](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agent-trader)
  - [Rewards](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/rewards)
  - [Resources](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/resources)
  - [Launching soon](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/launching-soon)

[Powered by GitBook](https://www.gitbook.com/?utm_source=content&utm_medium=trademark&utm_campaign=frgr0Kse7wRCOlaPSZd7)

On this page

GitBook AssistantAsk

1. [Product Overview](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview)
2. [Agentic Yield](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield)

# what is agentic yield?

**Capture upto 15% APY DeFi yields 24/7 with autonomous financial agents**

Agentic Yield is how you plug Beep's autonomous DeFi agent into your stablecoin balance and let it work for you scanning, reallocating, and compounding 24/7. Built natively on **Sui**, it runs strategies the moment they make sense to provide the best yield on stablecoin balance.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/what-is-agentic-yield\#how-it-works)    How It Works

The core loop is simple:

1. **Scan:** Agent pulls on-chain data (APYs, liquidity, utilization, rewards) from supported protocols.

2. **Score:** It ranks yield opportunities based on expected net gain after fees, risk weight, and gas.

3. **Execute:** When a better target exists, it reallocates capital using signed, permissioned session keys by you as the user.

4. **Compound:** Earnings are auto-redeposited into the highest-performing strategy.


Here’s what’s going on technically:

- **Wallet Architecture (On-Chain, User-Controlled)**. You have a self-custody wallet. Your self custody wallet stores your USDC. Only your session key can move funds - not Beep, not our servers. All deposits, withdrawals, swaps, and rebalances happen on-chain from your beep wallet. This is your custody layer. Your key signs them, Sui executes them, DeFi protocols settle them, all yields flow back into your wallet.

- **Agent Architecture (Off-Chain Intelligence Layer)**. Our AI agents operate off-chain. Their job is to scan approved DeFi lending markets; score opportunities based on yield, liquidity, and risk; decide when to rebalance or compound; and prepare the recommended transaction bundle. Agents scan DeFi markets, score opportunities, and prepare transaction bundles.

- **DeFi Protocols (On-Chain Execution Layer)**. When the agent recommends a strategy change: it prepares a transaction bundle (deposit, withdraw, swap, etc.). The transaction is sent to your wallet for signing using your session key. The transaction based on the strategy happens directly between your agent wallet and the DeFi smart contract, never our servers. The agent only observes, computes, and suggests.


#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/what-is-agentic-yield\#built-on-sui)    Built on Sui

Sui’s object-based model makes this architecture actually possible.
Each wallet and position exists as a programmable object, meaning the agent can hold multiple strategies concurrently without serial transaction bottlenecks.

- Transactions finalize in sub-seconds

- Session keys enable safe automated execution

- Parallelized processing allows multiple agents to run simultaneously

- Gas remains predictable and low


Beep is the first **agentic finance protocol on Sui**, and Agentic Yield is our first major implementation of that framework.

#### [Direct link to heading](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/what-is-agentic-yield\#security-and-control)    Security and Control

We’ve built our wallet service using a leading 3rd party, self-custodial wallet infrastructure provider. There is no centralized/pooled beep wallet. Each user is provisioned their own wallet with their own self-custody private keys, which is designed so that you retain full control of your private key (and therefore your funds).

The user flow is: user connects their decentralized wallet (e.g., Slush wallet) to beep; beep then provisions a beep account wallet to use for agentic yield; beep’s agentic wallet interacts with and controls allocation/re-allocation with defi protocols.

Neither Beep nor its wallet infrastructure provider can move your funds unless your session keys authorize it. Session key model (common across modern protocols) is used, our servers can prepare or sponsor transactions for usability, but only your session key can actually sign and move funds, and you can revoke or rotate it at any time.

Embedded wallets are built on globally distributed infrastructure to ensure high uptime and low latency. They leverage secure hardware to ensure only the rightful owner can control their wallet or access its keys.

[PreviousAgentic Yield](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield) [Nextwhy should I use beep's agentic yield?](https://documentation.justbeep.it/~/revisions/quuEkY4Lk3bJbnZ3siEN/product-overview/agentic-yield/why-should-i-use-beeps-agentic-yield)

Last updated 20 days ago