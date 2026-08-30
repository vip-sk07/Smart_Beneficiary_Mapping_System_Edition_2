#!/usr/bin/env tsx
/**
 * Standalone Real WhatsApp Baileys Gateway Daemon
 * Run: npm run whatsapp
 */

import { initWhatsAppGateway } from "../src/lib/whatsapp-gateway";

console.log("\n=======================================================");
console.log("🇮🇳 SMART BENEFICIARY MAPPING SYSTEM (SBMS)");
console.log("🚀 STARTING REAL WHATSAPP AUTONOMOUS GATEWAY...");
console.log("=======================================================\n");

async function main() {
    try {
        await initWhatsAppGateway();
    } catch (err) {
        console.error("Fatal Gateway Error:", err);
        process.exit(1);
    }
}

main();
