import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

const defaultNetwork = process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const suiClient = new SuiClient({
  url: getFullnodeUrl(defaultNetwork),
});

/**
 * Lightweight fetch for a transaction block by digest (uses default network env)
 */
export async function fetchTransaction(digest: string) {
  try {
    return await suiClient.getTransactionBlock({
      digest,
      options: {
        showEffects: true,
        showInput: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });
  } catch (error) {
    console.error("[sui-client] Failed to fetch tx", digest, error);
    return null;
  }
}

export interface SuiTransactionDetails {
  digest: string;
  status: "success" | "failure";
  sender: string;
  timestamp: number | null;
  gasUsed: {
    computationCost: string;
    storageCost: string;
    storageRebate: string;
    total: string;
  };
  checkpoint: string | null;
  balanceChanges: Array<{
    owner: string;
    coinType: string;
    amount: string;
  }>;
  objectChanges: number;
  events: number;
}

export interface TransactionLookupResult {
  found: boolean;
  transaction: SuiTransactionDetails | null;
  error: string | null;
}

function getSuiClient(chain: string): SuiClient {
  const network = chain === "sui-mainnet" ? "mainnet" : "testnet";
  return new SuiClient({ url: getFullnodeUrl(network) });
}

/**
 * Fetch transaction details by digest for a given chain
 */
export async function getTransaction(
  txHash: string,
  chain: string
): Promise<TransactionLookupResult> {
  const isMock =
    txHash.includes("MOCK") ||
    txHash.includes("DEMO") ||
    txHash.includes("SIMULATED") ||
    txHash.startsWith("0xDEMO") ||
    txHash.startsWith("0xMOCK");

  if (isMock) {
    return {
      found: false,
      transaction: null,
      error: "Mock transaction - not a real on-chain transaction",
    };
  }

  try {
    const client = getSuiClient(chain);
    const result = await client.getTransactionBlock({
      digest: txHash,
      options: {
        showEffects: true,
        showInput: true,
        showEvents: true,
        showBalanceChanges: true,
        showObjectChanges: true,
      },
    });

    const status = result.effects?.status?.status === "success" ? "success" : "failure";
    return {
      found: true,
      transaction: {
        digest: result.digest,
        status,
        sender: result.transaction?.data?.sender || "",
        timestamp: result.timestampMs ? Number(result.timestampMs) : null,
        gasUsed: {
          computationCost: result.effects?.gasUsed?.computationCost?.toString?.() || "0",
          storageCost: result.effects?.gasUsed?.storageCost?.toString?.() || "0",
          storageRebate: result.effects?.gasUsed?.storageRebate?.toString?.() || "0",
          total:
            result.effects?.gasUsed?.computationCost &&
              result.effects?.gasUsed?.storageCost &&
              result.effects?.gasUsed?.storageRebate
              ? (
                BigInt(result.effects.gasUsed.computationCost) +
                BigInt(result.effects.gasUsed.storageCost) -
                BigInt(result.effects.gasUsed.storageRebate)
              ).toString()
              : "0",
        },
        checkpoint: result.checkpoint || null,
        balanceChanges:
          result.balanceChanges?.map((bc) => ({
            owner: typeof bc.owner === "string" ? bc.owner : JSON.stringify(bc.owner),
            coinType: bc.coinType || "",
            amount: bc.amount || "0",
          })) || [],
        objectChanges: result.objectChanges?.length || 0,
        events: result.events?.length || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("[sui-client] getTransaction error", txHash, error);
    return { found: false, transaction: null, error: error instanceof Error ? error.message : String(error) };
  }
}

function normalizeOwner(owner: string): string {
  if (!owner) return "";
  try {
    const parsed = JSON.parse(owner);
    if (parsed.AddressOwner) return String(parsed.AddressOwner).toLowerCase();
    if (parsed.ObjectOwner) return String(parsed.ObjectOwner).toLowerCase();
  } catch {
    // plain string owner
  }
  return owner.toLowerCase();
}

function toBaseUnits(amount?: string | number | null, decimals = 6): bigint | null {
  if (amount === null || amount === undefined) return null;
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) return null;
  return BigInt(Math.round(numeric * 10 ** decimals));
}

export function getSuiExplorerUrl(digest: string, chain: string) {
  const network = chain === "sui-mainnet" || chain === "mainnet" ? "mainnet" : "testnet";
  return `https://suiexplorer.com/txblock/${digest}?network=${network}`;
}

export interface OnChainVerificationResult {
  verified: boolean;
  status: "success" | "failure" | "not_found";
  message?: string;
  explorerUrl: string;
  transaction: SuiTransactionDetails | null;
  checks: {
    found: boolean;
    statusSuccess: boolean;
    recipientMatch?: boolean;
    amountMatch?: boolean;
  };
}

/**
 * Verify a Sui payment on-chain via Mysten RPC
 */
export async function verifyOnChainPayment({
  txHash,
  chain,
  expectedAmount,
  expectedRecipient,
}: {
  txHash: string;
  chain: string;
  expectedAmount?: string | number;
  expectedRecipient?: string;
}): Promise<OnChainVerificationResult> {
  const explorerUrl = getSuiExplorerUrl(txHash, chain);
  const lookup = await getTransaction(txHash, chain);

  const checks: OnChainVerificationResult["checks"] = {
    found: lookup.found,
    statusSuccess: false,
  };

  if (!lookup.found || !lookup.transaction) {
    return {
      verified: false,
      status: "not_found",
      message: lookup.error || "Transaction not found on chain",
      explorerUrl,
      transaction: null,
      checks,
    };
  }

  const transaction = lookup.transaction;
  checks.statusSuccess = transaction.status === "success";

  const normalizedRecipient = expectedRecipient?.toLowerCase();
  const expectedAmountBase = toBaseUnits(expectedAmount ?? null, 6);
  let recipientMatch: boolean | undefined;
  let amountMatch: boolean | undefined;

  if (normalizedRecipient) {
    const recipientChange = transaction.balanceChanges?.find(
      (bc) => normalizeOwner(bc.owner) === normalizedRecipient
    );

    if (recipientChange) {
      recipientMatch = true;
      if (expectedAmountBase !== null) {
        amountMatch = BigInt(recipientChange.amount || "0") >= expectedAmountBase;
      }
    } else {
      recipientMatch = false;
    }
  }

  if (typeof recipientMatch === "boolean") {
    checks.recipientMatch = recipientMatch;
  }
  if (typeof amountMatch === "boolean") {
    checks.amountMatch = amountMatch;
  }

  const verified =
    checks.found &&
    checks.statusSuccess &&
    (checks.recipientMatch !== false) &&
    (checks.amountMatch !== false);

  return {
    verified,
    status: verified ? "success" : "failure",
    message: verified
      ? "On-chain transaction is confirmed"
      : lookup.error || "On-chain verification failed",
    explorerUrl,
    transaction,
    checks,
  };
}
