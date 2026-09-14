import { NextResponse } from "next/server";
import { getGatewayLogs } from "@/lib/whatsapp-gateway";

export const dynamic = "force-dynamic";

export async function GET() {
    const logs = getGatewayLogs();
    return new NextResponse(logs.length > 0 ? logs.join("\n") : "No live logs recorded yet. Socket is active.", {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
}
