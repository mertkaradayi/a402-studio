/**
 * E2E Test Script for Beep SDK Verification Flow
 *
 * This script:
 * 1. Creates a Beep payment session
 * 2. Executes a USDC transfer on Sui mainnet
 * 3. Creates a receipt
 * 4. Tests verification via both Beep polling and on-chain
 *
 * Required environment variables:
 *   BEEP_PUBLISHABLE_KEY - Beep publishable key (beep_pk_...)
 *   SUI_PRIVATE_KEY - Sui wallet private key for test transactions
 *   API_URL - Backend API URL (optional, defaults to localhost)
 *
 * Run with: npx tsx scripts/test-beep-verification.ts
 */

import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import "dotenv/config";

// Validate required environment variables
function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        console.error(`❌ Missing required environment variable: ${name}`);
        console.error(`   Set it in .env file or export ${name}=value`);
        process.exit(1);
    }
    return value;
}

// Configuration from environment variables
const CONFIG = {
    // Beep API
    BEEP_API_URL: process.env.BEEP_API_URL || "https://api.justbeep.it",
    BEEP_PUBLISHABLE_KEY: requireEnv("BEEP_PUBLISHABLE_KEY"),

    // Our API
    API_URL: process.env.API_URL || "http://localhost:3001",

    // Sui
    SUI_NETWORK: "mainnet" as const,
    USDC_TYPE: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",

    // Test amount (smallest possible)
    AMOUNT: "0.000001",

    // Private key for test wallet
    PRIVATE_KEY: requireEnv("SUI_PRIVATE_KEY"),
};

// Types
interface PaymentSession {
    referenceKey: string;
    paymentUrl: string;
    destinationAddress: string;
    amount: string;
}

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

// Helper to create keypair from Sui private key
function createKeypair(privateKey: string): Ed25519Keypair {
    const { secretKey } = decodeSuiPrivateKey(privateKey);
    return Ed25519Keypair.fromSecretKey(secretKey);
}

// Step 1: Create Beep payment session
async function createPaymentSession(): Promise<PaymentSession> {
    console.log("\n=== Step 1: Creating Beep Payment Session ===");

    const response = await fetch(`${CONFIG.BEEP_API_URL}/v1/widget/payment-session`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${CONFIG.BEEP_PUBLISHABLE_KEY}`,
            "x-beep-client": "beep-sdk",
        },
        body: JSON.stringify({
            assets: [{
                name: "E2E Test Payment",
                price: CONFIG.AMOUNT,
                quantity: 1,
            }],
            paymentLabel: "E2E Test - Verification Debug",
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create payment session: ${response.status} - ${error}`);
    }

    const session = await response.json();
    console.log("✅ Payment session created:");
    console.log("   Reference Key:", session.referenceKey);
    console.log("   Destination:", session.destinationAddress);
    console.log("   Amount:", CONFIG.AMOUNT, "USDC");

    return {
        referenceKey: session.referenceKey,
        paymentUrl: session.paymentUrl || "",
        destinationAddress: session.destinationAddress,
        amount: CONFIG.AMOUNT,
    };
}

// Step 2: Execute USDC transfer on Sui
async function executePayment(session: PaymentSession, keypair: Ed25519Keypair): Promise<string> {
    console.log("\n=== Step 2: Executing USDC Transfer ===");

    const client = new SuiClient({ url: getFullnodeUrl(CONFIG.SUI_NETWORK) });
    const address = keypair.getPublicKey().toSuiAddress();

    console.log("   Payer address:", address);
    console.log("   Destination:", session.destinationAddress);

    // Get USDC coins
    const coins = await client.getCoins({
        owner: address,
        coinType: CONFIG.USDC_TYPE,
    });

    if (!coins.data.length) {
        throw new Error("No USDC coins found in wallet");
    }

    console.log("   Found", coins.data.length, "USDC coin(s)");

    // Convert amount to smallest units (6 decimals)
    const amountInSmallestUnits = BigInt(Math.floor(parseFloat(session.amount) * 1_000_000));
    console.log("   Amount in smallest units:", amountInSmallestUnits.toString());

    // Find coin with enough balance
    const coinToUse = coins.data.find(c => BigInt(c.balance) >= amountInSmallestUnits);
    if (!coinToUse) {
        throw new Error(`Insufficient USDC balance. Need ${session.amount} USDC`);
    }

    console.log("   Using coin:", coinToUse.coinObjectId.slice(0, 20) + "...");
    console.log("   Coin balance:", (Number(coinToUse.balance) / 1_000_000).toFixed(6), "USDC");

    // Build transaction
    const tx = new Transaction();
    const [paymentCoin] = tx.splitCoins(tx.object(coinToUse.coinObjectId), [
        tx.pure.u64(amountInSmallestUnits),
    ]);
    tx.transferObjects([paymentCoin], tx.pure.address(session.destinationAddress));

    console.log("   Signing and executing transaction...");

    // Execute
    const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
    });

    console.log("✅ Transaction executed:");
    console.log("   TX Digest:", result.digest);
    console.log("   View on explorer: https://suiscan.xyz/mainnet/tx/" + result.digest);

    // Wait for confirmation
    console.log("   Waiting for confirmation...");
    await client.waitForTransaction({ digest: result.digest });
    console.log("   Transaction confirmed!");

    return result.digest;
}

