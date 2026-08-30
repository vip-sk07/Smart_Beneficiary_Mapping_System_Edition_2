import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendGrievanceResolvedEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

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
        const { status, response } = await req.json();

        const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const isResolved = status === "RESOLVED" || status === "CLOSED";

        const grievance = await prisma.grievance.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(response !== undefined && { response }),
                ...(isResolved && { resolvedOn: new Date() }),
            },
            include: { user: { select: { name: true, email: true } } },
        });

        if (isResolved) {
            if (grievance.user.email) {
                try {
                    await sendGrievanceResolvedEmail(
                        grievance.user.email,
                        grievance.user.name || "User",
                        grievance.subject,
                        grievance.response || "Your grievance has been closed."
                    );
                } catch (emailErr) {
                    console.error("Failed to send grievance resolution email:", emailErr);
                }
            }

            try {
                await createNotification(
                    grievance.userId,
                    "Grievance Resolved",
                    `Your grievance '${grievance.subject}' has been resolved`,
                    "grievance_update",
                    "/grievances"
                );
            } catch (notifErr) {
                console.error("Failed to create grievance notification:", notifErr);
            }
        }

        return NextResponse.json({ grievance });
    } catch (err) {
        console.error("[PATCH /api/grievances/:id]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
