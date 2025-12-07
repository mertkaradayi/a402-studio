"use client";

import {
    useConnectWallet,
    useCurrentAccount,
    useDisconnectWallet,
    useSuiClientContext,
    useWallets,
} from "@mysten/dapp-kit";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

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
                {/* Connected Wallet Card */}
                <div className="flex items-center gap-2 bg-muted/50 border border-input rounded-md px-3 py-1.5 hover:bg-muted transition-colors">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white">
                        {account.address.slice(2, 4).toUpperCase()}
                    </div>
                    <span className="text-sm font-mono text-foreground">
                        {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </span>
                    <button
                        onClick={() => disconnect()}
                        className="ml-1 p-1 text-muted-foreground hover:text-destructive transition-colors rounded"
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
            <Button
                onClick={() => setShowModal(true)}
                variant="neon"
                className="gap-2 font-bold"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Connect Wallet
            </Button>

            {/* Modal - Portal to body for correct fixed positioning */}
            {showModal && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative z-10 bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold tracking-tight">Connect Wallet</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowModal(false)}
                                className="h-8 w-8"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </Button>
                        </div>

                        {/* Wallet List */}
                        <div className="p-4 overflow-y-auto flex-1">
                            {/* Installed Wallets */}
                            {wallets.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                                        Installed
                                    </p>
                                    <div className="space-y-2">
                                        {wallets.map((wallet) => (
                                            <button
                                                key={wallet.name}
                                                onClick={() => {
                                                    connect({ wallet });
                                                    setShowModal(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border/50 bg-card hover:bg-accent hover:text-accent-foreground transition-all group"
                                            >
                                                <img
                                                    src={wallet.icon}
                                                    alt={wallet.name}
                                                    className="w-8 h-8 rounded-lg"
                                                />
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium">{wallet.name}</p>
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Uninstalled Wallets */}
                            {uninstalledWallets.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                                        Not Installed
                                    </p>
                                    <div className="space-y-2">
                                        {uninstalledWallets.map((wallet) => (
                                            <a
                                                key={wallet.name}
                                                href={wallet.downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border/50 bg-card/50 hover:bg-accent hover:text-accent-foreground transition-all group opacity-75 hover:opacity-100"
                                            >
                                                <img src={wallet.icon} alt={wallet.name} className="w-8 h-8 rounded-lg grayscale group-hover:grayscale-0 transition-all" />
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium">{wallet.name}</p>
                                                </div>
                                                <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-border bg-muted/10">
                            <p className="text-xs text-muted-foreground text-center">
                                New to Sui?{" "}
                                <a href="https://sui.io/wallet" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4">
                                    Learn about wallets →
                                </a>
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
