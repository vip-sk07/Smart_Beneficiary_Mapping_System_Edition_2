import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin gets all grievances; user gets only theirs
    const where = session.user.role === "ADMIN" ? {} : { userId: session.user.id };

    const grievances = await prisma.grievance.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ grievances });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { subject, description } = await req.json();
        if (!subject?.trim() || !description?.trim()) {
            return NextResponse.json({ error: "Subject and description are required" }, { status: 400 });
        }
        if (description.trim().length < 20) {
            return NextResponse.json({ error: "Description must be at least 20 characters" }, { status: 400 });
        }

        const grievance = await prisma.grievance.create({
            data: {
                userId: session.user.id,
                subject: subject.trim(),
                description: description.trim(),
                status: "OPEN",
            },
        });

        return NextResponse.json({ grievance }, { status: 201 });
    } catch (err) {
        console.error("[POST /api/grievances]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
