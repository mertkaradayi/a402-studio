# a402 Studio - Mode Status Tracker

## Overview

a402 Studio has **three main modes**, each serving a different purpose in the developer journey.

| Mode | Purpose | Status |
|------|---------|--------|
| 📚 **Learn (Demo)** | Interactive tutorial with mock/real payments | 🟡 Partial |
| 🧪 **Test** | Validate your API endpoints | 🟢 Working |
| 🔍 **Debug (Inspector)** | Analyze and verify any a402 data | 🟢 Working |

---

## Mode Documentation

- [📚 Learn Mode Spec](./MODE_LEARN.md) - Demo, Beep Live, SDK sub-modes
- [🧪 Test Mode Spec](./MODE_TEST.md) - API endpoint testing
- [🔍 Debug Mode Spec](./MODE_DEBUG.md) - Inspector and verification

---

## Current Implementation Status

### 📚 Learn Mode (Demo)

Located in: `apps/web/src/components/modes/demo-mode.tsx`

#### Learning Sub-Mode
- [x] Load preset scenarios
- [x] Display challenge in panel
- [x] Simulate payment with mock receipt
- [x] Sign with wallet (demo transaction)
- [x] Pay with Beep SDK (mock flow)
- [x] Code export panel
- [ ] Educational tooltips/annotations
- [ ] Step-by-step guided tour
- [ ] Animated flow visualization

#### Beep Live Sub-Mode
- [x] Open Beep Checkout Widget
- [x] Real USDC transfer on Sui
- [x] Generate receipt after payment
- [ ] Verify receipt via Beep's /a402/verify
- [ ] Show verification status

#### SDK Sub-Mode
- [x] Create Beep payment session
- [x] Get referenceKey from Beep
- [x] Poll for payment with waitForPaid()
- [x] Pay with connected wallet
- [x] Create receipt after payment
- [x] Verify via server-side Beep API
- [ ] Show facilitator signature verification
- [ ] Display complete Beep API response

---

### 🧪 Test Mode (Test Endpoint)

Located in: `apps/web/src/components/modes/test-endpoint-mode.tsx`

- [x] Enter custom API endpoint URL
- [x] Make request and display response
- [x] Parse 402 challenge from response
- [x] Validate challenge schema
- [x] Display validation results
- [ ] Test multiple endpoints in sequence
- [ ] Save endpoint configurations
- [ ] Compare challenge against expected format

---

### 🔍 Debug Mode (Inspector)

Located in: `apps/web/src/components/modes/inspector-mode.tsx`

#### Challenge Tab
- [x] Paste challenge JSON
- [x] Parse and validate schema
- [x] Display decoded fields
- [x] Show validation score
- [ ] Suggest fixes for invalid challenges

#### Receipt Tab
- [x] Paste receipt JSON
- [x] Normalize snake_case/camelCase
- [x] Validate schema
- [x] Display decoded fields
- [x] Verify with Beep API button
- [x] Show verification result
- [x] Display API response details
- [ ] Verify on-chain transaction exists
- [ ] Link to block explorer

#### Verify Match Tab
- [x] Paste both challenge and receipt
- [x] Compare fields (amount, nonce, chain)
- [x] Display match/mismatch
- [ ] Call Beep API verification
- [ ] Show cryptographic signature validation

---

## Backend Status

Located in: `apps/api/src/routes/a402.ts`

### Endpoints
- [x] POST `/a402/challenge` - Generate challenge
- [x] POST `/a402/verify` - Basic verification
- [x] GET `/a402/receipt/:id` - Mock receipt lookup
- [x] POST `/a402/simulate-payment` - Simulate payment
- [x] POST `/a402/verify-beep` - Verify via Beep API
- [x] POST `/a402/verify-onchain` - On-chain validation

### Beep API Integration
- [x] Try POST /a402/verify endpoint
- [x] Fallback to GET /a402/status/:referenceKey
- [x] Fallback to invoice list search
- [x] Support both secret and publishable keys
- [ ] Confirmed authentication method works
- [ ] Tested with real Beep production API

---

## Priority Action Items

### High Priority (Must Have)
1. [ ] Verify Beep API actually returns valid responses
2. [ ] Test full SDK flow with real payment
3. [ ] Confirm verification chain works end-to-end

### Medium Priority (Should Have)
4. [ ] Add educational content to Learn mode
5. [ ] Add on-chain verification in Inspector
6. [ ] Test multiple endpoint configurations

### Low Priority (Nice to Have)
7. [ ] Animated flow visualization
8. [ ] Step-by-step guided tour
9. [ ] Compare challenges across endpoints

---

## File Structure

```
apps/web/src/components/
├── modes/
│   ├── demo-mode.tsx          # 📚 Learn Mode
│   ├── test-endpoint-mode.tsx # 🧪 Test Mode
│   └── inspector-mode.tsx     # 🔍 Debug Mode
├── beep/
│   ├── beep-checkout.tsx      # Beep Checkout Widget
│   └── sdk-integration-panel.tsx # SDK Sub-Mode
├── panels/
│   ├── center-panel.tsx       # Challenge/Receipt/Verify tabs
│   ├── code-export-panel.tsx  # Code snippets
│   └── ...
└── shared/
    ├── schema-validation-display.tsx
    └── verification-display.tsx

apps/api/src/
└── routes/
    └── a402.ts                # All API endpoints
```

---

## Testing Checklist

Before marking a feature as complete:

1. [ ] Works in demo/mock mode
2. [ ] Works with real Beep API
3. [ ] Error states handled gracefully
4. [ ] Debug logs appear correctly
5. [ ] UI updates reflect state changes
