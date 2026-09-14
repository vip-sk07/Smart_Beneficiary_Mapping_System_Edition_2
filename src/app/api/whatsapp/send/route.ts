import { NextRequest, NextResponse } from "next/server";
import { sendRealWhatsAppMessage } from "@/lib/whatsapp-gateway";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { phone, message } = body;
        if (!phone || !message) {
            return NextResponse.json({ error: "Missing phone or message" }, { status: 400 });
        }
        const success = await sendRealWhatsAppMessage(phone, message);
        return NextResponse.json({ success, phone });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || "Failed to send message" }, { status: 500 });
    }
}
