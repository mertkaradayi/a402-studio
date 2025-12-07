/**
 * Test what the frontend verification would do
 * Simulates the exact flow from signature-verification.ts
 *
 * Optional environment variables:
 *   API_URL - Backend API URL (defaults to localhost)
 *   TEST_* - Test data overrides
 *
 * Run with: npx tsx scripts/test-frontend-api-call.ts
 */

import "dotenv/config";

// Simulating the frontend's environment
const LOCAL_API_URL = process.env.API_URL || "http://localhost:3001";

interface Receipt {
    id: string;
    requestNonce: string;
    payer: string;
    merchant: string;
    amount: string;
    asset: string;
    chain: string;
    txHash: string;
    signature: string;
    issuedAt: number;
}

interface Challenge {
    amount: string;
    chain: string;
    nonce: string;
    recipient: string;
    expiry?: number;
}

// Copy of the frontend's isValidSuiTxHash function
function isValidSuiTxHash(hash: string): boolean {
    return /^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(hash);
}

// Test with data from environment or defaults
async function main() {
    // Use data from environment variables or test defaults
    const testReferenceKey = process.env.TEST_REFERENCE_KEY || "test_reference_key";
    const testTxHash = process.env.TEST_TX_HASH || "test_tx_hash";
    const testPayer = process.env.TEST_PAYER_ADDRESS || "0x0000000000000000000000000000000000000000000000000000000000000000";
    const testMerchant = process.env.TEST_MERCHANT_ADDRESS || "0x0000000000000000000000000000000000000000000000000000000000000000";

    const receipt: Receipt = {
        id: `rcpt_${Date.now()}`,
        requestNonce: testReferenceKey,
        payer: testPayer,
        merchant: testMerchant,
        amount: "0.000001",
        asset: "USDC",
        chain: "sui-mainnet",
        txHash: testTxHash,
        signature: `beep_sdk_${testReferenceKey}_${testTxHash.slice(0, 8)}`,
        issuedAt: Math.floor(Date.now() / 1000),
    };

    const challenge: Challenge = {
        amount: "0.000001",
        chain: "sui-mainnet",
        recipient: testMerchant,
        nonce: testReferenceKey,
        expiry: Math.floor(Date.now() / 1000) + 3600,
    };

    console.log("=== Testing Frontend Verification Logic ===\n");

    // Test 1: isBeepSdkPayment check
    const isBeepSdk = receipt.signature.startsWith("beep_sdk_");
    console.log("1. isBeepSdkPayment:", isBeepSdk);

    // Test 2: isValidSuiTxHash
    const txHashValid = isValidSuiTxHash(receipt.txHash);
    console.log("2. isValidSuiTxHash:", txHashValid);
    console.log("   txHash:", receipt.txHash);
    console.log("   length:", receipt.txHash.length);

    // Test 3: Simulate on-chain API call (same as frontend does)
    console.log("\n3. Testing verifyReceiptOnChainAPI...");
    const url = `${LOCAL_API_URL}/a402/verify-onchain`;
    console.log("   URL:", url);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ receipt, challenge }),
        });

        console.log("   Response status:", response.status);
        console.log("   Response headers:", Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log("   Response body:", JSON.stringify(data, null, 2));

        if (data.valid) {
            console.log("\n✅ On-chain verification would PASS");
        } else {
            console.log("\n❌ On-chain verification would FAIL");
        }
    } catch (error) {
        console.error("   Error:", error);
    }

    // Test 4: Check what happens if challenge has different field names
    console.log("\n4. Testing with A402Challenge type (expiry field)...");

    // The store's A402Challenge type uses 'expiry' which might be undefined
    const challengeFromStore = {
        amount: "0.000001",
        asset: "USDC",
        chain: "sui-mainnet",
        recipient: testMerchant,
        nonce: testReferenceKey,
        // expiry might not be set!
    };

    console.log("   Challenge from store (no expiry):", JSON.stringify(challengeFromStore, null, 2));

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ receipt, challenge: challengeFromStore }),
        });

        const data = await response.json();
        console.log("   Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("   Error:", error);
    }
}

main();
