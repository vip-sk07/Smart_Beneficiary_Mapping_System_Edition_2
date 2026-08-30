import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/stats
 * Returns platform-wide statistics for the admin dashboard.
 * Restricted to ADMIN role only.
 */
export async function GET() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const [
            totalUsers,
            totalSchemes,
            totalCategories,
            appCounts,
            grievanceCounts,
            recentApplications,
            topSchemes,
        ] = await Promise.all([
            prisma.user.count({ where: { role: "USER" } }),
            prisma.scheme.count({ where: { isActive: true } }),
            prisma.category.count(),
            prisma.application.groupBy({ by: ["status"], _count: true }),
            prisma.grievance.groupBy({ by: ["status"], _count: true }),
            prisma.application.findMany({
                take: 8,
                orderBy: { submittedAt: "desc" },
                include: {
                    user: { select: { name: true, email: true } },
                    scheme: { select: { title: true } },
                },
            }),
            prisma.scheme.findMany({
                select: {
                    title: true,
                    _count: { select: { applications: true } },
                },
                orderBy: { applications: { _count: "desc" } },
                take: 5,
            }),
        ]);

        const appByStatus = Object.fromEntries(
            appCounts.map((a) => [a.status, a._count])
        );
        const grievByStatus = Object.fromEntries(
            grievanceCounts.map((g) => [g.status, g._count])
        );
        const totalApps = appCounts.reduce((s, a) => s + a._count, 0);
        const openGrievances =
            (grievByStatus["OPEN"] ?? 0) + (grievByStatus["IN_PROGRESS"] ?? 0);

        return NextResponse.json({
            totalUsers,
            totalSchemes,
            totalCategories,
            totalApps,
            openGrievances,
            appByStatus,
            grievByStatus,
            recentApplications,
            topSchemes,
        });
    } catch (err) {
        console.error("GET /api/admin/stats error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
