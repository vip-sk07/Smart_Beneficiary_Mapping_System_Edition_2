/**
 * Next.js Server Lifecycle Instrumentation
 * Automatically boots the WhatsApp Autonomous Gateway when the Next.js production server starts.
 */

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        console.log("\n=======================================================");
        console.log("🇮🇳 [SBMS SERVER STARTUP] BOOTING AUTONOMOUS WHATSAPP GATEWAY...");
        console.log("=======================================================\n");

        try {
            const { initWhatsAppGateway } = await import("@/lib/whatsapp-gateway");
            await initWhatsAppGateway();
            console.log("✅ [SBMS SERVER STARTUP] WhatsApp Gateway is persistently online & listening for citizen messages.");
        } catch (err) {
            console.error("⚠️ [SBMS SERVER STARTUP] WhatsApp Gateway startup notice:", err);
        }
    }
}
