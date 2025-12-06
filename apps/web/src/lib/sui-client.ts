import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

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
 * Fetch transaction details by digest from Sui RPC
 */
export async function getTransaction(
  txHash: string,
  chain: string
): Promise<TransactionLookupResult> {
  // Check if this is a mock transaction
  if (txHash.includes("MOCK") || txHash.length < 60) {
    return {
      found: false,
      transaction: null,
      error: "Mock transaction - not a real on-chain transaction",
    };
  }

  try {
    const client = getSuiClient(chain);

    const response = await client.getTransactionBlock({
      digest: txHash,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    });

    const effects = response.effects;
    const status = effects?.status?.status === "success" ? "success" : "failure";

    // Calculate total gas used
    const gasUsed = effects?.gasUsed;
    const computationCost = gasUsed?.computationCost || "0";
    const storageCost = gasUsed?.storageCost || "0";
    const storageRebate = gasUsed?.storageRebate || "0";
    const totalGas =
      BigInt(computationCost) +
      BigInt(storageCost) -
      BigInt(storageRebate);

    return {
      found: true,
      transaction: {
        digest: response.digest,
        status,
        sender: response.transaction?.data?.sender || "Unknown",
        timestamp: response.timestampMs ? parseInt(response.timestampMs) : null,
        gasUsed: {
          computationCost,
          storageCost,
          storageRebate,
          total: totalGas.toString(),
        },
        checkpoint: response.checkpoint || null,
        balanceChanges: (response.balanceChanges || []).map((change) => ({
          owner:
            typeof change.owner === "object" && "AddressOwner" in change.owner
              ? change.owner.AddressOwner
              : "Unknown",
          coinType: change.coinType,
          amount: change.amount,
        })),
        objectChanges: response.objectChanges?.length || 0,
        events: response.events?.length || 0,
      },
      error: null,
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";

    // Handle specific Sui RPC errors
    if (errorMessage.includes("Could not find the referenced transaction")) {
      return {
        found: false,
        transaction: null,
        error: "Transaction not found on chain",
      };
    }

    return {
      found: false,
      transaction: null,
      error: errorMessage,
    };
  }
}

/**
 * Verify that a transaction exists on chain
 */
export async function verifyTransactionOnChain(
  txHash: string,
  chain: string
): Promise<{ exists: boolean; status: "success" | "failure" | "unknown"; error: string | null }> {
  const result = await getTransaction(txHash, chain);

  if (!result.found) {
    return {
      exists: false,
      status: "unknown",
      error: result.error,
    };
  }

  return {
    exists: true,
    status: result.transaction?.status || "unknown",
    error: null,
  };
}

/**
 * Get Sui Explorer URL for a transaction
 */
export function getExplorerUrl(txHash: string, chain: string): string {
  const baseUrl = "https://suiscan.xyz";
  const network = chain === "sui-mainnet" ? "mainnet" : "testnet";
  return `${baseUrl}/${network}/tx/${txHash}`;
}

/**
 * Format gas amount from MIST to SUI (1 SUI = 10^9 MIST)
 */
export function formatGas(mist: string): string {
  const mistBigInt = BigInt(mist);
  const sui = Number(mistBigInt) / 1_000_000_000;
  return sui.toFixed(6);
}
