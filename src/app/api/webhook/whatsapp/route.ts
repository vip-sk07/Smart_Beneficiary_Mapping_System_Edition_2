import { NextRequest, NextResponse } from "next/server";
import { processIncomingWhatsAppMessage } from "@/lib/whatsapp-conversation";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        const body = await req.json();
        const userMessage = body.message || body.text || body.Body || "START";
        const userId = body.userId || session?.user?.id;

        const response = await processIncomingWhatsAppMessage(userMessage, userId);

        return NextResponse.json(response);
    } catch (e: any) {
        console.error("[POST /api/webhook/whatsapp]", e);
        return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
    }
}

// Meta Webhook Verification (for official WhatsApp Cloud API)
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === (process.env.WHATSAPP_VERIFY_TOKEN || "sbms_webhook_secret_2026")) {
        return new Response(challenge, { status: 200 });
    }

    return NextResponse.json({ status: "WhatsApp Webhook Active" });
}
