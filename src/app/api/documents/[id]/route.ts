import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        
        const existing = await (prisma as any).document.findUnique({
            where: { id }
        });

        if (!existing || existing.userId !== session.user.id) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        await (prisma as any).document.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[DELETE /api/documents/[id]]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
