/**
 * Test the /a402/verify-beep endpoint
 *
 * This tests the server-side Beep verification using the secret API key
 *
 * Required: The API server must be running with BEEP_SECRET_KEY set
 *
 * Run with: npx tsx scripts/test-verify-beep-endpoint.ts
 */

import "dotenv/config";

const API_URL = process.env.API_URL || "http://localhost:3001";

// Test data - use environment variables or defaults
const TEST_RECEIPT = {
    id: "rcpt_test_1",
    requestNonce: process.env.TEST_REFERENCE_KEY || "test_reference_key",
    payer: process.env.TEST_PAYER_ADDRESS || "0x0000000000000000000000000000000000000000000000000000000000000000",
    merchant: process.env.TEST_MERCHANT_ADDRESS || "0x0000000000000000000000000000000000000000000000000000000000000000",
    amount: "0.000001",
    asset: "USDC",
    chain: "sui-mainnet",
    txHash: process.env.TEST_TX_HASH || "test_tx_hash",
    signature: `beep_sdk_${process.env.TEST_REFERENCE_KEY || "test_reference_key"}`,
    issuedAt: Math.floor(Date.now() / 1000),
};

const TEST_CHALLENGE = {
    amount: "0.000001",
    recipient: process.env.TEST_MERCHANT_ADDRESS || "0x0000000000000000000000000000000000000000000000000000000000000000",
    nonce: process.env.TEST_REFERENCE_KEY || "test_reference_key",
};

async function testEndpoint(name: string, url: string, body: unknown) {
    console.log(`\n=== ${name} ===`);
    console.log(`URL: ${url}`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        console.log(`Status: ${response.status}`);
        const data = await response.json();
        console.log(`Response:`, JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.log(`Error:`, error);
        return null;
    }
}

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     Testing /a402/verify-beep Endpoint                      ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    // Test 1: Verify with receipt and challenge
    await testEndpoint(
        "POST /a402/verify-beep (with challenge)",
        `${API_URL}/a402/verify-beep`,
        {
            receipt: TEST_RECEIPT,
            challenge: TEST_CHALLENGE,
        }
    );

    // Test 2: Verify with receipt only
    await testEndpoint(
        "POST /a402/verify-beep (receipt only)",
        `${API_URL}/a402/verify-beep`,
        {
            receipt: TEST_RECEIPT,
        }
    );

    // Test 3: Test with wrong amount (should still find paid invoices but may not match)
    await testEndpoint(
        "POST /a402/verify-beep (wrong amount)",
        `${API_URL}/a402/verify-beep`,
        {
            receipt: TEST_RECEIPT,
            challenge: {
                ...TEST_CHALLENGE,
                amount: "999.99", // Wrong amount
            },
        }
    );

    // Test 4: Test with no receipt (should fail)
    await testEndpoint(
        "POST /a402/verify-beep (no receipt)",
        `${API_URL}/a402/verify-beep`,
        {}
    );

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║     Tests Complete                                          ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("\nNote: The API server needs to be running with BEEP_SECRET_KEY env var set.");
    console.log("Run: BEEP_SECRET_KEY=beep_sk_xxx yarn workspace api dev");
}

main();
