---
url: "https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs"
title: "Protocol Specs | Beep | Agentic Finance Protocol for AI Payments, A2A Commerce, and Yield on SUI"
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

- [🧩 Protocol Specs (a402)](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs#protocol-specs-a402)
- [🔄 Transaction Lifecycle](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs#transaction-lifecycle)
- [🔐 Cryptographic Receipts & Verification](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs#cryptographic-receipts-and-verification)
- [🧠 MCP / a402 Facilitator Interface](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs#mcp-a402-facilitator-interface)
- [🧯 Error Codes and Responses](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs#error-codes-and-responses)
- [🧾 Summary](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs#summary)

GitBook AssistantAsk

1. [Product Overview](https://documentation.justbeep.it/product-overview)
2. [Agent to Agent payments (a402)](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402)

# Protocol Specs

## [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#protocol-specs-a402)    🧩 Protocol Specs (a402)

The **a402 protocol** defines how two autonomous agents perform a verified payment handshake using **HTTP 402** and on-chain settlement.
It’s built to be machine-readable, non-custodial, and composable — a protocol any agent can speak.

* * *

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#transaction-lifecycle)    🔄 Transaction Lifecycle

Every a402 payment moves through five atomic stages:

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#id-1.-request)    1\. **Request**

The client (agent) attempts to access a protected resource or API endpoint.
If payment is required, the merchant server responds with:

Copy

```
HTTP 402 Payment Required
Payment-Request: <encoded a402 payload>
```

The payload includes:

- `amount` — stablecoin amount (e.g., `"0.50 USDC"`)

- `recipient` — merchant vault address

- `chain` — `"sui"`, `"base"`, or `"solana"`

- `nonce` — unique identifier for replay protection

- `expiry` — optional timeout (in seconds)

- `callback` — optional URL for post-payment confirmation


* * *

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#id-2.-pay)    2\. **Pay**

The agent’s wallet or runtime executes a transfer on the specified chain.

Copy

```
{
  "payer": "0xPAYER",
  "recipient": "0xMERCHANT",
  "amount": "0.50",
  "asset": "USDC",
  "chain": "sui",
  "nonce": "0xabc123"
}
```

This transaction is **non-custodial** — the agent signs it directly using its session key.

* * *

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#id-3.-verify)    3\. **Verify**

The **Facilitator** verifies the transaction against the payment request:

- Confirms transfer on-chain with exact `amount`, `recipient`, `chain`, and `nonce`

- Validates digital signature and confirms finality

- Generates a **cryptographic receipt**


If valid, the Facilitator emits:

Copy

```
x402.receipt(valid=true)
```

and the merchant unlocks the resource.

* * *

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#id-4.-unlock)    4\. **Unlock**

Once verified, the merchant server delivers the protected output:

- File, API result, or model inference

- Optional metadata in HTTP 200 response

- a402 receipt hash embedded in response headers


Copy

```
HTTP 200 OK
Payment-Receipt: <hash>
Content-Type: application/json
```

* * *

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#id-5.-record)    5\. **Record**

Finally, the Facilitator posts the receipt to chain for traceability:

Copy

```
{
  "receipt_id": "rcpt_01HXYF3",
  "payer": "0xPAYER",
  "merchant": "0xMERCHANT",
  "amount": "0.50",
  "chain": "sui",
  "tx_hash": "0x1234abcd...",
  "timestamp": "2025-10-26T00:31:00Z",
  "status": "paid"
}
```

Receipts are public, auditable, and can be re-verified by any third party or contract.

* * *

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#cryptographic-receipts-and-verification)    🔐 Cryptographic Receipts & Verification

Each a402 transaction generates a **verifiable receipt** signed by the Facilitator.
It’s the trust anchor for machine-to-machine commerce.

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#receipt-format)    Receipt Format

Copy

```
{
  "id": "rcpt_01HXYF3",
  "request_nonce": "0xabc123",
  "payer": "0xPAYER",
  "merchant": "0xMERCHANT",
  "amount": "0.50",
  "asset": "USDC",
  "chain": "sui",
  "tx_hash": "0x1234abcd...",
  "signature": "0xFACILITATOR_SIG",
  "issued_at": 1735278394
}
```

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#verification-steps)    Verification Steps

1. Validate facilitator signature using known public key.

2. Confirm `tx_hash` exists and matches `amount`, `payer`, and `merchant`.

3. Check replay protection (`request_nonce` not reused).

4. Confirm `status = paid` and within valid time window.


Receipts are portable — they can be re-verified by any service, L2, or agent framework.

* * *

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#mcp-a402-facilitator-interface)    🧠 MCP / a402 Facilitator Interface

The **Facilitator** acts as the protocol’s bridge between web requests and blockchain settlement.
It exposes a **Machine Communication Protocol (MCP)** interface for verifying and recording a402 payments.

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#core-endpoints)    Core Endpoints

Method

Endpoint

Description

`POST`

`/a402/verify`

Validate an agent’s payment receipt against the chain

`POST`

`/a402/record`

Post a verified receipt to on-chain storage

`GET`

`/a402/status/:id`

Check payment or receipt status

`POST`

`/a402/sponsor`

(Optional) Request gas sponsorship for zero-fee settlement

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#facilitator-responsibilities)    Facilitator Responsibilities

- Verify `amount`, `recipient`, and `nonce` match the merchant’s 402 payload

- Ensure chain finality before confirming

- Sign and issue receipt (`0xFACILITATOR_SIG`)

- Maintain receipt registry for external verification

- Optionally cover gas through the sponsorship pool


Facilitators are stateless by design — all trust is derived from **on-chain proofs**, not backend storage.

* * *

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#error-codes-and-responses)    🧯 Error Codes and Responses

Code

Meaning

Description

**402**

Payment Required

Payment info missing or unpaid

**409**

Nonce Collision

Reused or invalid request nonce

**410**

Expired Payment

Request expired before settlement

**422**

Invalid Receipt

Receipt verification failed (mismatch or tamper)

**424**

Chain Finality Error

Transaction not yet confirmed or reverted

**429**

Rate Limit

Facilitator throttling or abuse detection

**500**

Internal Error

Unexpected facilitator issue

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#example-invalid-receipt)    Example: Invalid Receipt

Copy

```
HTTP 422 Unprocessable Entity
x402-Error: INVALID_RECEIPT
x402-Details: Signature mismatch or tampered data
```

* * *

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/protocol-specs\#summary)    🧾 Summary

- **a402** is the transport layer for agentic payments

- **HTTP 402** signals payment intent

- **Facilitator** validates and signs receipts

- **Merchants** unlock resources on verified proof

- **Receipts** live on-chain, auditable, and portable


- Transaction Lifecycle

- Cryptographic Receipts & Verification

- MCP / a402 Facilitator Interface

- Error Codes and Responses


[PreviousDeveloper guide a402 <> mcp-cli](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-cli) [NextAgent Trader](https://documentation.justbeep.it/product-overview/agent-trader)

Last updated 1 month ago