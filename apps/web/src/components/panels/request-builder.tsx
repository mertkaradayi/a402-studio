"use client";

import { useFlowStore } from "@/stores/flow-store";

export function RequestBuilder() {
  const { requestConfig, setRequestConfig, setChallenge, addDebugLog, isLoading, setLoading } =
    useFlowStore();

  const handleSendRequest = async () => {
    setLoading(true);
    addDebugLog("info", `Requesting 402 challenge from ${requestConfig.targetUrl}`);

    // TODO: Replace with real API call to backend
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockChallenge = {
      amount: requestConfig.amount,
      asset: "USDC",
      chain: requestConfig.chain,
      recipient: "0x7d8f3c2a1b4e5f6789012345abcdef0123456789",
      nonce: `nonce_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      expiry: Math.floor(Date.now() / 1000) + 300,
      callback: `${requestConfig.targetUrl}/callback`,
    };

    const mockRawResponse = `HTTP/1.1 402 Payment Required
Content-Type: application/json
X-A402-Version: 1.0
X-A402-Payment-Request: encoded_payload

${JSON.stringify(mockChallenge, null, 2)}`;

    addDebugLog("info", "Received HTTP 402 Payment Required");
    setChallenge(mockChallenge, mockRawResponse);
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-neon-cyan uppercase tracking-wide">
          Request Builder
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configure and send a request to get a 402 challenge
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Target URL
          </label>
          <input
            type="url"
            value={requestConfig.targetUrl}
            onChange={(e) => setRequestConfig({ targetUrl: e.target.value })}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-pink focus:border-neon-pink"
            placeholder="https://api.example.com/protected"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Amount (USDC)
          </label>
          <input
            type="text"
            value={requestConfig.amount}
            onChange={(e) => setRequestConfig({ amount: e.target.value })}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neon-pink focus:border-neon-pink"
            placeholder="0.50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Chain
          </label>
          <select
            value={requestConfig.chain}
            onChange={(e) => setRequestConfig({ chain: e.target.value })}
            className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-pink focus:border-neon-pink"
          >
            <option value="sui-testnet">Sui Testnet</option>
            <option value="sui-mainnet" disabled>
              Sui Mainnet (coming soon)
            </option>
          </select>
        </div>

        <button
          onClick={handleSendRequest}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-neon-pink text-black font-semibold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed glow-pink"
        >
          {isLoading ? "Requesting..." : "Request 402 Challenge"}
        </button>
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          This will call your backend endpoint and expect an HTTP 402 response
          with a402 payment requirements.
        </p>
      </div>
    </div>
  );
}
