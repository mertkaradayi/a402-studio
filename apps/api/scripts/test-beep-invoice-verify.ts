/**
 * Test Beep verification using invoice UUID
 *
 * Key finding: Beep uses UUID internally, not the reference key
 * We need to look up invoices by UUID, not by reference key
 *
 * Required environment variables:
 *   BEEP_SECRET_KEY - Beep secret API key (beep_sk_...)
 *   BEEP_PUBLISHABLE_KEY - Beep publishable key (beep_pk_...)
 *
 * Run with: npx tsx scripts/test-beep-invoice-verify.ts
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

// Test with specific invoice UUIDs from environment or use empty array
// These would be UUIDs from actual paid invoices in your account
const PAID_INVOICES = process.env.TEST_PAID_INVOICE_UUIDS
    ? process.env.TEST_PAID_INVOICE_UUIDS.split(",").map((uuid, i) => ({ id: i, uuid: uuid.trim(), status: "paid" }))
    : [];

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
    console.log("║     Testing Beep Invoice Verification by UUID              ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    const secretHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.BEEP_SECRET_KEY}`,
    };

    const publishableHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CONFIG.BEEP_PUBLISHABLE_KEY}`,
        "x-beep-client": "beep-sdk",
    };

    // Test 1: Get invoice by UUID with secret key
    for (const invoice of PAID_INVOICES) {
        await testEndpoint(
            `GET /v1/invoices/${invoice.uuid} (secret key)`,
            `${CONFIG.BEEP_API_URL}/v1/invoices/${invoice.uuid}`,
            { headers: secretHeaders }
        );
    }

    // Test 2: Get payment status by UUID with publishable key
    for (const invoice of PAID_INVOICES) {
        await testEndpoint(
            `GET /v1/widget/payment-status/${invoice.uuid} (publishable key)`,
            `${CONFIG.BEEP_API_URL}/v1/widget/payment-status/${invoice.uuid}`,
            { headers: publishableHeaders }
        );
    }

    // Test 3: Try to find how reference key maps to UUID
    // When we create a payment session, what's returned?
    console.log("\n\n=== Testing Payment Session Creation ===");

    const paymentSession = await testEndpoint(
        "POST /v1/widget/payment-sessions (create new)",
        `${CONFIG.BEEP_API_URL}/v1/widget/payment-sessions`,
        {
            method: "POST",
            headers: publishableHeaders,
            body: JSON.stringify({
                items: [{ name: "Test", quantity: 1, price: "0.000001" }],
            }),
        }
    );

    if (paymentSession) {
        console.log("\n=== Analyzing Payment Session Response ===");
        console.log("Keys returned:", Object.keys(paymentSession));

        // The referenceKey might be under a different name
        const possibleReferenceFields = [
            'referenceKey', 'reference_key', 'ref', 'id', 'sessionId',
            'session_id', 'paymentId', 'payment_id', 'nonce', 'uuid'
        ];

        for (const field of possibleReferenceFields) {
            if (paymentSession[field]) {
                console.log(`Found ${field}:`, paymentSession[field]);
            }
        }
    }

    // Test 4: Check if there's a lookup by external reference
    console.log("\n\n=== Testing Reference Key Lookup ===");

    // Try different endpoints that might accept reference key
    const referenceKey = "8PznftZDtr7AUX9A6s532w9ESy48msmsrxPs8LcYeLuP";

    await testEndpoint(
        "GET /v1/invoices?referenceKey=... (query param)",
        `${CONFIG.BEEP_API_URL}/v1/invoices?referenceKey=${referenceKey}`,
        { headers: secretHeaders }
    );

    await testEndpoint(
        "GET /v1/invoices?externalId=... (query param)",
        `${CONFIG.BEEP_API_URL}/v1/invoices?externalId=${referenceKey}`,
        { headers: secretHeaders }
    );

    // Test 5: Look at a specific paid invoice's full details
    console.log("\n\n=== Getting Full Invoice Details ===");

    const paidInvoice = await testEndpoint(
        `GET /v1/invoices/${PAID_INVOICES[0].uuid} (full details)`,
        `${CONFIG.BEEP_API_URL}/v1/invoices/${PAID_INVOICES[0].uuid}`,
        { headers: secretHeaders }
    );

    if (paidInvoice) {
        console.log("\n=== Invoice fields that might contain reference key ===");
        const allKeys = Object.keys(paidInvoice);
        console.log("All fields:", allKeys);
    }

    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║     Tests Complete                                          ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
}

main();
