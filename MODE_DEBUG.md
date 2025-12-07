# 🔍 Debug Mode (Inspector)

## Purpose

Decode, validate, and verify any a402 data - challenges, receipts, and their match.

> "X-ray vision for a402 - see what's inside and verify it's real."

---

## Use Cases

1. **Decode Receipts** - Understand what a receipt contains
2. **Validate Format** - Check schema compliance
3. **Verify with Beep** - Confirm payment via Beep API
4. **Debug Mismatches** - Find why receipt doesn't match challenge

---

## Tabs

### 1. Challenge Tab

**Purpose:** Inspect and validate 402 challenges

**Flow:**
```
1. Paste challenge JSON
2. Click "Inspect Challenge"
3. Schema validation runs
4. Decoded fields displayed
```

**Features:**
| Feature | Status | Description |
|---------|--------|-------------|
| Paste JSON input | ✅ Done | Textarea with placeholder |
| Parse JSON | ✅ Done | With error handling |
| Validate schema | ✅ Done | Required field checks |
| Show validation score | ✅ Done | 0-100% |
| Display decoded fields | ✅ Done | Table format |
| Suggest fixes | ❌ Missing | Auto-correct hints |

---

### 2. Receipt Tab

**Purpose:** Decode receipts and verify via Beep API

**Flow:**
```
1. Paste receipt JSON
2. Click "Inspect Receipt"
3. Schema validation runs
4. Click "Verify with Beep API"
5. Server calls Beep's /a402/verify
6. Result displayed with details
```

**Features:**
| Feature | Status | Description |
|---------|--------|-------------|
| Paste JSON input | ✅ Done | Textarea |
| Parse JSON | ✅ Done | Handles snake_case/camelCase |
| Normalize fields | ✅ Done | Convert to standard format |
| Validate schema | ✅ Done | Check required fields |
| Display decoded fields | ✅ Done | Table with highlights |
| Verify with Beep API | ✅ Done | Button after inspect |
| Show verification result | ✅ Done | Pass/Fail with method |
| Show API response | ✅ Done | Expandable details |
| Verify on-chain | ❌ Missing | Check tx exists |
| Link to explorer | ❌ Missing | View tx on Suiscan |

---

### 3. Verify Match Tab

**Purpose:** Check if receipt fulfills challenge

**Flow:**
```
1. Paste challenge JSON
2. Paste receipt JSON  
3. Click "Verify Match"
4. Field-by-field comparison runs
5. Results show matches/mismatches
```

**Features:**
| Feature | Status | Description |
|---------|--------|-------------|
| Two JSON inputs | ✅ Done | Challenge + Receipt |
| Parse both | ✅ Done | With normalization |
| Compare fields | ✅ Done | amount, nonce, chain, recipient |
| Show match/mismatch | ✅ Done | Green/Red indicators |
| List errors | ✅ Done | What doesn't match |
| API verification | ❌ Missing | Call Beep to verify |
| Signature check | ❌ Missing | Cryptographic validation |

---

## Beep API Verification Flow

When "Verify with Beep API" is clicked:

```
Frontend                    Backend                         Beep
   |                           |                              |
   |-- POST /a402/verify-beep--|                              |
   |   { receipt, challenge }  |                              |
   |                           |-- POST /a402/verify -------->|
   |                           |   { receipt fields }         |
   |                           |                              |
   |                           |<-- { valid: true/false } ----|
   |                           |                              |
   |                           |-- (fallback) GET /a402/status -->
   |                           |                              |
   |                           |-- (fallback) GET /v1/invoices -->
   |                           |                              |
   |<-- { valid, method } -----|                              |
```

**Verification Methods:**
- `beep-a402-verify` - Direct /a402/verify call succeeded
- `beep-a402-status` - Status endpoint confirmed paid
- `beep-invoice-match` - Found matching paid invoice
- `onchain-verified` - Fallback on-chain validation

---

## Implementation

**File:** `apps/web/src/components/modes/inspector-mode.tsx`

**Key Functions:**
- `handleInspectChallenge()` - Parse and validate challenge
- `handleInspectReceipt()` - Parse and validate receipt
- `handleVerify()` - Compare challenge and receipt
- `handleVerifyWithBeepAPI()` - Call server-side Beep verification

**Backend:** `apps/api/src/routes/a402.ts`
- `POST /a402/verify-beep` - Proxy to Beep API with fallbacks

---

## Example: Verifying a Receipt

### Input (Receipt JSON):
```json
{
  "id": "rcpt_1733570123456",
  "request_nonce": "ref_abc123",
  "payer": "0xPAYER...",
  "merchant": "0xMERCHANT...",
  "amount": "0.01",
  "asset": "USDC",
  "chain": "sui-mainnet",
  "tx_hash": "4kQ6cnUi4MbL7cdx...",
  "signature": "beep_sdk_ref_abc123_4kQ6cnUi"
}
```

### Output (After Beep API Verification):
```
✅ Verified via Beep API

Method: beep-a402-status
Details:
  • paid: true
  • referenceKey: ref_abc123
  • endpoint: /a402/status
  • verifiedAt: 2024-12-07T06:30:00Z
```

---

## TODO

### Core Improvements
- [ ] On-chain verification (check tx exists on Sui)
- [ ] Link to Suiscan/SuiVision for tx
- [ ] Show facilitator public key for signature verification

### UX Improvements
- [ ] Paste from clipboard button
- [ ] Clear/Reset buttons
- [ ] Copy result to clipboard
- [ ] Share verification result link

### Advanced Features
- [ ] Batch verify multiple receipts
- [ ] Export verification report
- [ ] Historical verification log
