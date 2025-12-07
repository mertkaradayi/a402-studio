import { Router, Request, Response } from "express";
import axios, { AxiosError, Method } from "axios";

export const proxyRouter = Router();

const BEEP_API_URL = process.env.BEEP_API_URL || "https://api.justbeep.it";
const BEEP_PUBLISHABLE_KEY = process.env.BEEP_PUBLISHABLE_KEY;

interface ProxyRequest {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
}

/**
 * POST /proxy
 * Proxies HTTP requests to external endpoints, bypassing CORS restrictions.
 * This enables the frontend to test arbitrary endpoints from the browser.
 */
proxyRouter.post("/", async (req: Request, res: Response) => {
    const { url, method = "GET", headers = {}, body }: ProxyRequest = req.body;

    // Validate URL is provided
    if (!url) {
        return res.status(400).json({
            error: "Missing required field: url",
        });
    }

    // Validate URL format
    try {
        new URL(url);
    } catch {
        return res.status(400).json({
            error: "Invalid URL format",
        });
    }

    // Validate method
    const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
    const normalizedMethod = method.toUpperCase();
    if (!allowedMethods.includes(normalizedMethod)) {
        return res.status(400).json({
            error: `Invalid method: ${method}. Allowed: ${allowedMethods.join(", ")}`,
        });
    }

    try {
        const response = await axios({
            url,
            method: normalizedMethod as Method,
            headers: {
                ...headers,
                // Don't forward host header as it would confuse the target server
                host: undefined,
            },
            data: body,
            // Don't throw on non-2xx responses - we want to pass them through
            validateStatus: () => true,
            // Set reasonable timeout
            timeout: 30000,
            // Return response as text to preserve formatting
            responseType: "text",
        });

        // Convert axios headers to plain object
        const responseHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(response.headers)) {
            if (typeof value === "string") {
                responseHeaders[key] = value;
            } else if (Array.isArray(value)) {
                responseHeaders[key] = value.join(", ");
            }
        }

        res.json({
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            body: response.data,
        });
    } catch (err) {
        const axiosError = err as AxiosError;

        // Handle specific axios errors
        if (axiosError.code === "ECONNREFUSED") {
            return res.status(502).json({
                error: "Connection refused - target server is not reachable",
                code: axiosError.code,
            });
        }

        if (axiosError.code === "ETIMEDOUT" || axiosError.code === "ECONNABORTED") {
            return res.status(504).json({
                error: "Request timeout - target server took too long to respond",
                code: axiosError.code,
            });
        }

        if (axiosError.code === "ENOTFOUND") {
            return res.status(502).json({
                error: "DNS lookup failed - hostname could not be resolved",
                code: axiosError.code,
            });
        }

        // Generic error
        return res.status(500).json({
            error: axiosError.message || "Proxy request failed",
            code: axiosError.code,
        });
    }
});

/**
 * GET /proxy/beep/payment-status/:referenceKey
 * Proxies Beep payment status check with proper authentication
 * This allows frontend to check payment status without CORS issues
 */
proxyRouter.get("/beep/payment-status/:referenceKey", async (req: Request, res: Response) => {
    const { referenceKey } = req.params;
    // Allow publishable key from query param or header (for flexibility)
    const publishableKey = req.query.pk as string || req.headers["x-beep-pk"] as string || BEEP_PUBLISHABLE_KEY;

    if (!referenceKey) {
        return res.status(400).json({
            error: "Missing referenceKey parameter",
        });
    }

    if (!publishableKey) {
        return res.status(400).json({
            error: "Missing publishable key - set BEEP_PUBLISHABLE_KEY env var or pass pk query param",
        });
    }

    const url = `${BEEP_API_URL}/v1/widget/payment-status/${referenceKey}`;
    console.log(`[proxy/beep] Fetching payment status for: ${referenceKey}`);

    try {
        const response = await axios({
            url,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${publishableKey}`,
                "Content-Type": "application/json",
                "X-Beep-Client": "beep-sdk",
            },
            timeout: 15000,
        });

        console.log(`[proxy/beep] Response status: ${response.status}`, response.data);

        res.json({
            success: true,
            referenceKey,
            ...response.data,
        });
    } catch (err) {
        const axiosError = err as AxiosError;
        console.error(`[proxy/beep] Error:`, axiosError.response?.data || axiosError.message);

        if (axiosError.response) {
            return res.status(axiosError.response.status).json({
                error: "Beep API error",
                status: axiosError.response.status,
                data: axiosError.response.data,
            });
        }

        return res.status(500).json({
            error: axiosError.message || "Failed to fetch payment status",
        });
    }
});
