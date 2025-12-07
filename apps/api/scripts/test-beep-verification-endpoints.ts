/**
 * Test all possible Beep verification endpoints
 *
 * Goal: Find the correct way to verify payments through Beep
 *
 * Required environment variables:
 *   BEEP_PUBLISHABLE_KEY - Beep publishable key (beep_pk_...)
 *
 * Run with: npx tsx scripts/test-beep-verification-endpoints.ts
 */

import "dotenv/config";

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        console.error(`❌ Missing required environment variable: ${name}`);
        process.exit(1);
    }
    return value;
}

const CONFIG = {
    BEEP_API_URL: process.env.BEEP_API_URL || "https://api.justbeep.it",
    BEEP_PUBLISHABLE_KEY: requireEnv("BEEP_PUBLISHABLE_KEY"),
};

// Test data - use environment variables or defaults
const TEST_DATA = {
    referenceKey: process.env.TEST_REFERENCE_KEY || "test_reference_key",
    txHash: process.env.TEST_TX_HASH || "test_tx_hash",
    payer: process.env.TEST_PAYER_ADDRESS || "0x0000000000000000000000000000000000000000000000000000000000000000",
    merchant: process.env.TEST_MERCHANT_ADDRESS || "0x0000000000000000000000000000000000000000000000000000000000000000",
    amount: "0.000001",
};

async function testEndpoint(name: string, url: string, options: RequestInit) {
    console.log(`\n=== Testing: ${name} ===`);
    console.log(`URL: ${url}`);
    console.log(`Method: ${options.method || 'GET'}`);
    if (options.body) {
        console.log(`Body: ${options.body}`);
    }

    try {
        const response = await fetch(url, options);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Headers:`, Object.fromEntries(response.headers.entries()));

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`Response:`, JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log(`Response (first 500 chars):`, text.slice(0, 500));
        }
    } catch (error) {
        console.log(`Error:`, error);
    }
}

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     Testing Beep Verification Endpoints                     ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.BEEP_PUBLISHABLE_KEY}`,
        "x-beep-client": "beep-sdk",
    };

    // Test 1: GET /a402/status/:id (from docs)
    await testEndpoint(
        "GET /a402/status/:id",
        `${CONFIG.BEEP_API_URL}/a402/status/${TEST_DATA.referenceKey}`,
        { headers }
    );

    // Test 2: POST /a402/verify (from docs)
    const receipt = {
        id: `rcpt_${Date.now()}`,
        request_nonce: TEST_DATA.referenceKey,
        payer: TEST_DATA.payer,
        merchant: TEST_DATA.merchant,
        amount: TEST_DATA.amount,
        asset: "USDC",
        chain: "sui",
        tx_hash: TEST_DATA.txHash,
        signature: `beep_sdk_${TEST_DATA.referenceKey}`,
        issued_at: Math.floor(Date.now() / 1000),
    };

    await testEndpoint(
        "POST /a402/verify (snake_case)",
        `${CONFIG.BEEP_API_URL}/a402/verify`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(receipt),
        }
    );

    // Test 3: POST /a402/verify with camelCase
    const receiptCamel = {
        id: `rcpt_${Date.now()}`,
        requestNonce: TEST_DATA.referenceKey,
        payer: TEST_DATA.payer,
        merchant: TEST_DATA.merchant,
        amount: TEST_DATA.amount,
        asset: "USDC",
        chain: "sui",
        txHash: TEST_DATA.txHash,
        signature: `beep_sdk_${TEST_DATA.referenceKey}`,
        issuedAt: Math.floor(Date.now() / 1000),
    };

    await testEndpoint(
        "POST /a402/verify (camelCase)",
        `${CONFIG.BEEP_API_URL}/a402/verify`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(receiptCamel),
        }
    );

    // Test 4: POST /a402/verify with { receipt: ... } wrapper
    await testEndpoint(
        "POST /a402/verify (wrapped)",
        `${CONFIG.BEEP_API_URL}/a402/verify`,
        {
            method: "POST",
            headers,
            body: JSON.stringify({ receipt: receiptCamel }),
        }
    );

    // Test 5: Try v1 prefix
    await testEndpoint(
        "POST /v1/a402/verify",
        `${CONFIG.BEEP_API_URL}/v1/a402/verify`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(receiptCamel),
        }
    );

    // Test 6: GET payment-status (what SDK uses)
    await testEndpoint(
        "GET /v1/widget/payment-status/:id",
        `${CONFIG.BEEP_API_URL}/v1/widget/payment-status/${TEST_DATA.referenceKey}`,
        { headers }
    );

    // Test 7: Check if there's an invoice endpoint
    await testEndpoint(
        "GET /v1/invoices/:id",
        `${CONFIG.BEEP_API_URL}/v1/invoices/${TEST_DATA.referenceKey}`,
        { headers }
    );

    // Test 8: Try without auth
    await testEndpoint(
        "POST /a402/verify (no auth)",
        `${CONFIG.BEEP_API_URL}/a402/verify`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(receiptCamel),
        }
    );

    // Test 9: Check API discovery
    await testEndpoint(
        "GET /v1 (API discovery)",
        `${CONFIG.BEEP_API_URL}/v1`,
        { headers }
    );

    // Test 10: OpenAPI/Swagger
    await testEndpoint(
        "GET /openapi.json",
        `${CONFIG.BEEP_API_URL}/openapi.json`,
        { headers }
    );

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║     Tests Complete                                          ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
}

main();
