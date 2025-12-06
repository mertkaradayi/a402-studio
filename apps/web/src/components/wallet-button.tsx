"use client";

import {
    useConnectWallet,
    useCurrentAccount,
    useDisconnectWallet,
    useSuiClientContext,
    useWallets,
} from "@mysten/dapp-kit";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function WalletButton() {
    const account = useCurrentAccount();
    const { mutate: disconnect } = useDisconnectWallet();
    const { mutate: connect } = useConnectWallet();
    const { network } = useSuiClientContext();
    const wallets = useWallets();
    const [showWalletList, setShowWalletList] = useState(false);

    if (account) {
        return (
            <div className="flex items-center gap-2">
                {/* Network Badge */}
                <div
                    className={cn(
                        "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border",
                        network === "mainnet"
                            ? "bg-neon-green/10 text-neon-green border-neon-green/30"
                            : "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30"
                    )}
                >
                    <span
                        className={cn(
                            "w-1.5 h-1.5 rounded-full animate-pulse",
                            network === "mainnet" ? "bg-neon-green" : "bg-neon-yellow"
                        )}
                    />
                    {network}
                </div>

                {/* Connected Wallet Card */}
                <div className="flex items-center gap-2 bg-card/50 border border-border rounded-lg px-3 py-1.5">
                    {/* Wallet Icon */}
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center text-[10px] font-bold text-black">
                        {account.address.slice(2, 4).toUpperCase()}
                    </div>

                    {/* Address */}
                    <span className="text-sm text-white font-mono">
                        {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </span>

                    {/* Disconnect Button */}
                    <button
                        onClick={() => disconnect()}
                        className="ml-1 p-1 text-muted-foreground hover:text-neon-pink transition-colors rounded"
                        title="Disconnect Wallet"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 0 01-3-3V7a3 0 013-3h4a3 0 013 3v1"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Connect Button */}
            <button
                onClick={() => setShowWalletList(!showWalletList)}
                className="flex items-center gap-2 bg-neon-pink text-black px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-all glow-pink"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                Connect Wallet
            </button>

            {/* Wallet Dropdown */}
            {showWalletList && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowWalletList(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-medium text-white">Select Wallet</p>
                            <p className="text-xs text-muted-foreground">
                                Choose a wallet to connect
                            </p>
                        </div>

                        <div className="py-2">
                            {wallets.length === 0 ? (
                                <div className="px-4 py-6 text-center">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        No wallets detected
                                    </p>
                                    <a
                                        href="https://suiwallet.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-neon-cyan hover:underline"
                                    >
                                        Install Sui Wallet →
                                    </a>
                                </div>
                            ) : (
                                wallets.map((wallet) => (
                                    <button
                                        key={wallet.name}
                                        onClick={() => {
                                            connect({ wallet });
                                            setShowWalletList(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                                    >
                                        <img
                                            src={wallet.icon}
                                            alt={wallet.name}
                                            className="w-8 h-8 rounded-lg"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {wallet.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {wallet.accounts.length > 0
                                                    ? `${wallet.accounts.length} account(s)`
                                                    : "Click to connect"}
                                            </p>
                                        </div>
                                        <svg
                                            className="w-4 h-4 text-muted-foreground ml-auto"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
