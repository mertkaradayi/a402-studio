/**
 * Test Beep verification with SECRET API key
 *
 * Required environment variables:
 *   BEEP_SECRET_KEY - Beep secret API key (beep_sk_...)
 *   BEEP_PUBLISHABLE_KEY - Beep publishable key (beep_pk_...)
 *
 * Run with: npx tsx scripts/test-beep-api-key-verify.ts
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
    BEEP_SECRET_KEY: requireEnv("BEEP_SECRET_KEY"),
    BEEP_PUBLISHABLE_KEY: requireEnv("BEEP_PUBLISHABLE_KEY"),
};

// Test data - use environment variables or defaults for testing
const TEST_DATA = {
    referenceKey: process.env.TEST_REFERENCE_KEY || "test_reference_key",
    txHash: process.env.TEST_TX_HASH || "test_tx_hash",
    payer: process.env.TEST_PAYER_ADDRESS || "0x0000000000000000000000000000000000000000000000000000000000000000",
    merchant: process.env.TEST_MERCHANT_ADDRESS || "0x0000000000000000000000000000000000000000000000000000000000000000",
    amount: "0.000001",
};

async function testEndpoint(name: string, url: string, options: RequestInit) {
    console.log(`\n=== ${name} ===`);
    console.log(`URL: ${url}`);

    try {
        const response = await fetch(url, options);
        console.log(`Status: ${response.status} ${response.statusText}`);

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`Response:`, JSON.stringify(data, null, 2));
            return data;
        } else {
            const text = await response.text();
            console.log(`Response:`, text.slice(0, 500));
            return null;
        }
    } catch (error) {
        console.log(`Error:`, error);
        return null;
    }
}

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     Testing Beep with SECRET API Key                        ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    const secretHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.BEEP_SECRET_KEY}`,
        "x-beep-client": "beep-sdk",
    };

    // Test 1: GET invoice details with secret key
    await testEndpoint(
        "GET Invoice (secret key)",
        `${CONFIG.BEEP_API_URL}/v1/invoices/${TEST_DATA.referenceKey}`,
        { headers: secretHeaders }
    );

    // Test 2: POST /a402/verify with secret key
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
        "POST /a402/verify (secret key, snake_case)",
        `${CONFIG.BEEP_API_URL}/a402/verify`,
        {
            method: "POST",
            headers: secretHeaders,
            body: JSON.stringify(receipt),
        }
    );

    // Test 3: Try camelCase
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
        "POST /a402/verify (secret key, camelCase)",
        `${CONFIG.BEEP_API_URL}/a402/verify`,
        {
            method: "POST",
            headers: secretHeaders,
            body: JSON.stringify(receiptCamel),
        }
    );

    // Test 4: Try with wrapped receipt
    await testEndpoint(
        "POST /a402/verify (secret key, wrapped)",
        `${CONFIG.BEEP_API_URL}/a402/verify`,
        {
            method: "POST",
            headers: secretHeaders,
            body: JSON.stringify({ receipt: receiptCamel }),
        }
    );

    // Test 5: GET /a402/status with secret key
    await testEndpoint(
        "GET /a402/status (secret key)",
        `${CONFIG.BEEP_API_URL}/a402/status/${TEST_DATA.referenceKey}`,
        { headers: secretHeaders }
    );

    // Test 6: MCP with secret key
    console.log("\n=== MCP with Secret Key ===");
    const mcpBody = {
        jsonrpc: "2.0",
        id: "1",
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "a402-studio", version: "1.0" }
        }
    };

    await testEndpoint(
        "MCP Initialize (secret key)",
        `${CONFIG.BEEP_API_URL}/mcp`,
        {
            method: "POST",
            headers: secretHeaders,
            body: JSON.stringify(mcpBody),
        }
    );

    // Test 7: MCP with API key in header
    await testEndpoint(
        "MCP Initialize (X-API-Key header)",
        `${CONFIG.BEEP_API_URL}/mcp`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": CONFIG.BEEP_SECRET_KEY,
            },
            body: JSON.stringify(mcpBody),
        }
    );

    // Test 8: Check payment status with secret key
    await testEndpoint(
        "GET /v1/widget/payment-status (secret key)",
        `${CONFIG.BEEP_API_URL}/v1/widget/payment-status/${TEST_DATA.referenceKey}`,
        { headers: secretHeaders }
    );

    // Test 9: List invoices to see if we can find our payment
    await testEndpoint(
        "GET /v1/invoices (list all)",
        `${CONFIG.BEEP_API_URL}/v1/invoices`,
        { headers: secretHeaders }
    );

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║     Tests Complete                                          ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
}

main();
