import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";

/**
 * GET /api/admin/grievances
 * Returns ALL grievances across all users (admin view).
 * The user-facing /api/grievances only returns the logged-in user's grievances.
 * This endpoint returns everyone's — restricted to ADMIN only.
 */
export async function GET() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const grievances = await prisma.grievance.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, email: true } },
            },
        });

        return NextResponse.json({ grievances });
    } catch (err) {
        console.error("GET /api/admin/grievances error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/grievances
 * Update any grievance's status and/or response.
 * Body: { id: string, status?: string, response?: string }
 * Also sends a push notification to the grievance owner.
 */
export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { id, status, response } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Grievance ID required" }, { status: 400 });
        }

        const updated = await prisma.grievance.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(response !== undefined && { response }),
                ...(status === "RESOLVED" && { resolvedAt: new Date() }),
            },
            include: {
                user: { select: { id: true, name: true } },
            },
        });

        // Notify the citizen that their grievance was updated
        await prisma.notification.create({
            data: {
                userId: updated.userId,
                title: "Grievance Update",
                message: `Your grievance "${updated.subject}" has been ${status?.toLowerCase() ?? "updated"}.`,
                type: "grievance_update",
                link: "/grievances",
            },
        });

        // Send push notification (fire and forget)
        sendPushNotification(
            updated.userId,
            "Grievance Updated",
            `Your grievance has been ${status?.toLowerCase() ?? "updated"}.`,
            "/grievances"
        ).catch(() => {});

        return NextResponse.json({ grievance: updated });
    } catch (err) {
        console.error("PATCH /api/admin/grievances error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
