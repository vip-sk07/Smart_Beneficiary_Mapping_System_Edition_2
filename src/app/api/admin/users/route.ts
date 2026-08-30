import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/users
 * Returns all registered users (non-admin accounts).
 * Restricted to ADMIN role only.
 */
export async function GET() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                state: true,
                income: true,
                occupation: true,
                createdAt: true,
                _count: { select: { applications: true, grievances: true } },
            },
        });

        return NextResponse.json({ users });
    } catch (err) {
        console.error("GET /api/admin/users error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/users
 * Update a user's role (promote to ADMIN or demote to USER).
 * Body: { userId: string, role: "USER" | "ADMIN" }
 */
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { userId, role } = await req.json();

        if (!userId || !["USER", "ADMIN"].includes(role)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Prevent admin from demoting themselves
        if (userId === session.user.id) {
            return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, name: true, email: true, role: true },
        });

        return NextResponse.json({ user: updated });
    } catch (err) {
        console.error("PATCH /api/admin/users error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
