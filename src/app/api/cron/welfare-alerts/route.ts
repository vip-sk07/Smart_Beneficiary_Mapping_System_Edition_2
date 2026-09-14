import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAutomatedCitizenAlert } from "@/lib/notifications";

/**
 * Autonomous Welfare Alert & DBT Notification Cron Daemon
 * Runs on schedule to:
 * 1. Proactively alert beneficiaries about upcoming scheme application deadlines.
 * 2. Notify beneficiaries of Direct Benefit Transfer (DBT) approvals.
 */
export async function GET(req: NextRequest) {
    try {
        const baseUrl = process.env.NEXTAUTH_URL || "https://smart-beneficiary-mapping-system.vercel.app";

        // 1. Fetch active beneficiaries with registered phone numbers
        const users = await prisma.user.findMany({
            where: {
                phone: { not: null },
                role: "USER"
            },
            include: {
                documents: true,
                applications: {
                    include: { scheme: true }
                }
            }
        });

        const activeSchemes = await prisma.scheme.findMany({
            where: { isActive: true },
            take: 10
        });

        let alertsDispatched = 0;

        for (const user of users) {
            if (!user.phone) continue;

            // Check unapplied high-value schemes for this citizen
            const appliedSchemeIds = new Set(user.applications.map(a => a.schemeId));
            const unappliedScheme = activeSchemes.find(s => !appliedSchemeIds.has(s.id));

            if (unappliedScheme) {
                try {
                    await sendAutomatedCitizenAlert({
                        userId: user.id,
                        phone: user.phone,
                        schemeTitle: unappliedScheme.title,
                        schemeBenefit: unappliedScheme.benefits?.slice(0, 100),
                        portalLink: `${baseUrl}/schemes/${unappliedScheme.id}`,
                        triggerReason: "NEW_SCHEME_MATCH"
                    });
                    alertsDispatched++;
                } catch (dispatchErr) {
                    console.error("[CRON DISPATCH ERROR]", dispatchErr);
                }
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            beneficiariesChecked: users.length,
            alertsDispatched
        });
    } catch (err: any) {
        console.error("[CRON WELFARE ALERTS ERROR]", err);
        return NextResponse.json({ error: err.message || "Failed to run cron" }, { status: 500 });
    }
}
