/**
 * Real WhatsApp Baileys Gateway Service
 * Connects your WhatsApp account programmatically using @whiskeysockets/baileys.
 * 
 * Safety Guarantees:
 * 1. Group chats (@g.us) are 100% ignored.
 * 2. Unregistered phone numbers (friends, family, personal contacts) are 100% ignored.
 * 3. Only registered SBMS beneficiaries sending valid commands trigger automated responses.
 */

import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    WASocket,
    proto
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import pino from "pino";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/prisma";
import { processIncomingWhatsAppMessage } from "@/lib/whatsapp-conversation";

let sock: WASocket | null = null;
let currentQR: string | null = null;
let connectionStatus: "DISCONNECTED" | "SCAN_QR" | "CONNECTED" = "DISCONNECTED";

const AUTH_DIR = path.join(process.cwd(), ".auth_whatsapp");

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

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
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
            console.log("\n✅ [SBMS WHATSAPP GATEWAY CONNECTED SUCCESSFULLY!]");
            console.log("🤖 Connected to your WhatsApp account. Ready to dispatch welfare alerts!\n");
        }
    });

    // Handle Incoming Messages with Strict Personal Protection
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;

        for (const m of messages) {
            // Ignore messages sent by yourself
            if (m.key.fromMe) continue;

            const remoteJid = m.key.remoteJid;
            if (!remoteJid) continue;

            // 🛡️ PROTECTION 1: Ignore all WhatsApp Group chats completely
            if (remoteJid.endsWith("@g.us") || remoteJid.includes("-")) {
                continue;
            }

            // Extract pure digits from phone (e.g. 919842154321)
            const senderRaw = remoteJid.split("@")[0];
            const cleanPhone10 = senderRaw.slice(-10); // Last 10 digits

            // 🛡️ PROTECTION 2: Check if sender is a registered citizen in SBMS database
            let citizen = null;
            try {
                citizen = await prisma.user.findFirst({
                    where: {
                        phone: {
                            contains: cleanPhone10
                        }
                    }
                });
            } catch (err) {
                console.error("DB check error:", err);
            }

            // IF NOT A REGISTERED CITIZEN -> IGNORE COMPLETELY (DO NOTHING)
            if (!citizen) {
                // Personal friend/family/colleague -> Do not reply
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

            // 🛡️ PROTECTION 3: Only process valid welfare commands
            const upper = text.toUpperCase();
            const isCommand = ["SHOW", "1", "2", "3", "4", "5", "SCHEMES", "STATUS", "HELP", "ALERT", "START", "NAMASTE"].includes(upper);
            const isSchemeQuery = upper.includes("SCHEME") || upper.includes("SCHOLARSHIP") || upper.includes("FARMER") || upper.includes("LOAN") || upper.includes("PENSION");

            if (!isCommand && !isSchemeQuery) {
                // Normal chat talk even from a citizen -> Do not interrupt
                continue;
            }

            console.log(`[WHATSAPP INBOUND] 📩 Message from registered citizen ${citizen.name || cleanPhone10}: "${text}"`);

            try {
                // Call 3-Step State Machine
                const reply = await processIncomingWhatsAppMessage(text, citizen.id);

                if (reply && reply.replyText) {
                    await sock?.sendMessage(remoteJid, { text: reply.replyText });
                    console.log(`[WHATSAPP OUTBOUND] 💬 Sent reply to ${cleanPhone10}`);
                }
            } catch (err) {
                console.error("Failed to send WhatsApp reply:", err);
            }
        }
    });

    return sock;
}

/**
 * Send real automated WhatsApp message to a citizen's phone
 */
export async function sendRealWhatsAppMessage(recipientPhone: string, messageText: string): Promise<boolean> {
    try {
        if (!sock || connectionStatus !== "CONNECTED") {
            console.log("[GATEWAY NOT CONNECTED] Attempting initialization...");
            await initWhatsAppGateway();
            if (connectionStatus !== "CONNECTED") {
                console.log("[GATEWAY] Please scan the QR code in terminal to connect your WhatsApp.");
                return false;
            }
        }

        let clean = recipientPhone.replace(/\D/g, "");
        if (clean.length === 10) clean = "91" + clean;
        const jid = `${clean}@s.whatsapp.net`;

        await sock?.sendMessage(jid, { text: messageText });
        console.log(`[REAL WHATSAPP DISPATCH] ✅ Sent message directly to +${clean}`);
        return true;
    } catch (e) {
        console.error("[REAL WHATSAPP DISPATCH ERROR]", e);
        return false;
    }
}
