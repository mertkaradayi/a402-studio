"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WebhookPreviewProps {
    referenceKey: string;
    amount: string;
    status: string;
}

export function WebhookPreview({ referenceKey, amount, status }: WebhookPreviewProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"payload" | "code">("payload");
    const [copied, setCopied] = useState(false);

    const webhookPayload = {
        event: "payment.completed",
        timestamp: new Date().toISOString(),
        data: {
            referenceKey,
            status,
            amount: parseFloat(amount),
            asset: "USDC",
            chain: "sui",
            payer: "0x9b8d7c6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c",
            merchant: "0xa8c3e5f2d1b4c3e5f2d1b4a8c3e5f2d1b4c3e5f2",
            txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        },
        signature: "sha256=abc123...",
    };

    const verificationCode = `// Verify webhook signature (Node.js)
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return \`sha256=\${expected}\` === signature;
}

// In your webhook handler:
app.post('/webhook/beep', (req, res) => {
  const signature = req.headers['x-beep-signature'];
  
  if (!verifyWebhook(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const { event, data } = req.body;
  
  if (event === 'payment.completed') {
    // Fulfill the order
    console.log('Payment received:', data.referenceKey);
    console.log('Amount:', data.amount, data.asset);
  }
  
  res.json({ received: true });
});`;

    const handleCopy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Card className="border-accent/30 bg-accent/5 mt-3">
            <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center justify-between text-xs">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <svg
                            className={cn(
                                "w-3 h-3 text-muted-foreground transition-transform",
                                isOpen ? "rotate-90" : ""
                            )}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="font-semibold text-accent">Webhook Preview</span>
                    </button>
                    <span className="text-[10px] text-muted-foreground">
                        What your server would receive
                    </span>
                </CardTitle>
            </CardHeader>

            {isOpen && (
                <CardContent className="px-3 pb-3 space-y-3 animate-in slide-in-from-top-2">
                    {/* Tabs */}
                    <div className="flex gap-1 p-0.5 bg-muted rounded-md">
                        <button
                            onClick={() => setActiveTab("payload")}
                            className={cn(
                                "flex-1 px-2 py-1 text-xs rounded transition-all",
                                activeTab === "payload"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Payload
                        </button>
                        <button
                            onClick={() => setActiveTab("code")}
                            className={cn(
                                "flex-1 px-2 py-1 text-xs rounded transition-all",
                                activeTab === "code"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Verification Code
                        </button>
                    </div>

                    {/* Content */}
                    <div className="relative">
                        <div className="bg-muted/30 rounded-lg p-3 overflow-x-auto max-h-64 overflow-y-auto scrollbar-thin">
                            <pre className="text-[10px] font-mono text-muted-foreground leading-relaxed whitespace-pre">
                                {activeTab === "payload"
                                    ? JSON.stringify(webhookPayload, null, 2)
                                    : verificationCode}
                            </pre>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(
                                activeTab === "payload"
                                    ? JSON.stringify(webhookPayload, null, 2)
                                    : verificationCode
                            )}
                            className="absolute top-2 right-2 h-6 px-2 text-[10px]"
                        >
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                    </div>

                    {/* Headers info */}
                    {activeTab === "payload" && (
                        <div className="text-[10px] text-muted-foreground space-y-1">
                            <p className="font-medium">HTTP Headers:</p>
                            <div className="font-mono bg-muted/30 rounded p-2 space-y-0.5">
                                <p>Content-Type: application/json</p>
                                <p>X-Beep-Signature: sha256=abc123...</p>
                                <p>X-Beep-Timestamp: {Date.now()}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
