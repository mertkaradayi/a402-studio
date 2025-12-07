# 🧪 Test Mode (Test Endpoint)

## Purpose

Validate that your API correctly returns 402 challenges according to the a402 protocol spec.

> "The Postman for a402 - test your server before going live."

---

## Use Cases

1. **Integration Testing** - Verify your 402 endpoint returns valid challenges
2. **Schema Validation** - Check all required fields are present
3. **Format Checking** - Ensure values are correctly formatted
4. **Debugging** - Find why your challenge isn't working

---

## Flow

```
1. Enter your API endpoint URL (e.g., https://api.example.com/premium)
2. Click "Test Endpoint"
3. Tool makes request and captures 402 response
4. Challenge is parsed from response body or headers
5. Schema validation runs and shows results
6. Decoded fields displayed for review
```

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Enter custom URL | ✅ Done | Any HTTP endpoint |
| Make HTTP request | ✅ Done | Fetch with error handling |
| Parse 402 response | ✅ Done | Extract challenge JSON |
| Validate schema | ✅ Done | Check required fields |
| Show validation score | ✅ Done | 0-100% compliance |
| Display decoded fields | ✅ Done | Table view |
| Error handling | ✅ Done | Network errors, non-402 |
| Multiple endpoints | ❌ Missing | Test several at once |
| Save configurations | ❌ Missing | Remember URLs |
| Compare responses | ❌ Missing | Diff between runs |

---

## Schema Validation Rules

The tool validates challenges against the a402 spec:

### Required Fields
| Field | Type | Example |
|-------|------|---------|
| `amount` | string | `"0.50"` |
| `asset` | string | `"USDC"` |
| `chain` | string | `"sui-mainnet"` |
| `recipient` | string | `"0x..."` |
| `nonce` | string | `"nonce_abc123"` |

### Optional Fields
| Field | Type | Example |
|-------|------|---------|
| `expiry` | number | `1733500800` (Unix timestamp) |
| `callback` | string | `"https://api.example.com/verify"` |
| `description` | string | `"Premium API access"` |

### Validation Checks
- ✅ All required fields present
- ✅ Amount is valid number string
- ✅ Chain is recognized format
- ✅ Recipient is valid address format
- ✅ Expiry is in the future (if present)
- ✅ Nonce is non-empty string

---

## Implementation

**File:** `apps/web/src/components/modes/test-endpoint-mode.tsx`

**Key Functions:**
- `handleTestEndpoint()` - Makes request and parses response
- `validateChallengeSchema()` - Runs validation rules (from lib/validators.ts)

**UI Components:**
- URL input field
- "Test Endpoint" button
- Response status display
- Schema validation results
- Decoded fields table

---

## Example Usage

### Testing Your API

```bash
# Your API should return:
HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "amount": "0.10",
  "asset": "USDC",
  "chain": "sui-mainnet",
  "recipient": "0x1234...abcd",
  "nonce": "nonce_unique123",
  "expiry": 1733500800
}
```

### Expected Results

If valid:
```
✅ Schema Valid (100%)
- amount: "0.10" ✓
- asset: "USDC" ✓
- chain: "sui-mainnet" ✓
- recipient: "0x1234...abcd" ✓
- nonce: "nonce_unique123" ✓
- expiry: 2024-12-06T12:00:00Z ✓
```

If invalid:
```
❌ Schema Invalid (60%)
Errors:
- amount: Missing required field
- chain: Unknown chain format
```

---

## TODO

### Core Improvements
- [ ] Support testing multiple endpoints
- [ ] Save endpoint URLs for reuse
- [ ] Show raw HTTP response (headers + body)

### Advanced Features
- [ ] Side-by-side comparison of responses
- [ ] Auto-suggest fixes for common issues
- [ ] Export test results as report

### UX
- [ ] Loading state during request
- [ ] Better error messages for network issues
- [ ] Remember last tested URL
