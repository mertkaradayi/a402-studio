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

// All supported Sui wallets with their info
const SUPPORTED_WALLETS = [
    {
        id: "sui",
        name: "Sui Wallet",
        downloadUrl: "https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect fill='%234DA2FF' width='36' height='36' rx='8'/%3E%3Cpath fill='white' d='M22.5 10.5h-9a3 3 0 00-3 3v9a3 3 0 003 3h9a3 3 0 003-3v-9a3 3 0 00-3-3zm-4.5 10.5a3 3 0 110-6 3 3 0 010 6z'/%3E%3C/svg%3E",
    },
    {
        id: "suiet",
        name: "Suiet",
        downloadUrl: "https://suiet.app/",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect fill='%236FBCF0' width='36' height='36' rx='8'/%3E%3Cpath fill='white' d='M18 8l8 14H10z'/%3E%3C/svg%3E",
    },
    {
        id: "martian",
        name: "Martian",
        downloadUrl: "https://martianwallet.xyz/",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect fill='%23FF5733' width='36' height='36' rx='8'/%3E%3Ccircle fill='white' cx='18' cy='18' r='8'/%3E%3C/svg%3E",
    },
    {
        id: "ethos",
        name: "Ethos",
        downloadUrl: "https://ethoswallet.xyz/",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect fill='%236366F1' width='36' height='36' rx='8'/%3E%3Cpath fill='white' d='M10 12h16v3H10zm0 5h12v3H10zm0 5h16v3H10z'/%3E%3C/svg%3E",
    },
    {
        id: "nightly",
        name: "Nightly",
        downloadUrl: "https://nightly.app/",
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect fill='%231A1A2E' width='36' height='36' rx='8'/%3E%3Ccircle fill='%23F0E68C' cx='18' cy='18' r='6'/%3E%3C/svg%3E",
    },
];

export function WalletButton() {
    const account = useCurrentAccount();
    const { mutate: disconnect } = useDisconnectWallet();
    const { mutate: connect } = useConnectWallet();
    const { network } = useSuiClientContext();
    const wallets = useWallets();
    const [showModal, setShowModal] = useState(false);

    // Get installed wallet names for comparison
    const installedWalletNames = wallets.map((w) => w.name.toLowerCase());

    // Filter supported wallets to find uninstalled ones
    const uninstalledWallets = SUPPORTED_WALLETS.filter(
        (sw) => !installedWalletNames.some((name) =>
            name.includes(sw.id) || name.includes(sw.name.toLowerCase().split(" ")[0].toLowerCase())
        )
    );

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
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center text-[10px] font-bold text-black">
                        {account.address.slice(2, 4).toUpperCase()}
                    </div>
                    <span className="text-sm text-white font-mono">
                        {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </span>
                    <button
                        onClick={() => disconnect()}
                        className="ml-1 p-1 text-muted-foreground hover:text-neon-pink transition-colors rounded"
                        title="Disconnect Wallet"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Connect Button */}
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-neon-pink text-black px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-all glow-pink"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Connect Wallet
            </button>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-background border border-neon-pink/30 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden glow-pink">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-neon-pink/10 to-neon-cyan/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-pink to-neon-cyan flex items-center justify-center">
                                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold text-white">Connect Wallet</h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 text-muted-foreground hover:text-neon-pink transition-colors rounded-lg hover:bg-neon-pink/10"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Wallet List */}
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {/* Installed Wallets */}
                            {wallets.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-medium text-neon-green uppercase tracking-wider mb-2 px-2">
                                        Installed
                                    </p>
                                    <div className="space-y-1">
                                        {wallets.map((wallet) => (
                                            <button
                                                key={wallet.name}
                                                onClick={() => {
                                                    connect({ wallet });
                                                    setShowModal(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent hover:border-neon-green/40 hover:bg-neon-green/10 transition-all group"
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={wallet.icon}
                                                        alt={wallet.name}
                                                        className="w-10 h-10 rounded-xl transition-transform group-hover:scale-110"
                                                    />
                                                    {/* Glow ring on hover */}
                                                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-neon-green/50 transition-all" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{wallet.name}</p>
                                                    <p className="text-xs text-muted-foreground group-hover:text-neon-green/70 transition-colors">
                                                        {wallet.accounts.length > 0 ? `${wallet.accounts.length} account(s)` : "Click to connect"}
                                                    </p>
                                                </div>
                                                {/* Green dot that grows on hover */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-neon-green opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Connect
                                                    </span>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-neon-green animate-pulse group-hover:scale-125 transition-transform" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Uninstalled Wallets */}
                            {uninstalledWallets.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-neon-yellow uppercase tracking-wider mb-2 px-2">
                                        {wallets.length > 0 ? "More Wallets" : "Get a Wallet"}
                                    </p>
                                    <div className="space-y-1">
                                        {uninstalledWallets.map((wallet) => (
                                            <a
                                                key={wallet.name}
                                                href={wallet.downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent hover:border-neon-cyan/30 hover:bg-neon-cyan/5 transition-all group"
                                            >
                                                <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 rounded-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{wallet.name}</p>
                                                    <p className="text-xs text-muted-foreground">Not installed</p>
                                                </div>
                                                {/* Hollow dot for uninstalled */}
                                                <div className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground/50 group-hover:border-neon-cyan transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-border bg-card/50">
                            <p className="text-xs text-muted-foreground text-center">
                                New to Sui?{" "}
                                <a href="https://sui.io/wallet" target="_blank" rel="noopener noreferrer" className="text-neon-pink hover:underline">
                                    Learn about wallets →
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
