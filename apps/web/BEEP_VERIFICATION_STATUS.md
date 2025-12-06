# Beep Verification Status & Implementation Plan

## Current Situation

### What We Have Now

The a402 Playground currently supports two payment modes:

1. **Demo/Learning Mode** - Simulated payments for testing the UI flow
2. **Beep Live Mode** - Real USDC transfers on Sui mainnet via connected wallet

### Payment Flow Comparison

| Aspect | Demo Mode | Beep Live (Current) | Beep Live (Target) |
|--------|-----------|---------------------|-------------------|
| Payment Method | Simulated | Direct wallet transfer | Beep CheckoutWidget |
| Transaction | Fake | Real on-chain | Real on-chain |
| Receipt Signature | `0xDEMO_...` | `sui_tx_...` | Ed25519 (Beep facilitator) |
| Verification | Auto-pass | Local field validation | Beep API cryptographic |
| Uses Beep API | No | No | Yes |

### Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Beep Live Mode (Current)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Pay"                                           │
│           ↓                                                      │
│  2. BeepCheckout component builds USDC transfer transaction     │
│           ↓                                                      │
│  3. User signs with connected wallet (Sui Wallet, etc.)         │
│           ↓                                                      │
│  4. Transaction executed on Sui mainnet                         │
│           ↓                                                      │
│  5. Receipt generated locally with "sui_tx_" signature          │
│           ↓                                                      │
│  6. Verification via /a402/verify-onchain (local API)           │
│           ↓                                                      │
│  7. Field validation only (amount, chain, nonce, recipient)     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### What's Missing for Real Beep Verification

#### 1. Beep Payment Session Integration

Currently, we bypass Beep's payment infrastructure entirely. We need to:

- Create a payment session via `BeepPublicClient.widget.createPaymentSession()`
- Get a `referenceKey` that Beep tracks
- Use Beep's payment URL/QR code for the actual payment

#### 2. Facilitator Signature

Beep's a402 protocol requires the **facilitator** (Beep) to sign receipts. This provides:

- **Non-repudiation**: Proof that Beep verified the payment
- **Cryptographic verification**: Anyone can verify using Beep's public key
- **Replay protection**: Nonces are tracked server-side

Current receipts have fake signatures like `sui_tx_4kQ6cnUi4MbL7cdx` which cannot be cryptographically verified.

#### 3. Beep API Verification

The real verification flow should call Beep's `/a402/verify` endpoint which:

- Verifies the facilitator signature
- Checks the nonce hasn't been used (replay protection)
- Confirms transaction exists on-chain
- Returns a cryptographically valid response

### CORS Issue

Direct browser calls to `api.justbeep.it` fail due to CORS. We solved this with proxy endpoints:

| Frontend Call | Proxy Endpoint | Target |
|---------------|----------------|--------|
| `/a402/verify-onchain` | Local validation | N/A |
| `/a402/verify-beep` | `api.justbeep.it/a402/verify` | Beep API |

---

## Implementation Plan

### Option A: Full Beep CheckoutWidget Integration

Use Beep's official CheckoutWidget which handles the entire payment flow internally.

**Pros:**
- Official SDK, maintained by Beep
- Handles wallet connections, QR codes, polling
- Returns proper facilitator-signed receipts

**Cons:**
- Widget doesn't expose callbacks for payment completion (current limitation)
- QR-based flow (mobile wallet scanning), not direct desktop wallet

**Steps:**
1. Wait for Beep to add `onPaymentComplete` callback to CheckoutWidget
2. Or use DOM observation to detect widget's success state
3. Retrieve receipt from Beep API using `referenceKey`

### Option B: Beep SDK Direct Integration (Recommended)

Use `BeepPublicClient` from `@beep-it/sdk-core` to create sessions and handle payments programmatically.

**Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Beep Live Mode (Target)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Pay"                                           │
│           ↓                                                      │
│  2. Call BeepPublicClient.widget.createPaymentSession()         │
│           ↓                                                      │
│  3. Get referenceKey + paymentUrl from Beep                     │
│           ↓                                                      │
│  4. Execute payment transaction (include referenceKey metadata) │
│           ↓                                                      │
│  5. Poll BeepPublicClient.widget.waitForPaid(referenceKey)      │
│           ↓                                                      │
│  6. Beep detects payment, generates facilitator-signed receipt  │
│           ↓                                                      │
│  7. Retrieve receipt from Beep API                              │
│           ↓                                                      │
│  8. Verify via /a402/verify-beep → api.justbeep.it/a402/verify  │
│           ↓                                                      │
│  9. Cryptographic signature verification ✓                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Requirement:**
The payment transaction must include Beep's `referenceKey` as metadata so Beep can correlate the on-chain transaction with the payment session.

