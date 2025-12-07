"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeExportProps {
    amount: string;
    description: string;
    referenceKey?: string;
}

type Language = "curl" | "react";

export function CodeExport({ amount, description, referenceKey }: CodeExportProps) {
    const [activeLanguage, setActiveLanguage] = useState<Language>("react");
    const [copied, setCopied] = useState(false);

    const curlCode = `# Create payment session
curl -X POST https://api.justbeep.it/v1/widget/payment-session \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer beep_pk_YOUR_KEY" \\
  -d '{
    "assets": [{
      "name": "${description}",
      "price": "${amount}",
      "quantity": 1
    }],
    "paymentLabel": "My Store"
  }'

# Check payment status
curl https://api.justbeep.it/v1/widget/payment-status/${referenceKey || "REFERENCE_KEY"} \\
  -H "Authorization: Bearer beep_pk_YOUR_KEY"`;

    const reactCode = `import { CheckoutWidget } from '@beep-it/checkout-widget';

function PaymentPage() {
  const handleSuccess = (data) => {
    console.log('Payment completed:', data.referenceKey);
    // Redirect to success page or fulfill order
  };

  const handleError = (error) => {
    console.error('Payment failed:', error);
  };

  return (
    <CheckoutWidget
      publishableKey="beep_pk_YOUR_KEY"
      assets={[{
        name: "${description}",
        price: "${amount}",
        quantity: 1
      }]}
      labels={{
        scanQr: "Scan to pay with Sui wallet",
        paymentLabel: "My Store"
      }}
      onPaymentSuccess={handleSuccess}
      onPaymentError={handleError}
      primaryColor="#FF00ED"
    />
  );
}`;

    const getCode = () => {
        switch (activeLanguage) {
            case "curl": return curlCode;
            case "react": return reactCode;
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(getCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="space-y-3">
            {/* Language Tabs */}
            <div className="flex items-center justify-between">
                <div className="flex gap-1 p-0.5 bg-muted rounded-md">
                    <button
                        onClick={() => setActiveLanguage("react")}
                        className={cn(
                            "px-3 py-1 text-xs rounded transition-all flex items-center gap-1.5",
                            activeLanguage === "react"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="2.5" />
                            <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(60 12 12)" />
                            <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(120 12 12)" />
                        </svg>
                        React
                    </button>
                    <button
                        onClick={() => setActiveLanguage("curl")}
                        className={cn(
                            "px-3 py-1 text-xs rounded transition-all flex items-center gap-1.5",
                            activeLanguage === "curl"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        cURL
                    </button>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 px-2 text-xs"
                >
                    {copied ? (
                        <span className="flex items-center gap-1 text-neon-green">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                        </span>
                    ) : (
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                        </span>
                    )}
                </Button>
            </div>

            {/* Code Block */}
            <div className="bg-muted/30 rounded-lg p-3 overflow-x-auto max-h-72 overflow-y-auto scrollbar-thin border border-border">
                <pre className="text-[11px] font-mono text-muted-foreground leading-relaxed whitespace-pre">
                    {getCode()}
                </pre>
            </div>

            {/* Tip */}
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Replace <code className="bg-muted px-1 rounded">beep_pk_YOUR_KEY</code> with your publishable key
            </p>
        </div>
    );
}
