# a402 Playground & Inspector

A web-based developer tool for testing and debugging the **a402 protocol** (HTTP 402 Payment Required) with **Beep** payments on the **Sui blockchain**.

![Next.js](https://img.shields.io/badge/Next.js-15.x-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Sui](https://img.shields.io/badge/Sui-Blockchain-4DA2FF)

## What is a402?

**a402** is a protocol that uses HTTP status code 402 (Payment Required) to enable machine-to-machine payments. The flow works as follows:

1. **Client** requests a protected resource
2. **Server** returns a `402 Payment Required` with a payment challenge
3. **Client** pays via Beep (USDC on Sui) and receives a receipt
4. **Client** retries the request with the receipt in the `X-RECEIPT` header
5. **Server** verifies the receipt and returns the protected content

## Features

### 🎮 Demo Mode
Learn how the a402 flow works with preset scenarios:
- Valid Payment
- Expired Nonce
- Wrong Amount
- Invalid Signature
- Chain Mismatch

### 🔌 Test Endpoint Mode
Test your real API endpoints that return 402 challenges and validate responses.

### 🔍 Inspector Mode
Paste any challenge/receipt JSON to decode, validate against the a402 spec, and verify signatures.

### 📤 Code Export
Export ready-to-use code snippets in cURL, TypeScript, and Python.

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.x

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sui-hack-2

# Install dependencies
yarn install
```

### Development

```bash
# Run both frontend and backend
yarn dev

# Or run individually
yarn dev:web   # Frontend at http://localhost:3000
yarn dev:api   # Backend at http://localhost:3001
```

### Build

```bash
yarn build
```

## Project Structure

```
├── apps/
│   ├── web/              # Next.js frontend
│   │   └── src/
│   │       ├── app/              # App router pages
│   │       ├── components/       # React components
│   │       │   ├── modes/        # Demo, Test, Inspector modes
│   │       │   ├── panels/       # UI panels and tabs
│   │       │   └── shared/       # Reusable components
│   │       ├── lib/              # Utilities and validators
│   │       └── stores/           # Zustand state management
│   └── api/              # Express backend
│       └── src/
│           └── index.ts          # API endpoints
├── packages/
│   └── shared/           # Shared TypeScript types
├── package.json          # Root workspace config
└── turbo.json            # Turborepo config
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Zustand** | State management |
| **Express** | Backend API |
| **Turborepo** | Monorepo build system |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/a402/challenge` | POST | Generate a 402 challenge |
| `/a402/verify` | POST | Verify a payment receipt |
| `/a402/receipt/:id` | GET | Lookup a receipt by ID |
| `/a402/simulate-payment` | POST | Simulate a payment (mock) |

## a402 Data Structures

### Challenge (402 Response)

```json
{
  "amount": "0.50",
  "asset": "USDC",
  "chain": "sui-testnet",
  "recipient": "0x1234...",
  "nonce": "unique_nonce_123",
  "expiry": 1699999999
}
```

### Receipt (After Payment)

```json
{
  "id": "rcpt_abc123",
  "requestNonce": "unique_nonce_123",
  "payer": "0xuser...",
  "merchant": "0x1234...",
  "amount": "0.50",
  "asset": "USDC",
  "chain": "sui-testnet",
  "txHash": "0xtx...",
  "signature": "0xsig...",
  "issuedAt": 1699999000
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start all apps in development mode |
| `yarn build` | Build all apps |
| `yarn lint` | Lint all apps |
| `yarn clean` | Clean build artifacts and node_modules |
| `yarn typecheck` | Run TypeScript type checking |

## Resources

- [a402 Protocol](https://github.com/anthropics/a402)
- [Beep Protocol](https://docs.beep.it)
- [Sui Documentation](https://docs.sui.io)

## License

Private project - All rights reserved.