Looking at previous successful Beep transactions, they include:
```json
{
  "MoveCall": {
    "package": "0x9ed50429ae12b4207c648d1f2f7d36b849d3a0227d8df6f45b5494c5f0a56e37",
    "module": "metadata",
    "function": "emit_metadata",
    "arguments": ["trx_refr", "<referenceKey>"]
  }
}
```

This `emit_metadata` call embeds the `referenceKey` in the transaction events, allowing Beep to match payments.

### Option C: Hybrid Approach

Combine direct wallet payments with Beep session tracking:

1. Create Beep payment session → get `referenceKey`
2. Build transaction with Beep's metadata contract call
3. Execute via connected wallet
4. Poll Beep for payment confirmation
5. Get facilitator-signed receipt

---

## Implementation Steps (Option B/C)

### Step 1: Update BeepCheckout Component

```typescript
// beep-checkout.tsx

import { BeepPublicClient } from "@beep-it/sdk-core";

// 1. Create payment session
const session = await beepClient.widget.createPaymentSession({
  assets: [{ name: "Payment", price: amount, quantity: 1 }],
  paymentLabel: description,
});

// 2. Build transaction WITH metadata
const tx = new Transaction();

// Add Beep metadata call (so Beep can track the payment)
tx.moveCall({
  target: "0x9ed50429ae12b4207c648d1f2f7d36b849d3a0227d8df6f45b5494c5f0a56e37::metadata::emit_metadata",
  arguments: [
    tx.pure.vector("u8", new TextEncoder().encode("trx_refr")),
    tx.pure.vector("u8", new TextEncoder().encode(session.referenceKey)),
  ],
});

// Add USDC transfer
const [coin] = tx.splitCoins(tx.object(usdcCoin), [amount]);
tx.transferObjects([coin], recipient);

// 3. Execute transaction
const result = await signAndExecute({ transaction: tx });

// 4. Poll for Beep confirmation
const { paid } = await beepClient.widget.waitForPaid({
  referenceKey: session.referenceKey,
  intervalMs: 2000,
  timeoutMs: 300000,
});

// 5. Get facilitator-signed receipt from Beep
// (May need additional API call to retrieve full receipt)
```

### Step 2: Update Verification Flow

Once we have facilitator-signed receipts, verification becomes:

```typescript
// signature-verification.ts

// Receipt will have real Ed25519 signature from Beep
// No longer starts with "sui_tx_"

const apiResult = await verifyReceiptViaBeepAPI(receipt);
// This calls /a402/verify-beep → api.justbeep.it/a402/verify
// Beep verifies cryptographic signature
```

### Step 3: Handle CORS (Already Done)

The proxy endpoints are already in place:
- `/a402/verify-beep` proxies to Beep's API
- No additional CORS work needed

---

## Questions to Resolve with Beep

1. **Receipt Retrieval**: After `waitForPaid` returns `true`, how do we get the full facilitator-signed receipt?
   - Is there a `getReceipt(referenceKey)` API?
   - Does `waitForPaid` return the receipt directly?

2. **Metadata Contract**: Is `0x9ed50429ae12b4207c648d1f2f7d36b849d3a0227d8df6f45b5494c5f0a56e37::metadata::emit_metadata` the correct package for mainnet?

3. **Direct Wallet Support**: Does Beep support direct wallet payments (not QR scanning)?
   - Or is the expected flow: create session → show QR → user scans with mobile wallet?

4. **Webhook vs Polling**: Is there a webhook option instead of polling `waitForPaid`?

---

## Files to Modify

| File | Changes Needed |
|------|----------------|
| `apps/web/src/components/beep/beep-checkout.tsx` | Add Beep session creation, metadata call, polling |
| `apps/web/src/lib/signature-verification.ts` | Update to handle real Beep signatures |
| `apps/api/src/routes/a402.ts` | Already has proxy endpoints |

---

## Testing Checklist

- [ ] Create Beep payment session successfully
- [ ] Transaction includes `emit_metadata` call with referenceKey
- [ ] Beep detects payment via polling
- [ ] Receipt has real Ed25519 signature (not `sui_tx_...`)
- [ ] Verification passes via Beep API
- [ ] CORS proxy works correctly

---

## Current Workaround

Until full Beep integration is implemented, the current flow:
- ✅ Real USDC transfers on Sui mainnet
- ✅ Transaction verified on-chain
- ✅ Receipt fields validated (amount, chain, nonce, recipient)
- ❌ No facilitator signature from Beep
- ❌ Not using Beep's payment tracking infrastructure

This is sufficient for demonstrating the **a402 protocol concept** but not for production use where cryptographic verification is required.
