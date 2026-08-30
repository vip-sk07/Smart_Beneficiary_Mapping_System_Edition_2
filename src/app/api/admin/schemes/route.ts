import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/schemes
 * Returns ALL schemes including inactive ones (admin view).
 * Supports ?q=search&category=id query params.
 */
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") ?? "";
        const categoryId = searchParams.get("category") ?? "";

        const schemes = await prisma.scheme.findMany({
            where: {
                ...(q && {
                    OR: [
                        { title: { contains: q, mode: "insensitive" } },
                        { description: { contains: q, mode: "insensitive" } },
                    ],
                }),
                ...(categoryId && { categoryId }),
            },
            include: {
                category: { select: { id: true, name: true, color: true, icon: true } },
                _count: { select: { applications: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json({ schemes, categories });
    } catch (err) {
        console.error("GET /api/admin/schemes error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * POST /api/admin/schemes
 * Create a new government scheme.
 */
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const {
            title, description, benefits, eligibility,
            documents, categoryId, applyLink, isActive,
            minAge, maxAge, genderReq, maxIncome, states,
        } = body;

        if (!title || !description || !categoryId) {
            return NextResponse.json({ error: "title, description, and categoryId are required" }, { status: 400 });
        }

        const scheme = await prisma.scheme.create({
            data: {
                title, description, benefits: benefits ?? "",
                eligibility: eligibility ?? "", documents: documents ?? "",
                categoryId, applyLink: applyLink ?? null,
                isActive: isActive ?? true,
                minAge: minAge ?? null, maxAge: maxAge ?? null,
                genderReq: genderReq ?? "ALL",
                maxIncome: maxIncome ? parseFloat(maxIncome) : null,
                states: states ?? null,
            },
            include: { category: true },
        });

        return NextResponse.json({ scheme }, { status: 201 });
    } catch (err) {
        console.error("POST /api/admin/schemes error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
