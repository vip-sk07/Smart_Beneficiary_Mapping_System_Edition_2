import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatsClient } from "@/components/admin/StatsClient";

export const metadata = { title: "Platform Stats – Admin" };

export default async function AdminStatsPage() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/dashboard");

    const [
        totalUsers,
        totalSchemes,
        appCounts,
        grievanceCounts,
        totalCategories,
        recentApplications,
        topSchemes,
        allApplications
    ] = await Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.scheme.count({ where: { isActive: true } }),
        prisma.application.groupBy({ by: ["status"], _count: true }),
        prisma.grievance.groupBy({ by: ["status"], _count: true }),
        prisma.category.count(),
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
                _count: { select: { applications: true } }
            },
            orderBy: {
                applications: { _count: 'desc' }
            },
            take: 5
        }),
        prisma.application.findMany({
            select: { submittedAt: true },
            orderBy: { submittedAt: 'asc' }
        })
    ]);

    const appByStatus = Object.fromEntries(appCounts.map((a) => [a.status, a._count]));
    const grievByStatus = Object.fromEntries(grievanceCounts.map((g) => [g.status, g._count]));
    const totalApps = appCounts.reduce((s, a) => s + a._count, 0);
    const openGrievances = (grievByStatus["OPEN"] ?? 0) + (grievByStatus["IN_PROGRESS"] ?? 0);

    // Prepare Chart Data
    const pieData = appCounts.map(a => ({
        name: a.status.replace("_", " "),
        value: a._count
    }));

    const schemeData = topSchemes.map(s => ({
        title: s.title,
        applications: s._count.applications
    }));

    const trendMap = new Map<string, number>();
    allApplications.forEach(app => {
        const d = new Date(app.submittedAt);
        const key = `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
        trendMap.set(key, (trendMap.get(key) || 0) + 1);
    });
    const trendData = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }));

    return <StatsClient
        totalUsers={totalUsers}
        totalSchemes={totalSchemes}
        totalApps={totalApps}
        totalCategories={totalCategories}
        appByStatus={appByStatus}
        openGrievances={openGrievances}
        trendData={trendData}
        schemeData={schemeData}
        pieData={pieData}
        recentApplications={recentApplications}
    />;
}
