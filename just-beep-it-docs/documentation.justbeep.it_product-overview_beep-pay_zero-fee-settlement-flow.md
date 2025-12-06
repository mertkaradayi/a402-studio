---
url: "https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow"
title: "zero fee settlement flow | Beep | Agentic Finance Protocol for AI Payments, A2A Commerce, and Yield on SUI"
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

- [How It Works (at a glance)](https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow#how-it-works-at-a-glance)
- [Money Flows](https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow#money-flows)
- [Yield-Share](https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow#yield-share)
- [Economics (rule of thumb)](https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow#economics-rule-of-thumb)

GitBook AssistantAsk

1. [Product Overview](https://documentation.justbeep.it/product-overview)
2. [Beep Pay](https://documentation.justbeep.it/product-overview/beep-pay)

# zero fee settlement flow

Beep Pay is designed so merchants receive **the full USDC amount** while **effective payment costs trend to $0**. We do this with **gas sponsorship + yield-share**: the protocol covers network fees at settlement time and recoups them from opt-in yield sources (merchant float, facilitator pool, or protocol incentives).

Zero-fee here means **merchant net = invoice amount**, not “the chain has no gas.”

![](https://documentation.justbeep.it/~gitbook/image?url=https%3A%2F%2F2348763252-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Ffrgr0Kse7wRCOlaPSZd7%252Fuploads%252FBxzcttszVq0PAz8DDALA%252FFlow%2520image%2520Oct%252026%252C%25202025%252C%252008_20_24%2520PM.png%3Falt%3Dmedia%26token%3D7fc75054-85d9-4e25-9699-b18c9d758a53&width=768&dpr=4&quality=100&sign=695fc036&sv=2)

### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow\#how-it-works-at-a-glance)    How It Works (at a glance)

1. **Invoice**
Merchant creates an invoice for `amount = X USDC`.

2. **Payment**
Payer signs a USDC transfer to the merchant vault (non-custodial).
The facilitator attaches a **gas sponsorship** commitment.

3. **Settlement**
Transaction executes; merchant vault receives exactly `X USDC`.

4. **Rebate / Offset**
The protocol covers gas from a **sponsor pool** and offsets it via:



- **Merchant Yield-Share (optional):** use yield from merchant’s idle balance to reimburse the sponsor.

- **Protocol Incentives:** rebates, credits, or fee waivers from Beep.

- **Facilitator Float:** dedicated pool that earns yield and absorbs gas.


5. **Receipt**
A signed **x402 receipt** is emitted on-chain (verifiable proof of payment + sponsorship details).


### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow\#money-flows)    Money Flows

- **Incoming:**`payer → merchant` (USDC)

- **Sponsorship:**`sponsor_pool → network_gas` (native asset)

- **Rebalance:**`merchant_yield or protocol_incentive → sponsor_pool` (periodic)


The merchant always sees **exact invoice amount**. Gas never reduces the credit the merchant receives.

### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow\#yield-share)    Yield-Share

If enabled, a tiny portion of the **merchant’s idle USDC** (sitting in the merchant vault) is routed into a low-risk yield source. The realized yield periodically **reimburses** the sponsor pool. If the merchant has no float, Beep can cover costs via protocol incentives.

- No impact on settlement timing.

- Fully non-custodial; merchant can disable at any time.

- Targets conservative, audited sources only.


### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow\#economics-rule-of-thumb)    Economics (rule of thumb)

Let:

- `G` = gas cost in native units (converted to USDC at tx time)

- `Y` = periodized yield from merchant float (USDC)

- `I` = protocol incentive credit (USDC)


Sponsor pool target: `G - (Y + I) ≤ 0` averaged over N tx.
If `Y + I < G`, Beep covers the delta; merchant still receives the full amount.

[PreviousDeveloper guide](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide) [NextAgent to Agent payments (a402)](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402)

Last updated 1 month ago