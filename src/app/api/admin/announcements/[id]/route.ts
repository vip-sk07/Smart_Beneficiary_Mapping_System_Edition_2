import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    try {
        await prisma.announcement.delete({ where: { id } });
        return NextResponse.json({ message: "Deleted" });
    } catch (err) {
        console.error("[DELETE /api/admin/announcements/:id]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    try {
        const body = await req.json();
        const announcement = await prisma.announcement.update({
            where: { id },
            data: {
                ...(body.title !== undefined && { title: body.title }),
                ...(body.content !== undefined && { content: body.content }),
                ...(body.pinned !== undefined && { pinned: body.pinned }),
                ...(body.isActive !== undefined && { isActive: body.isActive }),
            },
        });
        return NextResponse.json({ announcement });
    } catch (err) {
        console.error("[PATCH /api/admin/announcements/:id]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
