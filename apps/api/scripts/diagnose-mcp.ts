
import "dotenv/config";
import axios from "axios";

// Run: npx ts-node apps/api/scripts/diagnose-mcp.ts

const MCP_URL = process.env.BEEP_MCP_URL || "https://api.justbeep.it/mcp";
const SECRET_KEY = process.env.BEEP_SECRET_KEY;
const PUBLISHABLE_KEY = process.env.BEEP_PUBLISHABLE_KEY;

console.log("--- BEEP MCP DIAGNOSIS ---");
console.log("URL:", MCP_URL);
console.log("Secret Key Present:", !!SECRET_KEY);
console.log("Publishable Key Present:", !!PUBLISHABLE_KEY);

if (!SECRET_KEY && !PUBLISHABLE_KEY) {
    console.warn("⚠️ No keys found! Continuing to test public access...");
    // process.exit(1);
}

const authHeader = SECRET_KEY ? `Bearer ${SECRET_KEY}` : `Bearer ${PUBLISHABLE_KEY}`;

async function run() {
    try {
        // 1. Initialize
        console.log("\n[1] Sending 'initialize' request...");
        const initPayload = {
            jsonrpc: "2.0",
            id: "diag-1",
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: { name: "diagnosis-script", version: "1.0.0" }
            }
        };

        const initResp = await axios.post(MCP_URL, initPayload, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
                "Accept": "application/json, text/event-stream"
            }
        });

        console.log("✅ Initialize Status:", initResp.status);
        const sessionId = initResp.headers["mcp-session-id"];
        console.log("✅ Session ID received:", sessionId || "NONE (Error!)");

        if (!sessionId) {
            console.error("❌ Failed to get mcp-session-id header");
            console.log("Headers:", initResp.headers);
            return;
        }

        // 2. List Tools
        console.log("\n[2] Sending 'tools/list' request with Session ID...");
        const listPayload = {
            jsonrpc: "2.0",
            id: "diag-2",
            method: "tools/list",
            params: {}
        };

        const listResp = await axios.post(MCP_URL, listPayload, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader,
                "mcp-session-id": sessionId
            }
        });

        console.log("✅ Tools Status:", listResp.status);
        console.log("Tools Found:", JSON.stringify(listResp.data, null, 2));

    } catch (error: any) {
        console.error("❌ Request Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        } else {
            console.error(error.message);
        }
    }
}

run();
