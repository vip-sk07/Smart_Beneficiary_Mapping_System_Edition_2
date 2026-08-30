/**
 * Real WhatsApp Baileys Gateway Service with Local IPC Bridge
 * Connects your WhatsApp account programmatically using @whiskeysockets/baileys.
 * Runs on Port 3002 to accept dispatch requests from Next.js server.
 */

import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers,
    WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import pino from "pino";
import path from "path";
import fs from "fs";
import http from "http";
import { prisma } from "@/lib/prisma";
import { processIncomingWhatsAppMessage } from "@/lib/whatsapp-conversation";

let sock: WASocket | null = null;
let currentQR: string | null = null;
let connectionStatus: "DISCONNECTED" | "SCAN_QR" | "CONNECTED" = "DISCONNECTED";

const AUTH_DIR = path.join(process.cwd(), ".auth_whatsapp");
const IPC_PORT = 3002;

export function getGatewayStatus() {
    return {
        status: connectionStatus,
        qr: currentQR,
        isConnected: connectionStatus === "CONNECTED"
    };
}

export async function initWhatsAppGateway() {
    if (sock && connectionStatus === "CONNECTED") {
        return sock;
    }

    if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] as any }));
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop"),
        syncFullHistory: false,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            currentQR = qr;
            connectionStatus = "SCAN_QR";
            console.log("\n=======================================================");
            console.log("📲 SCAN THIS QR CODE WITH YOUR WHATSAPP (Linked Devices):");
            console.log("=======================================================\n");
            qrcode.generate(qr, { small: true });
            console.log("\n=======================================================\n");
        }

        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            connectionStatus = "DISCONNECTED";
            currentQR = null;
            console.log("⚠️ WhatsApp Gateway Connection closed. Reconnecting:", shouldReconnect);
            if (shouldReconnect) {
                setTimeout(() => initWhatsAppGateway(), 3000);
            }
        } else if (connection === "open") {
            connectionStatus = "CONNECTED";
            currentQR = null;
            console.log("\n=======================================================");
            console.log("✅ [SBMS WHATSAPP GATEWAY CONNECTED SUCCESSFULLY!]");
            console.log("🤖 Ready to dispatch & receive welfare messages!");
            console.log(`📡 Local Dispatch Server listening on http://localhost:${IPC_PORT}/send`);
            console.log("=======================================================\n");
        }
    });

    // Handle Incoming Messages with Personal Chat Protection
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;

        for (const m of messages) {
            if (m.key.fromMe) continue;

            const remoteJid = m.key.remoteJid;
            if (!remoteJid) continue;

            // 🛡️ PROTECTION 1: Ignore all WhatsApp Group chats completely
            if (remoteJid.endsWith("@g.us") || remoteJid.includes("-")) {
                continue;
            }

            // Extract message body
            const messageContent =
                m.message?.conversation ||
                m.message?.extendedTextMessage?.text ||
                m.message?.imageMessage?.caption ||
                "";

            const text = messageContent.trim();
            if (!text) continue;

            // 🛡️ PROTECTION 2: Strict Command Filter
            // Only respond when someone explicitly sends a welfare command:
            const upper = text.toUpperCase();
            const isCommand = ["SHOW", "1", "2", "3", "4", "5", "SCHEMES", "STATUS", "HELP", "ALERT", "START", "NAMASTE"].includes(upper);
            const isSchemeQuery = upper.includes("SCHEME") || upper.includes("SCHOLARSHIP") || upper.includes("FARMER") || upper.includes("LOAN") || upper.includes("PENSION");

            // IF CASUAL PERSONAL CHAT ("Hi bro", "Testing la dhan iruku", "Where are you") -> IGNORE COMPLETELY!
            if (!isCommand && !isSchemeQuery) {
                continue;
            }

            const senderRaw = remoteJid.split("@")[0];
            const cleanPhone10 = senderRaw.slice(-10);

            // Find citizen profile if registered
            let citizenId = undefined;
            try {
                const citizen = await prisma.user.findFirst({
                    where: {
                        phone: {
                            contains: cleanPhone10
                        }
                    }
                });
                if (citizen) citizenId = citizen.id;
            } catch (err) {
                console.error("DB check error:", err);
            }

            console.log(`[WHATSAPP INBOUND] 📩 Processing Command "${text}" from +${cleanPhone10}`);

            try {
                const reply = await processIncomingWhatsAppMessage(text, citizenId);
                if (reply && reply.replyText) {
                    await sock?.sendMessage(remoteJid, { text: reply.replyText });
                    console.log(`[WHATSAPP OUTBOUND] 💬 Sent reply to +${cleanPhone10}`);
                }
            } catch (err) {
                console.error("Failed to send WhatsApp reply:", err);
            }
        }
    });

    // Start Local HTTP IPC Bridge for Next.js dispatches
    startIPCServer();

    return sock;
}

let ipcServerStarted = false;
function startIPCServer() {
    if (ipcServerStarted) return;
    ipcServerStarted = true;

    const server = http.createServer(async (req, res) => {
        if (req.method === "POST" && req.url === "/send") {
            let body = "";
            req.on("data", chunk => { body += chunk; });
            req.on("end", async () => {
                try {
                    const { phone, message } = JSON.parse(body);
                    let clean = phone.replace(/\D/g, "");
                    if (clean.length === 10) clean = "91" + clean;
                    const jid = `${clean}@s.whatsapp.net`;

                    if (sock && connectionStatus === "CONNECTED") {
                        await sock.sendMessage(jid, { text: message });
                        console.log(`[REAL WHATSAPP DISPATCH] 🚀 Sent message directly to +${clean}`);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ success: true, deliveredTo: clean }));
                    } else {
                        console.log("[IPC] Socket not connected yet.");
                        res.writeHead(503, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "WhatsApp Gateway not connected. Please scan QR in terminal." }));
                    }
                } catch (e: any) {
                    console.error("[IPC ERROR]", e);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: e.message }));
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });

    server.listen(IPC_PORT, () => {
        console.log(`📡 Local IPC Bridge active on port ${IPC_PORT}`);
    });
}

/**
 * Send real automated WhatsApp message to a citizen's phone
 * Called by Next.js server actions / API routes
 */
export async function sendRealWhatsAppMessage(recipientPhone: string, messageText: string): Promise<boolean> {
    try {
        let clean = recipientPhone.replace(/\D/g, "");
        if (clean.length === 10) clean = "91" + clean;

        // 1. Try sending via local running daemon (Port 3002)
        try {
            const ipcRes = await fetch(`http://localhost:${IPC_PORT}/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: clean, message: messageText }),
            });

            if (ipcRes.ok) {
                const data = await ipcRes.json();
                console.log(`[WHATSAPP GATEWAY IPC] ✅ Dispatched to +${clean} via daemon.`);
                return true;
            }
        } catch {
            // Daemon on port 3002 not running or unreachable
        }

        // 2. Direct socket fallback if within same process
        if (sock && connectionStatus === "CONNECTED") {
            const jid = `${clean}@s.whatsapp.net`;
            await sock.sendMessage(jid, { text: messageText });
            console.log(`[REAL WHATSAPP DISPATCH] ✅ Sent message directly to +${clean}`);
            return true;
        }

        console.log(`[WHATSAPP GATEWAY] ⚠️ Daemon not running on port ${IPC_PORT}. Run 'npm run whatsapp' in terminal to link device.`);
        return false;
    } catch (e) {
        console.error("[REAL WHATSAPP DISPATCH ERROR]", e);
        return false;
    }
}
