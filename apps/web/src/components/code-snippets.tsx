"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

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
      primaryColor="#a855f7"
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
        <div className="bg-black/50 rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-black/30">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span className="text-xs font-medium text-white">Integration Code</span>
                </div>
                <button
                    onClick={handleCopy}
                    className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all",
                        copied
                            ? "bg-green-500/20 text-green-400"
                            : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
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
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                {(Object.keys(codeExamples) as CodeType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={cn(
                            "flex-1 px-3 py-2 text-xs font-medium transition-all",
                            activeTab === type
                                ? "bg-purple-500/20 text-purple-400 border-b-2 border-purple-500"
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                    >
                        {codeExamples[type].label}
                    </button>
                ))}
            </div>

            {/* Code Block */}
            <div className="p-4 overflow-x-auto max-h-64 overflow-y-auto">
                <pre className="text-xs font-mono text-gray-300 whitespace-pre">
                    {codeExamples[activeTab].code}
                </pre>
            </div>

            {/* Footer Note */}
            {referenceKey && (
                <div className="px-4 py-2 border-t border-border bg-purple-500/5">
                    <p className="text-[10px] text-muted-foreground">
                        <span className="text-purple-400 font-medium">Tip:</span> Your last payment reference:{" "}
                        <code className="text-purple-400">{referenceKey.slice(0, 20)}...</code>
                    </p>
                </div>
            )}
        </div>
    );
}
