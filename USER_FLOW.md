# a402 Playground — User Flow

> A step-by-step walkthrough of how developers interact with the a402 Playground & Inspector

---

## User Journey Overview

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   1. Land    │───▶│  2. Connect  │───▶│  3. Learn    │───▶│  4. Test     │
│   on Site    │    │    Wallet    │    │   (Demo)     │    │   (Real API) │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                    │
                    ┌──────────────┐    ┌──────────────┐            │
                    │  6. Export   │◀───│  5. Verify   │◀───────────┘
                    │    Code      │    │   Receipt    │
                    └──────────────┘    └──────────────┘
```

---

## Detailed User Flow

### 1. Developer Lands on Website

- Developer opens `http://localhost:3000`
- Sees the a402 Playground interface
- Three mode tabs visible: **Demo** | **Test Endpoint** | **Inspector**
- Default view: Demo Mode is active

---

### 2. Connect Sui Wallet

- Developer clicks **"Connect Wallet"** button (top-right)
- Wallet selection modal appears (Sui Wallet, Suiet, etc.)
- Developer selects their wallet and approves connection
- Wallet address displays: `0x1a2b...c3d4`
- Network indicator shows: `Testnet` or `Mainnet`

> ⚠️ **Currently Not Implemented** — Wallet connection UI exists but not functional

---

### 3. Learn the Flow (Demo Mode)

**3.1** Developer selects a preset scenario from the left panel:
- ✅ Valid Payment
- ❌ Expired Nonce
- ❌ Wrong Amount
- ❌ Invalid Signature
- ❌ Chain Mismatch

**3.2** Developer clicks **"Load Challenge"**:
- Challenge JSON appears in the center panel
- Schema validation runs automatically
- Green checkmarks show valid fields
- Warnings show for any spec deviations

**3.3** Developer clicks **"Simulate Payment"**:
- Loading spinner shows (1.5s delay)
- Receipt appears in Receipt tab
- Receipt is validated against schema

**3.4** Developer clicks **"Verify Receipt"**:
- Verification checks run:
  - ✓ Amount matches challenge
  - ✓ Chain matches challenge
  - ✓ Nonce is valid
  - ✓ Recipient matches
  - ✓ Signature is valid
  - ✓ Not expired
- Overall result: PASS or FAIL

**3.5** Developer views **"Sui Transaction"** tab:
- Transaction hash displayed
- Link to Sui Explorer
- Gas used, timestamp, sender info

**3.6** Developer repeats with different presets to understand failure cases

---

### 4. Test Real API (Test Endpoint Mode)

**4.1** Developer switches to **Test Endpoint** tab

**4.2** Developer enters their API endpoint:
```
URL: https://my-api.com/protected-resource
Method: GET
Headers: Authorization: Bearer xxx
```

**4.3** Developer clicks **"Send Request"**

**4.4** API returns `402 Payment Required`:
- Response status: `402`
- Challenge JSON displayed
- Schema validation runs
- Developer sees if their challenge matches a402 spec

**4.5** Developer clicks **"Pay with Beep"**:
- Wallet confirmation modal appears
- Developer approves USDC transfer
- Receipt is returned from Beep facilitator

> ⚠️ **Currently Not Implemented** — Real HTTP requests blocked by CORS, real Beep payments not integrated

**4.6** Developer clicks **"Retry with Receipt"**:
- Original request is resent with `X-RECEIPT` header
- API returns `200 OK` with protected content
- Success! Payment flow validated.

---

### 5. Inspect Any Challenge/Receipt (Inspector Mode)

**5.1** Developer switches to **Inspector** tab

**5.2** Developer pastes a challenge JSON:
```json
{
  "amount": "1.00",
  "asset": "USDC",
  "chain": "sui-mainnet",
  "recipient": "0x...",
  "nonce": "abc123",
  "expiry": 1733520000
}
```

**5.3** Schema validation runs instantly:
- Required fields checked
- Format warnings shown
- Expiry status checked (expired/valid)

**5.4** Developer pastes a receipt JSON:
```json
{
  "id": "rcpt_xxx",
  "payer": "0x...",
  "merchant": "0x...",
  "amount": "1.00",
  ...
}
```

**5.5** Cross-validation runs:
- Amount match? ✓
- Recipient match? ✓
- Chain match? ✓
- Nonce match? ✓

**5.6** Developer identifies issues in their implementation

---

### 6. Export Integration Code

**6.1** Developer clicks **"Code Export"** panel

**6.2** Developer selects export format:
- **cURL** — Copy command to test from terminal
- **TypeScript** — Copy fetch code for Node.js/browser
- **Python** — Copy requests code for Python apps

**6.3** Generated code includes:
- Proper URL and method
- Required headers (`X-RECEIPT`)
- Base64-encoded receipt
- Error handling

**6.4** Developer copies code and integrates into their app

---

### 7. View Request History

**7.1** Developer clicks **"History"** panel

**7.2** Sees list of recent operations:
```
[12:30:45] GET /api/premium → 402 Payment Required
[12:30:52] Payment via Beep → Receipt rcpt_xxx
[12:30:55] GET /api/premium → 200 OK
```

**7.3** Developer clicks any entry to reload that state

**7.4** Useful for debugging and replaying flows

---

## Complete User Scenarios

### Scenario A: New Developer Learning a402

```
1. Land on site
2. Select "Demo Mode"
3. Try "Valid Payment" preset
4. Observe the complete flow
5. Try "Wrong Amount" preset
6. See why verification fails
7. Export TypeScript code
8. Integrate into their app
```

### Scenario B: Developer Testing Their API

```
1. Land on site
2. Connect Sui Wallet
3. Switch to "Test Endpoint" mode
4. Enter their API URL
5. Send request, receive 402
6. Pay with connected wallet
7. Retry with receipt
8. Confirm 200 response
9. Export code for production
```

### Scenario C: Developer Debugging a Receipt

```
1. Land on site
2. Switch to "Inspector" mode
3. Paste challenge from their logs
4. Paste receipt from their logs
5. See validation errors
6. Fix their code based on feedback
7. Test again until passing
```

---

## Error States the User Might Encounter

| Error | Cause | User Action |
|-------|-------|-------------|
| "Wallet not connected" | Tried to pay without wallet | Connect wallet first |
| "Network mismatch" | Wallet on mainnet, app on testnet | Switch wallet network |
| "Insufficient balance" | Not enough USDC | Add testnet USDC |
| "Challenge expired" | Took too long to pay | Request new challenge |
| "Nonce already used" | Replay attack detected | Request new challenge |
| "CORS blocked" | Direct API call from browser | Use backend proxy |
| "Invalid signature" | Receipt tampered or wrong key | Contact API provider |

---

## What Developers Walk Away With

1. **Understanding** — How a402 payment flow works end-to-end
2. **Validated API** — Confidence their 402 responses are spec-compliant
3. **Working Code** — Copy-paste snippets for their integration
4. **Debug Skills** — Know how to diagnose payment failures
5. **Test Receipts** — Mock receipts for their test suites
