import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const documents = await (prisma as any).document.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ documents });
    } catch (err) {
        console.error("[GET /api/documents]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, type, fileUrl, fileSize, expiresAt } = body;

        if (!name || !type || !fileUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Limit check
        const count = await (prisma as any).document.count({
            where: { userId: session.user.id }
        });

        if (count >= 10) {
            return NextResponse.json({ error: "Vault limit reached (10 documents max)." }, { status: 400 });
        }

        const document = await (prisma as any).document.create({
            data: {
                userId: session.user.id,
                name,
                type,
                fileUrl,
                fileSize: fileSize || null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            }
        });

        return NextResponse.json({ document }, { status: 201 });
    } catch (err) {
        console.error("[POST /api/documents]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
