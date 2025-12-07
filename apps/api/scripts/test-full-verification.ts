/**
 * Full verification test
 *
 * Tests the complete verification flow:
 * 1. Creates a Beep payment session
 * 2. Executes payment on Sui mainnet
 * 3. Verifies via Beep invoice API (server-side)
 * 4. Verifies via on-chain check
 *
 * Required environment variables:
 *   BEEP_SECRET_KEY - Beep secret API key (beep_sk_...)
 *   BEEP_PUBLISHABLE_KEY - Beep publishable key (beep_pk_...)
 *   SUI_PRIVATE_KEY - Sui wallet private key for test transactions
 *
 * Run with: npx tsx scripts/test-full-verification.ts
 */

import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
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
    SUI_PRIVATE_KEY: requireEnv("SUI_PRIVATE_KEY"),
    // USDC on Sui mainnet
    USDC_TYPE: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
};

async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     Full Beep Verification Test                             ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    // Setup Sui client and wallet
    const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });
    const { secretKey } = decodeSuiPrivateKey(CONFIG.SUI_PRIVATE_KEY);
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);
    const walletAddress = keypair.getPublicKey().toSuiAddress();

    console.log("\n=== Wallet Info ===");
    console.log(`Address: ${walletAddress}`);

    // Step 1: Create Beep payment session using the SDK
    console.log("\n=== Step 1: Create Beep Payment Session ===");

    // Import and use the SDK
    const { BeepPublicClient } = await import("@beep-it/sdk-core");

    const beepClient = new BeepPublicClient({
        publishableKey: CONFIG.BEEP_PUBLISHABLE_KEY,
    });

    const sessionData = await beepClient.widget.createPaymentSession({
        assets: [{ name: "Verification Test", quantity: 1, price: "0.000001" }],
        paymentLabel: "Full Verification Test",
    });

    console.log("Session response:", JSON.stringify(sessionData, null, 2));

    const referenceKey = sessionData.referenceKey;
    const sessionResult = sessionData as {
        referenceKey: string;
        destinationAddress?: string;
        paymentUrl?: string;
    };
    const destinationAddress = sessionResult.destinationAddress;

    if (!referenceKey || !destinationAddress) {
        console.error("Failed to create payment session - missing destination address");
        console.error("Full response:", sessionData);
        return;
    }

    console.log(`Reference Key: ${referenceKey}`);
    console.log(`Destination: ${destinationAddress}`);

    // Step 2: Execute USDC transfer
    console.log("\n=== Step 2: Execute USDC Transfer ===");

    const coins = await suiClient.getCoins({
        owner: walletAddress,
        coinType: CONFIG.USDC_TYPE,
    });

    if (!coins.data.length) {
        console.error("No USDC coins found");
        return;
    }

    const amountInSmallestUnits = BigInt(1); // 0.000001 USDC

    const tx = new Transaction();
    const coin = coins.data[0];
    const [paymentCoin] = tx.splitCoins(tx.object(coin.coinObjectId), [
        tx.pure.u64(amountInSmallestUnits),
    ]);
    tx.transferObjects([paymentCoin], tx.pure.address(destinationAddress));

    // Include reference key metadata - Beep needs this to correlate the payment
    // Based on Beep's documentation, we need to emit metadata with the referenceKey
    // Unfortunately, without Beep's emit_metadata contract, we can't add this
    // This is a limitation of direct wallet transfers
    console.log("Note: Direct transfers may not be detected by Beep without metadata");

    console.log("Executing transaction...");

    const result = await suiClient.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
    });

    console.log(`TX Digest: ${result.digest}`);

    // Wait for confirmation
    await suiClient.waitForTransaction({ digest: result.digest });
    console.log("Transaction confirmed!");

    // Step 3: Wait a moment for Beep to detect the payment
    console.log("\n=== Step 3: Wait for Beep Detection ===");
    console.log("Waiting 15 seconds (Beep may need time to index on-chain transactions)...");
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Step 4: Verify via Beep Invoice API (server-side method)
    console.log("\n=== Step 4: Verify via Beep Invoice API (Secret Key) ===");

    const invoicesResponse = await fetch(`${CONFIG.BEEP_API_URL}/v1/invoices`, {
        headers: {
            "Authorization": `Bearer ${CONFIG.BEEP_SECRET_KEY}`,
            "Content-Type": "application/json",
        },
    });

    const invoices = await invoicesResponse.json() as Array<{
        uuid: string;
        status: string;
        amount: string;
        amountDecimal: string;
        updatedAt: string;
    }>;

    console.log(`Total invoices: ${invoices.length}`);

    // Find recent paid invoices matching our amount
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const matchingInvoices = invoices.filter(inv => {
        const isPaid = inv.status === "paid";
        const isRecent = inv.updatedAt > fiveMinutesAgo;
        const amountMatches = inv.amount === "1"; // 1 smallest unit
        return isPaid && isRecent && amountMatches;
    });

    console.log(`Matching paid invoices: ${matchingInvoices.length}`);

    if (matchingInvoices.length > 0) {
        console.log("✅ VERIFICATION SUCCESS via Beep Invoice API!");
        console.log("Matching invoice:", JSON.stringify(matchingInvoices[0], null, 2));
    } else {
        console.log("❌ No matching paid invoice found");
        console.log("Checking all recent invoices...");

        const recentInvoices = invoices
            .filter(inv => inv.updatedAt > fiveMinutesAgo)
            .slice(0, 5);

        console.log("Recent invoices:", JSON.stringify(recentInvoices, null, 2));
    }

    // Step 5: Check via getPaymentStatus (client-side method)
    console.log("\n=== Step 5: Check via getPaymentStatus ===");

    const statusResponse = await fetch(`${CONFIG.BEEP_API_URL}/v1/widget/payment-status/${referenceKey}`, {
        headers: {
            "Authorization": `Bearer ${CONFIG.BEEP_PUBLISHABLE_KEY}`,
            "x-beep-client": "beep-sdk",
        },
    });

    const statusData = await statusResponse.json();
    console.log("Payment status:", JSON.stringify(statusData, null, 2));

    if (statusData.paid) {
        console.log("✅ getPaymentStatus confirmed payment!");
    } else {
        console.log("❌ getPaymentStatus says not paid");
    }

    // Summary
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║     Test Summary                                             ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log(`Transaction: ${result.digest}`);
    console.log(`Reference Key: ${referenceKey}`);
    console.log(`Invoice API: ${matchingInvoices.length > 0 ? "✅ PASS" : "❌ FAIL"}`);
    console.log(`getPaymentStatus: ${statusData.paid ? "✅ PASS" : "❌ FAIL"}`);
}

main().catch(console.error);
