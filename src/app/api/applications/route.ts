import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
        where: { userId: session.user.id },
        include: { scheme: { include: { category: true } } },
        orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ applications });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { schemeId } = await req.json();
        if (!schemeId) {
            return NextResponse.json({ error: "schemeId is required" }, { status: 400 });
        }

        // Check scheme exists
        const scheme = await prisma.scheme.findUnique({ where: { id: schemeId } });
        if (!scheme) {
            return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
        }

        // Check not already applied
        const existing = await prisma.application.findUnique({
            where: { userId_schemeId: { userId: session.user.id, schemeId } },
        });
        if (existing) {
            return NextResponse.json({ error: "You have already applied for this scheme" }, { status: 409 });
        }

        const application = await prisma.application.create({
            data: { userId: session.user.id, schemeId, status: "PENDING" },
        });

        // 🚀 Autonomous Background Trigger: Dispatch WhatsApp Alert on Application Submission
        (async () => {
            try {
                const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { phone: true, name: true } });
                if (user?.phone) {
                    const { sendAutomatedCitizenAlert } = await import("@/lib/notifications");
                    await sendAutomatedCitizenAlert({
                        userId: session.user.id,
                        phone: user.phone,
                        schemeTitle: scheme.title,
                        schemeBenefit: scheme.benefits ? scheme.benefits.slice(0, 120).replace(/\*\*/g, "") : "Welfare Benefits",
                        triggerReason: "APPLICATION_SUBMITTED"
                    });
                }
            } catch (bgErr) {
                console.error("[BG AUTO-WHATSAPP APPLICATION SUBMIT ERROR]", bgErr);
            }
        })();

        return NextResponse.json({ application }, { status: 201 });
    } catch (err) {
        console.error("[POST /api/applications]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
