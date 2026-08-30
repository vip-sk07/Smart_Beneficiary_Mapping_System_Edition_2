import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        await prisma.notification.delete({
            where: { id, userId: session.user.id },
        });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("DELETE /api/notifications/[id] error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        await prisma.notification.update({
            where: { id, userId: session.user.id },
            data: { isRead: true },
        });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("PATCH /api/notifications/[id] error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
