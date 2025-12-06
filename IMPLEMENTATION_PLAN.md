# a402 Playground — Implementation Plan

> **How We'll Work**: I'll implement each step one at a time. You test it manually, confirm it works, then we move to the next step.

---

## Step 1: Sui Wallet Integration

- [x] Install `@mysten/dapp-kit`, `@mysten/sui`, and `@tanstack/react-query`
- [x] Create providers wrapper component (client-side only)
- [x] Update `layout.tsx` to wrap app with providers
- [x] Import dapp-kit CSS for styling
- [x] Create `WalletButton` component with connect/disconnect
- [x] Add wallet button to header in `flow-playground.tsx`
- [x] Display connected address and network indicator

**What You'll Test:**
1. Open the app at `http://localhost:3000`
2. Click "Connect Wallet" button
3. Select a Sui wallet (Sui Wallet, Suiet, etc.)
4. Verify address displays after connection
5. Click disconnect and verify it disconnects

---

## Step 2: Sui RPC Integration (Transaction Lookup)

- [ ] Create `sui-client.ts` utility with transaction lookup
- [ ] Add `getTransaction()` function to fetch tx by digest
- [ ] Add `verifyTransactionOnChain()` to check if tx exists
- [ ] Update Sui Tab to show real transaction data when available
- [ ] Add loading states and error handling
- [ ] Link to Sui Explorer for transaction

**What You'll Test:**
1. Go to Demo mode
2. Simulate a payment (still mock)
3. Go to Sui Tab
4. For mock txHash: see mock data message
5. (Optional) Paste a real testnet txHash in Inspector mode and verify lookup works

---

## Step 3: Backend Proxy for CORS Bypass

- [ ] Add `axios` to API dependencies
- [ ] Create `proxy.ts` route in `apps/api/src/routes/`
- [ ] Register proxy route in `index.ts`
- [ ] Update `test-endpoint-mode.tsx` to use proxy
- [ ] Add proper error handling for failed requests

**What You'll Test:**
1. Go to "Test Endpoint" mode
2. Enter any public API URL (e.g., `https://httpbin.org/get`)
3. Click "Send Request"
4. Verify you get a real response (not CORS error)

---

## Step 4: Connect Wallet to Demo Mode

- [ ] Add "Pay with Wallet" button in Demo mode (alongside mock simulation)
- [ ] Use `useCurrentAccount` hook to check wallet connection
- [ ] Show "Connect Wallet First" message if not connected
- [ ] Create payment transaction using Sui SDK
- [ ] Sign transaction with connected wallet
- [ ] (For now: Sign a dummy transaction — real Beep comes later)

**What You'll Test:**
1. Go to Demo mode
2. Connect wallet if not connected
3. Click "Pay with Wallet"
4. Wallet popup asks for signature
5. Approve or reject and see appropriate response

---

## Step 5: Beep SDK / MCP Integration

- [ ] Research Beep SDK or MCP server setup
- [ ] Install Beep packages (if available)
- [ ] Create `beep-client.ts` utility
- [ ] Implement `createBeepPayment()` function
- [ ] Replace mock simulation with real Beep payment flow
- [ ] Handle Beep receipt response

**What You'll Test:**
1. Ensure you have testnet USDC in your wallet
2. Go to Demo mode
3. Load a challenge
4. Click "Pay with Beep"
5. Approve transaction in wallet
6. Verify real receipt is returned

---

## Step 6: Real Signature Verification

- [ ] Get Beep facilitator public key (from docs or API)
- [ ] Update `validators.ts` with real signature check
- [ ] Use Sui crypto utilities to verify
- [ ] Update Verify tab to show real verification status

**What You'll Test:**
1. Complete a real payment (Step 5)
2. Go to Verify tab
3. Verify "Signature Valid" shows ✓ for real receipts
4. Try a tampered receipt and verify it shows ✗

---

## Step 7: Database for Nonce Persistence

- [ ] Choose database (SQLite recommended for simplicity)
- [ ] Install `better-sqlite3` in API
- [ ] Create database schema for nonces
- [ ] Replace in-memory `usedNonces` Set with database
- [ ] Add history table for request logging
- [ ] Test restart persistence

**What You'll Test:**
1. Make a request and note the nonce
2. Restart the API server (`yarn dev:api`)
3. Try to replay the same nonce
4. Verify it's still rejected (replay protection persisted)

---

## Current Status

| Step | Status | Notes |
|------|--------|-------|
| 1. Wallet Integration | ✅ Complete | Required for Steps 4-6 |
| 2. Sui RPC | ⏳ Not Started | Enables real tx lookup |
| 3. Backend Proxy | ⏳ Not Started | Enables Test Endpoint mode |
| 4. Wallet + Demo | ⏳ Not Started | Connects wallet to flow |
| 5. Beep Integration | ⏳ Not Started | Real USDC payments |
| 6. Signature Verification | ⏳ Not Started | Security hardening |
| 7. Database | ⏳ Not Started | Production persistence |

---

## Ready to Start?

Tell me: **"Implement Step 1"** and I'll add Sui wallet integration. After I'm done, you test it and confirm it works before we continue to Step 2.