// Step 3: Check Beep payment status
async function checkBeepPaymentStatus(referenceKey: string): Promise<{ paid: boolean; status: string }> {
    console.log("\n=== Step 3: Checking Beep Payment Status ===");

    const response = await fetch(`${CONFIG.BEEP_API_URL}/v1/widget/payment-status/${referenceKey}`, {
        headers: {
            "Authorization": `Bearer ${CONFIG.BEEP_PUBLISHABLE_KEY}`,
            "x-beep-client": "beep-sdk",
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to check payment status: ${response.status} - ${error}`);
    }

    const status = await response.json();
    console.log("   Beep status response:", JSON.stringify(status));

    return status;
}

// Step 4: Create receipt
function createReceipt(session: PaymentSession, txHash: string, payerAddress: string): Receipt {
    console.log("\n=== Step 4: Creating Receipt ===");

    const receipt: Receipt = {
        id: `rcpt_${Date.now()}`,
        requestNonce: session.referenceKey,
        payer: payerAddress,
        merchant: session.destinationAddress,
        amount: session.amount,
        asset: "USDC",
        chain: "sui-mainnet",
        txHash: txHash,
        signature: `beep_sdk_${session.referenceKey}_${txHash.slice(0, 8)}`,
        issuedAt: Math.floor(Date.now() / 1000),
    };

    console.log("   Receipt created:");
    console.log(JSON.stringify(receipt, null, 2));

    return receipt;
}

// Step 5: Test on-chain verification
async function testOnChainVerification(receipt: Receipt, challenge: any): Promise<void> {
    console.log("\n=== Step 5: Testing On-Chain Verification ===");

    const url = `${CONFIG.API_URL}/a402/verify-onchain`;
    console.log("   Calling:", url);
    console.log("   Request body:", JSON.stringify({ receipt, challenge }, null, 2));

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ receipt, challenge }),
    });

    console.log("   Response status:", response.status);

    const data = await response.json();
    console.log("   Response:", JSON.stringify(data, null, 2));

    if (data.valid) {
        console.log("✅ On-chain verification PASSED");
    } else {
        console.log("❌ On-chain verification FAILED");
        console.log("   Errors:", data.errors);
        console.log("   Checks:", data.checks);
    }
}

// Step 6: Test txHash validation regex
function testTxHashRegex(txHash: string): void {
    console.log("\n=== Step 6: Testing TxHash Regex ===");

    const regex = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;
    const isValid = regex.test(txHash);

    console.log("   TxHash:", txHash);
    console.log("   Length:", txHash.length);
    console.log("   Regex test result:", isValid);

    // Test each character
    const invalidChars: string[] = [];
    for (const char of txHash) {
        if (!/[1-9A-HJ-NP-Za-km-z]/.test(char)) {
            invalidChars.push(char);
        }
    }

    if (invalidChars.length > 0) {
        console.log("   Invalid characters found:", invalidChars);
    } else {
        console.log("   All characters are valid base58");
    }
}

// Main test flow
async function main() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║     Beep SDK Verification E2E Test                         ║");
    console.log("╚════════════════════════════════════════════════════════════╝");

    try {
        // Initialize keypair
        const keypair = createKeypair(CONFIG.PRIVATE_KEY);
        const payerAddress = keypair.getPublicKey().toSuiAddress();
        console.log("\nPayer wallet address:", payerAddress);

        // Step 1: Create payment session
        const session = await createPaymentSession();

        // Step 2: Execute payment
        const txHash = await executePayment(session, keypair);

        // Step 3: Check Beep status (may not be confirmed yet)
        const beepStatus = await checkBeepPaymentStatus(session.referenceKey);
        console.log("   Beep paid:", beepStatus.paid);

        // Step 4: Create receipt
        const receipt = createReceipt(session, txHash, payerAddress);

        // Create challenge object (simulating what the frontend has)
        const challenge = {
            amount: session.amount,
            asset: "USDC",
            chain: "sui-mainnet",
            recipient: session.destinationAddress,
            nonce: session.referenceKey,
            expiry: Math.floor(Date.now() / 1000) + 3600,
        };

        console.log("\n   Challenge object:");
        console.log(JSON.stringify(challenge, null, 2));

        // Step 5: Test on-chain verification
        await testOnChainVerification(receipt, challenge);

        // Step 6: Test regex
        testTxHashRegex(txHash);

        // Wait a bit and check Beep again
        console.log("\n=== Waiting 5 seconds and checking Beep again ===");
        await new Promise(resolve => setTimeout(resolve, 5000));
        const beepStatus2 = await checkBeepPaymentStatus(session.referenceKey);
        console.log("   Beep paid (after wait):", beepStatus2.paid);

        console.log("\n╔════════════════════════════════════════════════════════════╗");
        console.log("║     Test Complete!                                          ║");
        console.log("╚════════════════════════════════════════════════════════════╝");

    } catch (error) {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    }
}

main();
