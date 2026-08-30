import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
            take: 20,
        });
        return NextResponse.json({ notifications });
    } catch (err) {
        console.error("GET /api/notifications error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.notification.updateMany({
            where: { userId: session.user.id, isRead: false },
            data: { isRead: true },
        });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("PATCH /api/notifications error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
