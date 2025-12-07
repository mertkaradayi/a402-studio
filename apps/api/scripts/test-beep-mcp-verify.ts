/**
 * Test Beep MCP verification endpoint
 *
 * Based on docs: The MCP integration uses JSON-RPC protocol
 *
 * Required environment variables:
 *   BEEP_PUBLISHABLE_KEY - Beep publishable key (beep_pk_...)
 *
 * Run with: npx tsx scripts/test-beep-mcp-verify.ts
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

async function testMcpEndpoint(name: string, method: string, params: any) {
    console.log(`\n=== Testing: ${name} ===`);

    const body = {
        jsonrpc: "2.0",
        id: Date.now().toString(),
        method,
        params,
    };

    console.log(`Method: ${method}`);
    console.log(`Params:`, JSON.stringify(params, null, 2));

    try {
        // Try with publishable key as bearer
        const response = await fetch(`${CONFIG.BEEP_API_URL}/mcp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${CONFIG.BEEP_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify(body),
        });

        console.log(`Status: ${response.status}`);

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await response.json();
            console.log(`Response:`, JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log(`Response (text):`, text.slice(0, 500));
        }
    } catch (error) {
        console.log(`Error:`, error);
    }
}

async function testDirectEndpoints() {
    console.log("\n=== Testing Direct /mcp Endpoints ===\n");

    // Test 1: Initialize MCP session
    await testMcpEndpoint(
        "MCP Initialize",
        "initialize",
        {
            clientInfo: {
                name: "a402-studio",
                version: "1.0.0"
            }
        }
    );

    // Test 2: List available tools
    await testMcpEndpoint(
        "List Tools",
        "tools/list",
        {}
    );

    // Test 3: Try a402 verify via MCP
    await testMcpEndpoint(
        "a402/verify via MCP",
        "tools/call",
        {
            name: "verify",
            arguments: {
                receipt: {
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
                }
            }
        }
    );

    // Test 4: Try verifyReceipt tool
    await testMcpEndpoint(
        "verifyReceipt tool",
        "tools/call",
        {
            name: "verifyReceipt",
            arguments: {
                receiptId: TEST_DATA.referenceKey,
                txHash: TEST_DATA.txHash,
            }
        }
    );

    // Test 5: Try getPaymentStatus tool
    await testMcpEndpoint(
        "getPaymentStatus tool",
        "tools/call",
        {
            name: "getPaymentStatus",
            arguments: {
                referenceKey: TEST_DATA.referenceKey,
            }
        }
    );
}

async function testAlternativeUrls() {
    console.log("\n\n=== Testing Alternative URL patterns ===\n");

    const urls = [
        `${CONFIG.BEEP_API_URL}/mcp`,
        `${CONFIG.BEEP_API_URL}/v1/mcp`,
        `${CONFIG.BEEP_API_URL}/rpc`,
        `${CONFIG.BEEP_API_URL}/jsonrpc`,
    ];

    for (const url of urls) {
        console.log(`\n--- Testing URL: ${url} ---`);
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${CONFIG.BEEP_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: "1",
                    method: "initialize",
                    params: { clientInfo: { name: "test", version: "1.0" } }
                }),
            });
            console.log(`Status: ${response.status}`);
            const text = await response.text();
            console.log(`Response: ${text.slice(0, 300)}`);
        } catch (e) {
            console.log(`Error: ${e}`);
        }
    }
}

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     Testing Beep MCP Verification                           ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    await testDirectEndpoints();
    await testAlternativeUrls();

    console.log("\n\n╔════════════════════════════════════════════════════════════╗");
    console.log("║     Tests Complete                                          ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
}

main();
