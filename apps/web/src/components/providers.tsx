"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    SuiClientProvider,
    WalletProvider,
    createNetworkConfig,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { ReactNode, useState } from "react";

import "@mysten/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
    testnet: { url: getFullnodeUrl("testnet") },
    mainnet: { url: getFullnodeUrl("mainnet") },
});

// Get default network from environment variable
const defaultNetwork = (process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "mainnet" : "testnet") as "testnet" | "mainnet";

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork={defaultNetwork}>
                <WalletProvider autoConnect>{children}</WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
}

