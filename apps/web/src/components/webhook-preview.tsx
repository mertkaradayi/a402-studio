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
        <Card className="border-l-4 border-l-purple-500 bg-card shadow-md my-4 overflow-hidden border-border/50">
            <div className="bg-purple-500/10 border-b border-purple-500/20 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-purple-500/20 rounded-md text-purple-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-purple-500 tracking-wide uppercase">Webhook Simulation</h3>
                        <p className="text-[10px] text-muted-foreground">
                            What your server receives
                        </p>
                    </div>
                </div>
            </div>

            <CardContent className="px-3 py-3 space-y-3">
                {/* Tabs */}
                <div className="flex gap-1 p-0.5 bg-muted rounded-md w-full">
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
                        <pre className="text-[10px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
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
        </Card>
    );
}
