import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendAutomatedCitizenAlert } from "@/lib/notifications";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { schemeTitle, schemeBenefit, portalLink, triggerReason } = body;

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user || !user.phone) {
            return NextResponse.json({
                error: "Citizen phone number is not registered in profile. Please add phone number in Edit Profile."
            }, { status: 400 });
        }

        const result = await sendAutomatedCitizenAlert({
            userId: user.id,
            phone: user.phone,
            schemeTitle: schemeTitle || "Post Matric Scholarship",
            schemeBenefit: schemeBenefit || "Up to ₹25,000 / year tuition reimbursement",
            portalLink: portalLink || "http://localhost:3001/schemes",
            triggerReason: triggerReason || "DOCUMENT_VERIFIED"
        });

        return NextResponse.json({
            message: "Autonomous WhatsApp alert dispatched successfully to consumer phone.",
            result
        });
    } catch (e: any) {
        console.error("[POST /api/notifications/dispatch]", e);
        return NextResponse.json({ error: "Failed to dispatch notification" }, { status: 500 });
    }
}
