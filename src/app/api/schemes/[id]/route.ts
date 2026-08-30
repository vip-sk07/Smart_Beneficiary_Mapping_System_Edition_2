import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const scheme = await prisma.scheme.findUnique({
        where: { id },
        include: { category: true },
    });
    if (!scheme) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ scheme });
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
        const scheme = await prisma.scheme.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                benefits: body.benefits,
                eligibility: body.eligibility,
                documents: body.documents,
                applyLink: body.applyLink,
                isActive: body.isActive,
                categoryId: body.categoryId,
            },
            include: { category: true },
        });

        return NextResponse.json({ scheme });
    } catch (err) {
        console.error("[PATCH /api/schemes/:id]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

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
        // Delete embedding first (FK constraint)
        await prisma.schemeEmbedding.deleteMany({ where: { schemeId: id } });
        await prisma.scheme.delete({ where: { id } });
        return NextResponse.json({ message: "Deleted" });
    } catch (err) {
        console.error("[DELETE /api/schemes/:id]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
