# 📚 Learn Mode (Demo Mode)

## Purpose

Interactive tutorial that teaches developers how the a402 protocol works through hands-on experience.

> "Learn a402 by doing - see the flow, understand the data, build with confidence."

---

## Sub-Modes

### 1. Learning (Mock Mode)

**Purpose:** Risk-free exploration with simulated data

**Flow:**
```
1. Select a preset scenario (Happy Path, Wrong Amount, etc.)
2. Load the challenge → see the 402 response
3. Simulate payment → see mock receipt
4. View verification → understand what passes/fails
```

**Features:**
| Feature | Status | Description |
|---------|--------|-------------|
| Preset scenarios | ✅ Done | Pre-configured test cases |
| Load challenge | ✅ Done | Display challenge in panel |
| Simulate payment | ✅ Done | Generate mock receipt |
| Wallet signing | ✅ Done | Demo transaction without submit |
| Beep SDK payment | ✅ Done | Mock Beep flow |
| Code export | ✅ Done | Copy integration snippets |
| Educational tooltips | ❌ Missing | Explain each field |
| Guided tour | ❌ Missing | Step-by-step walkthrough |
| Flow animation | ❌ Missing | Visualize data movement |

---

### 2. Beep Live

**Purpose:** Experience real payments with minimal USDC

**Flow:**
```
1. Connect wallet
2. Click "Pay X USDC" → opens Beep Checkout Widget
3. Scan QR with mobile wallet OR pay with connected wallet
4. Widget detects payment → generates receipt
5. Receipt displayed in panels
```

**Features:**
| Feature | Status | Description |
|---------|--------|-------------|
| Connect wallet | ✅ Done | Sui wallet integration |
| Open checkout widget | ✅ Done | BeepCheckout component |
| QR code display | ✅ Done | For mobile wallet |
| Real USDC transfer | ✅ Done | On Sui mainnet |
| Generate receipt | ✅ Done | After payment |
| Verify receipt | ❌ Missing | Call Beep API |
| Show on explorer | ❌ Missing | Link to tx |

---

### 3. SDK Integration

**Purpose:** Production-ready pattern using BeepPublicClient

**Flow:**
```
1. Enter amount and description
2. Create payment session → get referenceKey
3. Pay with wallet (to Beep's destination address)
4. Poll waitForPaid() → Beep confirms
5. Verify receipt via server-side Beep API
```

**Features:**
| Feature | Status | Description |
|---------|--------|-------------|
| Create session | ✅ Done | BeepPublicClient.widget.createPaymentSession |
| Get referenceKey | ✅ Done | From session response |
| Show destination | ✅ Done | Where to send USDC |
| Pay with wallet | ✅ Done | Direct USDC transfer |
| Poll for payment | ✅ Done | waitForPaid() |
| Create receipt | ✅ Done | With beep_sdk_ prefix |
| Server verification | ✅ Done | /a402/verify-beep |
| Show method used | ✅ Done | beep-a402-verify, etc. |
| Show full response | ❌ Missing | API response details |

---

## Implementation

**File:** `apps/web/src/components/modes/demo-mode.tsx`

**Key Functions:**
- `handleLoadPreset()` - Load scenario data
- `handleSimulatePayment()` - Generate mock receipt
- `handleWalletPayment()` - Sign demo transaction
- `handleBeepLivePayment()` - Open checkout widget
- `handleBeepPayment()` - Use Beep SDK

**Dependencies:**
- `@beep-it/sdk-core` - BeepPublicClient
- `@mysten/dapp-kit` - Wallet connection
- `SdkIntegrationPanel` - SDK sub-mode UI

---

## TODO

### Educational Enhancements
- [ ] Add info icons with tooltips explaining each field
- [ ] Create guided tour modal for first-time users
- [ ] Add animated arrows showing data flow

### UX Improvements  
- [ ] Remember last used sub-mode
- [ ] Show network (mainnet/testnet) prominently
- [ ] Add "Copy all" for challenge/receipt

### Verification
- [ ] Auto-verify receipt after payment
- [ ] Show detailed verification breakdown
- [ ] Link to block explorer for real tx
