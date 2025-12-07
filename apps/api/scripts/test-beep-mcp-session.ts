/**
 * Test Beep MCP with proper session handling
 *
 * The MCP protocol requires:
 * 1. First call to get a session ID
 * 2. Subsequent calls use that session ID
 *
 * Required environment variables:
 *   BEEP_PUBLISHABLE_KEY - Beep publishable key (beep_pk_...)
 *
 * Run with: npx tsx scripts/test-beep-mcp-session.ts
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

const TEST_DATA = {
    referenceKey: process.env.TEST_REFERENCE_KEY || "test_reference_key",
    txHash: process.env.TEST_TX_HASH || "test_tx_hash",
    payer: process.env.TEST_PAYER_ADDRESS || "0x0000000000000000000000000000000000000000000000000000000000000000",
    merchant: process.env.TEST_MERCHANT_ADDRESS || "0x0000000000000000000000000000000000000000000000000000000000000000",
    amount: "0.000001",
};

async function mcpCall(sessionId: string | null, method: string, params: any) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.BEEP_PUBLISHABLE_KEY}`,
    };

    if (sessionId) {
        headers["mcp-session-id"] = sessionId;
    }

    const body = {
        jsonrpc: "2.0",
        id: Date.now().toString(),
        method,
        params,
    };

    console.log(`\nMCP Call: ${method}`);
    console.log(`Session ID: ${sessionId || "(none)"}`);

    const response = await fetch(`${CONFIG.BEEP_API_URL}/mcp`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    // Check for session ID in response headers
    const newSessionId = response.headers.get("mcp-session-id");
    if (newSessionId) {
        console.log(`New Session ID from headers: ${newSessionId}`);
    }

    const data = await response.json();
    console.log(`Response:`, JSON.stringify(data, null, 2));

    return { data, newSessionId };
}

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     Testing Beep MCP with Session                           ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    let sessionId: string | null = null;

    // Step 1: Try to initialize and get a session
    console.log("\n=== Step 1: Initialize Session ===");

    // Try different ways to get a session
    const initMethods = [
        // Standard MCP initialize
        { method: "initialize", params: { clientInfo: { name: "a402-studio", version: "1.0" } } },
        // With protocolVersion
        { method: "initialize", params: { protocolVersion: "0.1.0", clientInfo: { name: "a402-studio", version: "1.0" } } },
        // With capabilities
        { method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "a402-studio", version: "1.0" } } },
    ];

    for (const init of initMethods) {
        console.log(`\nTrying: ${JSON.stringify(init.params)}`);
        const result = await mcpCall(sessionId, init.method, init.params);
        if (result.newSessionId) {
            sessionId = result.newSessionId;
            break;
        }
        if (result.data.result?.sessionId) {
            sessionId = result.data.result.sessionId;
            console.log(`Got session from result: ${sessionId}`);
            break;
        }
    }

    // Step 2: Try with a random session ID
    if (!sessionId) {
        console.log("\n=== Step 2: Try with generated session ID ===");
        sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        console.log(`Using generated session: ${sessionId}`);

        const result = await mcpCall(sessionId, "initialize", {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "a402-studio", version: "1.0" }
        });
    }

    // Step 3: Try listing tools
    console.log("\n=== Step 3: List Tools ===");
    await mcpCall(sessionId, "tools/list", {});

    // Step 4: Try SSE transport (MCP often uses Server-Sent Events)
    console.log("\n=== Step 4: Test SSE endpoint ===");
    try {
        const sseResponse = await fetch(`${CONFIG.BEEP_API_URL}/mcp/sse`, {
            headers: {
                "Authorization": `Bearer ${CONFIG.BEEP_PUBLISHABLE_KEY}`,
                "Accept": "text/event-stream",
            },
        });
        console.log(`SSE Status: ${sseResponse.status}`);
        const sseText = await sseResponse.text();
        console.log(`SSE Response: ${sseText.slice(0, 300)}`);
    } catch (e) {
        console.log(`SSE Error: ${e}`);
    }

    // Step 5: Check if there's a different auth endpoint
    console.log("\n=== Step 5: Test Auth endpoints ===");
    const authEndpoints = [
        "/auth/session",
        "/v1/auth/session",
        "/mcp/session",
        "/api/session",
    ];

    for (const endpoint of authEndpoints) {
        try {
            const response = await fetch(`${CONFIG.BEEP_API_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${CONFIG.BEEP_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({ apiKey: CONFIG.BEEP_PUBLISHABLE_KEY }),
            });
            console.log(`${endpoint}: ${response.status}`);
            if (response.status !== 404) {
                const text = await response.text();
                console.log(`  Response: ${text.slice(0, 200)}`);
            }
        } catch (e) {
            console.log(`${endpoint}: Error - ${e}`);
        }
    }

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║     Tests Complete                                          ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
}

main();
