import { NextResponse } from "next/server";
import { getGatewayStatus } from "@/lib/whatsapp-gateway";

export const dynamic = "force-dynamic";

export async function GET() {
    const status = getGatewayStatus();
    return NextResponse.json({
        ...status,
        timestamp: new Date().toISOString(),
        service: "SBMS WhatsApp Gateway"
    });
}
