"use client";

import {
    ConnectButton,
    useCurrentAccount,
    useDisconnectWallet,
    useSuiClientContext,
} from "@mysten/dapp-kit";
import { cn } from "@/lib/utils";

export function WalletButton() {
    const account = useCurrentAccount();
    const { mutate: disconnect } = useDisconnectWallet();
    const { network } = useSuiClientContext();

    if (account) {
        return (
            <div className="flex items-center gap-3">
                {/* Network Badge */}
                <span
                    className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        network === "mainnet"
                            ? "bg-neon-green/20 text-neon-green"
                            : "bg-neon-yellow/20 text-neon-yellow"
                    )}
                >
                    {network}
                </span>

                {/* Address */}
                <span className="text-sm text-muted-foreground font-mono">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>

                {/* Disconnect Button */}
                <button
                    onClick={() => disconnect()}
                    className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-white border border-border rounded-md hover:border-neon-pink transition-colors"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <ConnectButton
            className="!bg-neon-pink !text-black !px-4 !py-2 !rounded-md !font-medium !text-sm hover:!opacity-90 !transition-opacity !border-none"
        />
    );
}
