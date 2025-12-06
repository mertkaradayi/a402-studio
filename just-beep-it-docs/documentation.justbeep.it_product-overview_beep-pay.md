---
url: "https://documentation.justbeep.it/product-overview/beep-pay"
title: "Beep Pay | Beep | Agentic Finance Protocol for AI Payments, A2A Commerce, and Yield on SUI"
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
  - [Beep Pay](https://documentation.justbeep.it/product-overview/beep-pay)


- [Developer guide](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide)
- [zero fee settlement flow](https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow)

  - [Agent to Agent payments (a402)](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402)
  - [Agent Trader](https://documentation.justbeep.it/product-overview/agent-trader)
  - [Rewards](https://documentation.justbeep.it/product-overview/rewards)
  - [Resources](https://documentation.justbeep.it/product-overview/resources)
  - [Launching soon](https://documentation.justbeep.it/product-overview/launching-soon)

[Powered by GitBook](https://www.gitbook.com/?utm_source=content&utm_medium=trademark&utm_campaign=frgr0Kse7wRCOlaPSZd7)

On this page

- [Accept payments using Beep Pay](https://documentation.justbeep.it/product-overview/beep-pay#accept-payments-using-beep-pay)
- [⚡ Why Use Beep Pay?](https://documentation.justbeep.it/product-overview/beep-pay#why-use-beep-pay)

GitBook AssistantAsk

1. [Product Overview](https://documentation.justbeep.it/product-overview)

# Beep Pay

**Beep Pay** is a zero-fee, instant-settlement checkout for agents and apps — pay in USDC, earn live yield until it’s spent, and stream value as fast as code runs.

### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay\#accept-payments-using-beep-pay)    Accept payments using Beep Pay

Add **one-tap USDC payments** to your app, API, or agent with the simple `requestAndPurchaseAsset()` helper and the **Beep Pay Button**.

Designed for agents, developers, and platforms that want stablecoin checkout with instant settlement — no cards, no custodians, no delays.

Copy

```
await beep.payments.requestAndPurchaseAsset({
  assets: [{\
    name: 'Custom Magic Potion',\
    price: '12.50',\
    quantity: 2,\
    description: 'Instant health boost',\
  }]
});
```

Payments confirm in seconds and settle directly between non-custodial vaults.

### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay\#why-use-beep-pay)    ⚡ Why Use Beep Pay?

**Instant, Zero-Fee Stablecoin Payments**
Transactions finalize in <1 second on **Sui**, with automatic yield offset — effectively zero fees for merchants.

**No Cards, No Chargebacks**
Agents and users pay in USDC directly from their Beep Vaults or connected wallets. There’s no intermediary, no disputes, and no FX markup.

**USDC-Native**
All payments are denominated in USDC (no gas juggling). Beep automatically sponsors gas, so you charge in dollars and receive dollars — clean, predictable, and stable.

**Global by Default**
Runs across **Sui** network. Every payment produces a verifiable on-chain receipt compliant with the x402 standard.

**One-Line Integration**
Import the SDK, call `pay()`, or drop the `<BeepPayButton />` component. Works anywhere you can run JavaScript — web, node, or agent runtime.

**Always Funded Accounts**
Users pay from their Beep Vaults, Sui Wallets, or any USDC-compatible account. Agents can also pay autonomously via delegated session keys.

**No Extra Fees**
Merchants receive the full amount. Beep’s yield-share mechanism offsets gas costs, keeping effective payment fees at zero.

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay\#example-use-cases)    Example Use Cases

- Pay-per-API call or AI inference

- One-click purchases for digital goods

- Subscription or usage-based billing

- Instant merchant payouts and revenue splits


[PreviousFAQs](https://documentation.justbeep.it/product-overview/agentic-yield/faqs) [NextDeveloper guide](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide)

Last updated 29 days ago