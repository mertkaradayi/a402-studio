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
