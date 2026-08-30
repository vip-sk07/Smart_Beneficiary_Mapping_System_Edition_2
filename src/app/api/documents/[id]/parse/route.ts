import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extractDocumentData } from "@/lib/vision";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const p = await params;
        const document = await (prisma as any).document.findFirst({
            where: { id: p.id, userId: session.user.id }
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (!document.fileUrl.startsWith("data:")) {
            return NextResponse.json({ error: "Document is not a base64 image and cannot be parsed" }, { status: 400 });
        }

        const extractedData = await extractDocumentData(document.fileUrl, document.type);

        return NextResponse.json({ extractedData }, { status: 200 });
    } catch (err: any) {
        console.error("[POST /api/documents/[id]/parse]", err);
        return NextResponse.json(
            { error: err.message || "Failed to parse document" },
            { status: 500 }
        );
    }
}
