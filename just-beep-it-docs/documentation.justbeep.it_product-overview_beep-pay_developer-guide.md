---
url: "https://documentation.justbeep.it/product-overview/beep-pay/developer-guide"
title: "Developer guide | Beep | Agentic Finance Protocol for AI Payments, A2A Commerce, and Yield on SUI"
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

- [Installation](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#installation)
- [Quick Start](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#quick-start)
- [Asset Types](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#asset-types)
- [Props](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#props)
- [Features](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#features)
- [Usage Examples](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#usage-examples)
- [Payment Flow](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#payment-flow)
- [Error Handling](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#error-handling)
- [Sui Payment Integration](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#sui-payment-integration)
- [Development](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#development)
- [Environment Variables](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#environment-variables)
- [TypeScript Support](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide#typescript-support)

GitBook AssistantAsk

1. [Product Overview](https://documentation.justbeep.it/product-overview)
2. [Beep Pay](https://documentation.justbeep.it/product-overview/beep-pay)

# Developer guide

Add one-tap USDC payments to your app, API, or agent with the **Checkout Widget** on the frontend and the **BeepClient** on the backend. Payments settle directly between non-custodial vaults and produce machine-verifiable receipts.

### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#installation)    Installation

Copy

```
npm install @beep-it/checkout-widget @beep-it/sdk-core
```

### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#quick-start)    Quick Start

Copy

```
import React from 'react';
import { CheckoutWidget } from '@beep-it/checkout-widget';

function App() {
  return (
    <CheckoutWidget
      publishableKey="your-publishable-key"
      primaryColor="#007bff"
      labels={{
        scanQr: 'Scan QR Code to Pay',
        paymentLabel: 'My Store Checkout',
      }}
      assets={[\
        {\
          assetId: 'product-uuid-123',\
          quantity: 2,\
          name: 'Premium Coffee',\
          description: 'Fresh roasted arabica beans',\
        },\
      ]}
      serverUrl="https://your-beep-server.com" // optional
    />
  );
}
```

### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#asset-types)    Asset Types

The widget supports two types of assets:

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#id-1.-existing-product-references-beeppurchaseasset)    1\. Existing Product References (`BeepPurchaseAsset`)

Reference pre-created products by their ID:

Copy

```
const assets = [\
  {\
    assetId: 'product-uuid-123',\
    quantity: 1,\
    name: 'Coffee', // optional override\
    description: 'Premium blend', // optional override\
  },\
];
```

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#id-2.-on-the-fly-product-creation-createproductpayload)    2\. On-the-Fly Product Creation (`CreateProductPayload`)

Create products dynamically during checkout. These items are created as products in your merchant account on the server (persisted for audit and reuse). They may be hidden from public listings by default.

Copy

```
const assets = [\
  {\
    name: 'Custom Item',\
    price: '25.50',\
    quantity: 2,\
    description: 'Custom product description',\
  },\
];
```

### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#props)    Props

Prop

Type

Required

Description

`publishableKey`

`string`

✅

BEEP publishable key for browser-safe authentication

`primaryColor`

`string`

❌

Primary color for styling (hex format, e.g., "#007bff")

`labels`

`object`

✅

Customizable text labels

`labels.scanQr`

`string`

✅

Text shown above QR code

`labels.paymentLabel`

`string`

❌

Label displayed in Solana Pay wallets (default: "Beep Checkout")

`assets`

`(BeepPurchaseAsset | CreateProductPayload)[]`

✅

Items to purchase

`serverUrl`

`string`

❌

Custom BEEP server URL (defaults to production)

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#asset-props)    Asset Props

**BeepPurchaseAsset**

Prop

Type

Required

Description

`assetId`

`string`

✅

UUID of existing product

`quantity`

`number`

✅

Number of items

`name`

`string`

❌

Override product name

`description`

`string`

❌

Override product description

**CreateProductPayload**

Prop

Type

Required

Description

`name`

`string`

✅

Product display name

`price`

`string`

✅

Price in decimal format (e.g., "25.50")

`quantity`

`number`

❌

Number of items (default: 1)

`description`

`string`

❌

Product description

### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#features)    Features

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#core-functionality)    Core Functionality

- **Sui Network Integration**: Generates native Sui USDC payment requests

- **Real-time Status Polling**: Verifies payment confirmation directly from the Sui RPC

- **Flexible Asset Support**: Mix existing products with on-the-fly product creation (persisted)

- **Payment Label Support**: Custom labels appear in wallet interfaces

- **Wallet Address Display**: Shows copyable recipient address for desktop users


#### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#user-experience)    User Experience

- **Loading States**: Smooth loading indicators during setup and polling

- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

- **Success Animation**: Clear payment confirmation state

- **Responsive Design**: Works on desktop and mobile devices

- **Customizable Theming**: Primary color theming throughout the widget


#### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#developer-experience)    Developer Experience

- **TypeScript Support**: Full type safety with comprehensive interfaces

- **Zero CSS Dependencies**: Inline styles prevent conflicts with host applications

- **Error Boundaries**: Isolated error handling prevents widget crashes from affecting host app

- **Comprehensive Logging**: Detailed console logging for debugging


### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#usage-examples)    Usage Examples

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#simple-single-product)    Simple Single Product

Copy

```
<CheckoutWidget
  publishableKey="your-publishable-key"
  primaryColor="#10b981"
  labels={{ scanQr: 'Pay with Crypto' }}
  assets={[\
    {\
      assetId: 'coffee-product-uuid',\
      quantity: 1,\
    },\
  ]}
/>
```

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#multiple-products-with-custom-labels)    Multiple Products with Custom Labels

Copy

```
<CheckoutWidget
  publishableKey="your-publishable-key"
  primaryColor="#3b82f6"
  labels={{
    scanQr: 'Scan to complete your order',
    paymentLabel: 'Coffee Shop - Downtown',
  }}
  assets={[\
    {\
      assetId: 'coffee-uuid',\
      quantity: 2,\
      name: 'Espresso',\
    },\
    {\
      assetId: 'pastry-uuid',\
      quantity: 1,\
      name: 'Croissant',\
    },\
  ]}
/>
```

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#dynamic-product-creation)    Dynamic Product Creation

Copy

```
<CheckoutWidget
  publishableKey="your-publishable-key"
  primaryColor="#ef4444"
  labels={{
    scanQr: 'Pay for custom service',
    paymentLabel: 'Consulting Services',
  }}
  assets={[\
    {\
      name: '1-Hour Consultation',\
      price: '150.00',\
      quantity: 1,\
      description: 'Professional consulting session',\
    },\
  ]}
/>
```

#### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#mixed-asset-types)    Mixed Asset Types

Copy

```
<CheckoutWidget
  apiKey="your-api-key"
  primaryColor="#8b5cf6"
  labels={{ scanQr: 'Complete your purchase' }}
  assets={[\
    // Existing product\
    {\
      assetId: 'existing-product-uuid',\
      quantity: 1,\
    },\
    // Dynamic product\
    {\
      name: 'Rush Delivery',\
      price: '15.00',\
      quantity: 1,\
    },\
  ]}
/>
```

### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#payment-flow)    Payment Flow

1. **Initialization Phase**: The widget prepares a signed USDC-on-Sui payment request.

2. **Display Phase**: Shows QR code and total amount to user

3. **Polling Phase**: Automatically checks transaction finality via Sui RPC

4. **Completion**: Displays success state when payment is confirmed on-chain


### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#error-handling)    Error Handling

The widget includes comprehensive error handling:

- **Configuration Errors**: Invalid API keys, missing assets

- **Network Errors**: API connection issues, timeouts

- **Payment Errors**: Failed transactions, expired payments

- **Component Errors**: Isolated error boundaries prevent crashes


### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#sui-payment-integration)    Sui Payment Integration

The widget generates Sui-native Payment URLs with:

- **Recipient**: Developer's Sui wallet address

- **Amount**: Total calculated from all assets in USDC

- **SPL Token**: Token address for payment

- **Reference**: Unique tracking identifier

- **Label**: Custom payment label for wallet display

- **Message**: Descriptive payment message


### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#development)    Development

Copy

```
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm build

# Run tests in watch mode
pnpm test:watch

# Run development showcase
pnpm dev
```

### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#environment-variables)    Environment Variables

The widget respects these environment variables:

- `REACT_APP_BEEP_SERVER_URL`: Default server URL if not provided via props


### [Direct link to heading](https://documentation.justbeep.it/product-overview/beep-pay/developer-guide\#typescript-support)    TypeScript Support

Full TypeScript support with exported interfaces:

Copy

```
import { CheckoutWidget, MerchantWidgetProps, MerchantWidgetState } from '@beep-it/checkout-widget';

import { BeepPurchaseAsset, CreateProductPayload } from '@beep-it/sdk-core';
```

[PreviousBeep Pay](https://documentation.justbeep.it/product-overview/beep-pay) [Nextzero fee settlement flow](https://documentation.justbeep.it/product-overview/beep-pay/zero-fee-settlement-flow)

Last updated 1 month ago