import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const categoryId = searchParams.get("categoryId") ?? "";
    const state = searchParams.get("state")?.trim() ?? "";
    const level = searchParams.get("level")?.trim() ?? "";
    const gender = searchParams.get("gender")?.trim() ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(6, parseInt(searchParams.get("limit") ?? "12", 10)));
    const skip = (page - 1) * limit;

    const whereClause: any = {
        isActive: true,
    };

    if (search) {
        whereClause.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { benefits: { contains: search, mode: "insensitive" } },
            { eligibility: { contains: search, mode: "insensitive" } },
        ];
    }

    if (categoryId) {
        whereClause.categoryId = categoryId;
    }

    if (state && state !== "All" && state !== "all") {
        whereClause.AND = whereClause.AND || [];
        whereClause.AND.push({
            OR: [
                { description: { contains: state, mode: "insensitive" } },
                { title: { contains: state, mode: "insensitive" } },
                { eligibility: { contains: state, mode: "insensitive" } },
            ]
        });
    }

    if (level && level !== "all") {
        whereClause.AND = whereClause.AND || [];
        if (level === "central") {
            whereClause.AND.push({
                description: { contains: "Jurisdiction Level:** Central", mode: "insensitive" }
            });
        } else if (level === "state") {
            whereClause.AND.push({
                NOT: {
                    description: { contains: "Jurisdiction Level:** Central", mode: "insensitive" }
                }
            });
        }
    }

    if (gender && gender !== "all") {
        whereClause.AND = whereClause.AND || [];
        whereClause.AND.push({
            OR: [
                { eligibility: { contains: gender, mode: "insensitive" } },
                { description: { contains: gender, mode: "insensitive" } },
                { title: { contains: gender, mode: "insensitive" } },
            ]
        });
    }

    const [totalCount, schemes, categories] = await Promise.all([
        prisma.scheme.count({ where: whereClause }),
        prisma.scheme.findMany({
            where: whereClause,
            include: { category: true },
            orderBy: { title: "asc" },
            skip,
            take: limit,
        }),
        prisma.category.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { schemes: { where: { isActive: true } } }
                }
            }
        }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
        schemes,
        categories,
        pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            limit,
        }
    });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, description, benefits, eligibility, documents, categoryId, applyLink } = body;
        if (!title || !description || !benefits || !eligibility || !categoryId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const scheme = await prisma.scheme.create({
            data: { title, description, benefits, eligibility, documents: documents ?? "", categoryId, applyLink },
            include: { category: true },
        });

        return NextResponse.json({ scheme }, { status: 201 });
    } catch (err) {
        console.error("[POST /api/schemes]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
