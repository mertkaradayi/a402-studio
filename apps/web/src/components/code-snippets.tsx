"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CodeSnippetsProps {
    amount: string;
    description: string;
    referenceKey?: string;
}

type CodeType = "react" | "vanilla" | "node";

export function CodeSnippets({ amount, description, referenceKey }: CodeSnippetsProps) {
    const [activeTab, setActiveTab] = useState<CodeType>("react");
    const [copied, setCopied] = useState(false);

    const publishableKey = "beep_pk_YOUR_KEY";

    const codeExamples: Record<CodeType, { label: string; code: string }> = {
        react: {
            label: "React",
            code: `import { CheckoutWidget } from "@beep-it/checkout-widget";

function PaymentButton() {
  const handleSuccess = (data) => {
    console.log("Payment verified!", data.referenceKey);
    // Grant access to your service
  };

  return (
    <CheckoutWidget
      publishableKey="${publishableKey}"
      primaryColor="#FF00ED" 
      assets={[{
        name: "${description}",
        price: "${amount}",
        quantity: 1,
      }]}
      onPaymentSuccess={handleSuccess}
      onPaymentError={(err) => console.error(err)}
    />
  );
}`,
        },
        vanilla: {
            label: "JavaScript",
            code: `import { BeepPublicClient } from "@beep-it/sdk-core";

const beep = new BeepPublicClient({
  publishableKey: "${publishableKey}",
});

// 1. Create payment session
const session = await beep.widget.createPaymentSession({
  assets: [{
    name: "${description}",
    price: "${amount}",
    quantity: 1,
  }],
  paymentLabel: "My App Payment",
});

console.log("Payment URL:", session.paymentUrl);
console.log("Reference Key:", session.referenceKey);

// 2. Poll for payment completion
const result = await beep.widget.waitForPaid(
  session.referenceKey,
  { intervalMs: 3000, timeoutMs: 300000 }
);

if (result.paid) {
  console.log("Payment verified!");
}`,
        },
        node: {
            label: "Node.js",
            code: `// Server-side with secret key
import { BeepClient } from "@beep-it/sdk-core";

const beep = new BeepClient({
  apiKey: "beep_sk_YOUR_SECRET_KEY",
});

// Create an invoice
const invoice = await beep.invoices.create({
  amountUsd: ${amount},
  description: "${description}",
  expiresInMinutes: 30,
});

console.log("Invoice ID:", invoice.id);
console.log("Payment URL:", invoice.paymentUrl);

// Check payment status
const status = await beep.payments.getStatus(invoice.id);
console.log("Paid:", status.paid);`,
        },
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeExamples[activeTab].code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="overflow-hidden border-border bg-card">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span className="text-xs font-medium text-foreground">Integration Code</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className={cn(
                        "h-6 px-2 text-[10px] gap-1.5 transition-all",
                        copied ? "text-neon-green hover:text-neon-green bg-neon-green/10" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {copied ? (
                        <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                        </>
                    )}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/10">
                {(Object.keys(codeExamples) as CodeType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={cn(
                            "flex-1 px-3 py-2 text-[10px] font-medium transition-all border-b-2",
                            activeTab === type
                                ? "border-primary text-primary bg-primary/5"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
                        )}
                    >
                        {codeExamples[type].label}
                    </button>
                ))}
            </div>

            {/* Code Block */}
            <div className="p-0 overflow-x-auto max-h-64 overflow-y-auto bg-muted/5">
                <pre className="p-4 text-[10px] font-mono text-muted-foreground leading-relaxed whitespace-pre selection:bg-primary/20 selection:text-primary">
                    {codeExamples[activeTab].code}
                </pre>
            </div>

            {/* Footer Note */}
            {referenceKey && (
                <div className="px-3 py-2 border-t border-border bg-primary/5">
                    <p className="text-[10px] text-muted-foreground">
                        <span className="text-primary font-medium">Tip:</span> Your last payment reference:{" "}
                        <code className="text-primary bg-primary/10 px-1 py-0.5 rounded ml-1">{referenceKey.slice(0, 20)}...</code>
                    </p>
                </div>
            )}
        </Card>
    );
}
