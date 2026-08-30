import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ hasUnread: false });

    try {
        const user = await (prisma as any).user.findUnique({
            where: { id: session.user.id },
            select: { last_seen_announcement: true }
        });

        const latest = await (prisma as any).announcement.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: "desc" }
        });

        if (!latest) return NextResponse.json({ hasUnread: false });
        
        const hasUnread = !user?.last_seen_announcement || new Date(latest.createdAt) > new Date(user.last_seen_announcement);

        return NextResponse.json({ hasUnread });
    } catch (e) {
        return NextResponse.json({ hasUnread: false });
    }
}
