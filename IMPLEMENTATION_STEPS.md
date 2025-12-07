# a402 Studio - Implementation Plan

## Overview

Complete the a402 Studio in 6 focused steps. Each step is self-contained and can be verified before moving to the next.

---

## Step 1: Fix Beep Live Mode Verification

**Status:** ✅ Complete

**Goal:** After a real Beep payment, verify the receipt via Beep API and show result.

**Files modified:**
- `apps/web/src/components/modes/demo-mode.tsx`

**Changes made:**
1. ✅ Added import for `verifyReceiptViaBeepServerAPI`
2. ✅ Added `beepLiveVerification` state
3. ✅ Reset verification on new payment
4. ✅ Made `handleRealBeepPaymentComplete` async with verification
5. ✅ Added verification status UI component

**Acceptance Criteria:**
- [x] Pay with Beep Live mode
- [x] Receipt appears in panel
- [x] "Verifying with Beep API..." shows briefly
- [x] Verification result shows (green ✅ or red ❌)
- [x] Method shows (beep-api, beep-invoice-match, etc.)
- [x] Debug logs show verification process
- [x] TypeScript compiles without errors

---

## Step 2: Add On-Chain Transaction Verification

**Status:** ⬜ Not Started

**Goal:** Verify that the transaction actually exists on Sui blockchain.

**Files to modify:**
- `apps/api/src/routes/a402.ts`
- `apps/web/src/components/modes/inspector-mode.tsx`

**Changes:**
1. Add Sui RPC call in `/a402/verify-onchain` to check tx exists
2. Add "Verify On-Chain" button in Inspector receipt tab
3. Show tx details from blockchain (sender, recipient, amount)
4. Add link to Suiscan/SuiVision block explorer

**Acceptance Criteria:**
- [ ] Backend fetches tx from Sui RPC
- [ ] Inspector shows "Verify On-Chain" button
- [ ] Real tx returns block confirmation
- [ ] Fake tx shows "Transaction not found"
- [ ] Link to explorer works

---

## Step 3: Improve Test Endpoint Mode

**Status:** ⬜ Not Started

**Goal:** Make Test mode more useful for developers testing their APIs.

**Files to modify:**
- `apps/web/src/components/modes/test-endpoint-mode.tsx`

**Changes:**
1. Show raw HTTP response (headers + body)
2. Add preset example endpoints (our own /a402/challenge)
3. Better error messages for common issues
4. Add "Copy as cURL" button
5. Remember last tested URL in localStorage

**Acceptance Criteria:**
- [ ] Can see full HTTP response
- [ ] Preset endpoints work
- [ ] Last URL remembered after refresh
- [ ] Copy as cURL works

---

## Step 4: Add Educational Content to Learn Mode

**Status:** ⬜ Not Started

**Goal:** Add tooltips and explanations that teach users about a402.

**Files to modify:**
- `apps/web/src/components/panels/center-panel.tsx`
- `apps/web/src/components/modes/demo-mode.tsx`

**Changes:**
1. Add info icons (ℹ️) next to each field in challenge/receipt panels
2. Create tooltip component with explanations
3. Add "What is this?" expandable sections
4. Add brief explanation of each preset scenario

**Tooltip Content:**
- `amount` - "The payment amount in the smallest unit"
- `nonce` - "Unique identifier preventing replay attacks"
- `recipient` - "The merchant's wallet receiving payment"
- `signature` - "Cryptographic proof from the facilitator"

**Acceptance Criteria:**
- [ ] Info icons appear next to fields
- [ ] Hovering shows explanation
- [ ] Explanations are accurate and helpful
- [ ] Presets have descriptions

---

## Step 5: Polish Inspector Mode

**Status:** ⬜ Not Started

**Goal:** Make Inspector the most powerful debugging tool.

**Files to modify:**
- `apps/web/src/components/modes/inspector-mode.tsx`

**Changes:**
1. Add "Clear" button for each input
2. Add "Paste from Clipboard" button
3. Add "Copy Result" button for verification output
4. Add Beep API verification to "Verify Match" tab
5. Color-code fields: green=valid, red=invalid, yellow=warning
6. Show transaction timestamp in human-readable format

**Acceptance Criteria:**
- [ ] Clear/Paste/Copy buttons work
- [ ] Verify Match calls Beep API
- [ ] Fields are color-coded
- [ ] Timestamps readable

---

## Step 6: Final Polish & Testing

**Status:** ⬜ Not Started

**Goal:** End-to-end testing and final UI polish.

**Tasks:**
1. Test full flow: Demo → Pay → Verify in all modes
2. Verify Beep API works with real payment
3. Check mobile responsiveness
4. Fix any remaining TypeScript errors
5. Update README with final features
6. Clean up debug console.log statements

**Testing Checklist:**
- [ ] Learning mode: Load → Simulate → Verify
- [ ] Beep Live: Pay real USDC → Receipt → Verify
- [ ] SDK mode: Session → Pay → Verify
- [ ] Test mode: Test our API → Valid result
- [ ] Inspector: Paste receipt → Verify with Beep → On-chain
- [ ] All modes work on mobile

---

## Quick Reference

| Step | Focus | Estimated Time |
|------|-------|---------------|
| 1 | Beep Live Verification | 15 min |
| 2 | On-Chain Verification | 30 min |
| 3 | Test Endpoint Improvements | 20 min |
| 4 | Educational Content | 30 min |
| 5 | Inspector Polish | 25 min |
| 6 | Final Testing | 30 min |

**Total:** ~2.5 hours

---

## How to Use This Plan

Tell me: **"Implement Step X"** and I will:
1. Make all the code changes
2. Run TypeScript check
3. Summarize what was done
4. Mark the step complete

After each step, you can test the changes before moving to the next.
