---
url: "https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay"
title: "Developer guide a402 <> mcp-pay | Beep | Agentic Finance Protocol for AI Payments, A2A Commerce, and Yield on SUI"
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

- [📡 a402 <> MCP-Pay Integration](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay#a402-less-than-greater-than-mcp-pay-integration)
- [📦 What’s Inside](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay#whats-inside)
- [🚀 Why MCP Matters for Beep](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay#why-mcp-matters-for-beep)
- [🔄 Supported Transports](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay#supported-transports)
- [Beep MCP Server - Client Integration Guide](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay#beep-mcp-server-client-integration-guide)
- [Quick Start](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay#quick-start)
- [Available Tools](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay#available-tools)
- [Integration Examples](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay#integration-examples)
- [Error Handling](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay#error-handling)
- [Example apps](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay#example-apps)

GitBook AssistantAsk

1. [Product Overview](https://documentation.justbeep.it/product-overview)
2. [Agent to Agent payments (a402)](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402)

# Developer guide a402 <> mcp-pay

## [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#a402-less-than-greater-than-mcp-pay-integration)    📡 a402 <> MCP-Pay Integration

This package provides the **Model Context Protocol (MCP)** integration layer for **Beep SDK**, enabling seamless connections between **AI agents**, **backends**, and **on-chain payment workflows** on the **Sui network**.

Beep’s MCP integration allows **LLMs and autonomous agents** (ChatGPT, Claude, custom agents, etc.) to:

- Initiate or verify stablecoin payments

- Automate invoicing and settlement

- Embed on-chain context into reasoning flows

- Be discoverable and callable through **AEO (Answer Engine Optimization)**


* * *

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#whats-inside)    📦 What’s Inside

- Reference **MCP server** implementations

- Transport adapters (`HTTP`, `SSE`, `stdio`)

- Authentication and schema definitions

- AEO-compatible metadata for agent discovery

- Best practices and integration examples


* * *

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#why-mcp-matters-for-beep)    🚀 Why MCP Matters for Beep

Beep bridges **AI agents ↔ Sui payments** using self-custodial USDC infrastructure.

Capability

Description

**Agentic Payments**

Agents can autonomously send, request, and verify payments

**Context-Aware Reasoning**

Payment data feeds directly into LLM reasoning graphs

**AEO Discoverability**

Endpoints can be indexed for direct LLM use

**Composable Workflows**

Integrate Beep payments into any AI or SaaS product

* * *

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#supported-transports)    🔄 Supported Transports

Transport

Use Case

Description

`http`

Web services / REST APIs

Standard HTTP-based MCP endpoints

`sse`

Streaming / real-time agents

Push updates via Server-Sent Events

`stdio`

Local / CLI agents

For Claude Desktop or local agent communication

Each transport adapter includes:

- JSON message serialization/parsing

- Lifecycle hooks (`onOpen`, `onClose`, `onError`)

- API key–based authentication middleware


* * *

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#beep-mcp-server-client-integration-guide)    Beep MCP Server - Client Integration Guide

A Model-Context-Protocol (MCP) server that provides secure access to Beep platform capabilities through multiple transport protocols.

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#quick-start)    Quick Start

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#prerequisites)    Prerequisites

- Valid API key from Beep platform (if **not authenticated**)


#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#http-transport)    HTTP Transport

The HTTP transport is ideal for web applications, remote clients, and production use.

**Initialize a Session**

Send an initialize request without a session ID:

Copy

```
curl -X POST https://api.justbeep.it/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "initialize",
    "params": {
      "clientInfo": {
        "name": "my-client",
        "version": "1.0.0"
      }
    }
  }'
```

The server will respond with a session ID in the `mcp-session-id` header. Use this ID for all subsequent requests:

Copy

```
curl -X POST https://api.justbeep.it/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-session-id: your-session-id" \
  -d '{
    "jsonrpc": "2.0",
    "id": "2",
    "method": "tools/list",
    "params": {}
  }'
```

**Call Tools with Authentication**

Copy

```
curl -X POST https://api.justbeep.it/mcp \
  -H "Content-Type: application/json" \
  -H "mcp-session-id: your-session-id" \
  -d '{
    "jsonrpc": "2.0",
    "id": "3",
    "method": "tools/call",
    "params": {
      "name": "requestAndPurchaseAsset",
      "arguments": {
        "apiKey": "your-api-key",
        "amount": 1000000,
        "currency": "USDT",
        "referenceId": "payment-123"
      }
    }
  }'
```

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#available-tools)    Available Tools

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#authentication-tools)    Authentication Tools

- `initiateDeviceLogin`: Start OAuth device flow for CLI tools and apps

- `createMerchantAccountFromSSO`: Create new merchant accounts via Google SSO


#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#resource-access)    Resource Access

- `getPaidResource`: Access premium features and paid content


### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#integration-examples)    Integration Examples

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#javascript-node.js)    JavaScript/Node.js

Copy

```
const McpClient = require('@modelcontextprotocol/sdk/client');

const client = new McpClient({
  transport: 'http',
  endpoint: 'https://api.justbeep.it/mcp',
  auth: {
    type: 'bearer',
    token: 'your-access-token',
  },
});

await client.initialize();
const tools = await client.listTools();
```

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#python)    Python

Copy

```
import requests

session = requests.Session()
session.headers.update({
    'Authorization': 'Bearer your-access-token',
    'Content-Type': 'application/json'
})

# Initialize session
response = session.post('https://api.justbeep.it/mcp', json={
    'method': 'initialize',
    'params': {'clientInfo': {'name': 'python-client', 'version': '1.0.0'}}
})

session_id = response.headers.get('mcp-session-id')
session.headers.update({'mcp-session-id': session_id})

# List available tools
tools = session.post('https://api.justbeep.it/mcp', json={
    'method': 'tools/list'
}).json()
```

### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#error-handling)    Error Handling

The server returns standard HTTP status codes:

- **200**: Success

- **401**: Authentication required

- **402**: Payment required (for paid resources)

- **404**: Resource not found

- **500**: Server error


### [Direct link to heading](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-pay\#example-apps)    Example apps

[PreviousAgent to Agent payments (a402)](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402) [NextDeveloper guide a402 <> mcp-cli](https://documentation.justbeep.it/product-overview/agent-to-agent-payments-a402/developer-guide-a402-less-than-greater-than-mcp-cli)

Last updated 1 month ago