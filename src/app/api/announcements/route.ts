import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const announcements = await (prisma as any).announcement.findMany({
            where: { isActive: true },
            orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
            include: { scheme: { select: { id: true, title: true } } }
        });
        return NextResponse.json({ announcements });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
