---
url: "https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402"
title: "Agent to Agent payments (a402) | Beep | Agentic Finance Protocol for AI Payments, A2A Commerce, and Yield on SUI"
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
  - [Agent to Agent payments (a402)](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402)


- [Developer guide a402 <> mcp-pay](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay)
- [Developer guide a402 <> mcp-cli](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-cli)
- [Protocol Specs](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs)

  - [Agent Trader](https://documentation.justbeep.it/product-overview/agent-trader)
  - [Rewards](https://documentation.justbeep.it/product-overview/rewards)
  - [Resources](https://documentation.justbeep.it/product-overview/resources)
  - [Launching soon](https://documentation.justbeep.it/product-overview/launching-soon)

[Powered by GitBook](https://www.gitbook.com/?utm_source=content&utm_medium=trademark&utm_campaign=frgr0Kse7wRCOlaPSZd7)

On this page

- [What is a402?](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402#what-is-a402)

GitBook AssistantAsk

1. [Product Overview](https://documentation.justbeep.it/product-overview)

# Agent to Agent payments (a402)

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402\#what-is-a402)    What is a402?

**a402** is the open payment protocol behind **Beep Pay**. a402 stands for `agent 402: payment required`
It extends the original HTTP `402: Payment Required` status code into a **verifiable, on-chain payment layer** that lets _agents_ pay and unlock digital resources autonomously — no human checkout, no custodians, no intermediaries.

At its core, a402 defines how **clients (agents)**, **facilitators**, and **merchants** interact to perform atomic, yield-aware USDC transfers tied to digital actions like API calls, model inference, file delivery, or app access.

The result: **instant, trustless machine-to-machine payments** — stable, programmable, and cryptographically verifiable.

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402\#the-idea)    💡 The Idea

HTTP 402 has existed for decades as a reserved response code for “Payment Required,” but until now it had no implementation.
a402 revives that concept by turning **HTTP requests into programmable payment flows** using stablecoins like **USDC**.

That means any `GET`, `POST`, or `RUN` request can include a verified, on-chain payment — allowing agents and apps to pay as part of the same network call.

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402\#how-it-works)    ⚙️ How It Works

1. **Client (Agent)** requests access to a protected resource (e.g., API, AI endpoint, dataset).

2. **Server (Merchant)** responds with:







Copy

```
HTTP 402 Payment Required
Payment-Request: <encoded a402 payload>
```

3. **Client** executes the stablecoin transfer and sends back a **payment receipt**.

4. **Server or Facilitator** verifies the receipt on-chain.

5. Once verified, access is **granted instantly**.


Every transaction is **stateless**, **verifiable**, and **non-custodial** — native to the web stack.

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402\#why-it-matters)    💸 Why It Matters

a402 makes payments a **first-class citizen of the web**.
Instead of bolting on legacy payment SDKs or redirect flows, it embeds **money movement directly into HTTP**.

This enables:

- **Pay-per-call APIs** (monetize inference, data, compute)

- **Pay-per-second** streaming for media or model usage

- **Agent-to-agent commerce** for autonomous systems

- **Instant microtransactions** with no intermediaries or credit rails


In short, a402 bridges **the internet and the financial layer** — seamlessly, natively, and globally.

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402\#key-properties)    🔐 Key Properties

- **Stablecoin-native:** built around on-chain USDC transfers

- **Instant settlement:** sub-second confirmation (Sui)

- **Verifiable receipts:** every payment has a cryptographic proof

- **Non-custodial:** sender and receiver control their own vaults

- **Composable:** works with existing web standards (HTTP headers, status codes)


#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402\#how-does-a402-compare-to-x402-or-l402)    How does a402 compare to x402 or L402?

- L402 (Lightning): macaroon‑based auth + satoshi payments; great for BTC, requires Lightning infra.

- x402 (Coinbase): strong push for EVM chains, lacks identity.

- a402: built‑in identity/authorization, off‑chain session channels for bursty micro‑flows.


## [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402\#undefined)

[Previouszero fee settlement flow](https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow) [NextDeveloper guide a402 <> mcp-pay](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay)

Last updated 1 month ago