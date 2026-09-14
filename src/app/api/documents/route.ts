import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendAutomatedCitizenAlert } from "@/lib/notifications";
import { checkSchemeEligibility } from "@/lib/eligibility";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const documents = await (prisma as any).document.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ documents });
    } catch (err) {
        console.error("[GET /api/documents]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, type, fileUrl, fileSize, expiresAt } = body;

        if (!name || !type || !fileUrl) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Limit check
        const count = await (prisma as any).document.count({
            where: { userId: session.user.id }
        });

        if (count >= 15) {
            return NextResponse.json({ error: "Vault limit reached (15 documents max)." }, { status: 400 });
        }

        const document = await (prisma as any).document.create({
            data: {
                userId: session.user.id,
                name,
                type,
                fileUrl,
                fileSize: fileSize || null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            }
        });

        // 🚀 Autonomous Background Trigger: Re-check eligibility & dispatch WhatsApp alert
        (async () => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    include: { documents: true }
                });
                if (user?.phone) {
                    const schemes = await prisma.scheme.findMany({ take: 30, orderBy: { createdAt: "desc" } });
                    let matchedScheme = null;
                    for (const s of schemes) {
                        const res = checkSchemeEligibility(user, s as any);
                        if (res.isEligible || res.status === "eligible") {
                            matchedScheme = s;
                            break;
                        }
                    }
                    const { sendAutomatedCitizenAlert } = await import("@/lib/notifications");
                    await sendAutomatedCitizenAlert({
                        userId: user.id,
                        phone: user.phone,
                        schemeTitle: matchedScheme ? matchedScheme.title : `${name} (${type}) Verified`,
                        schemeBenefit: matchedScheme?.benefits ? matchedScheme.benefits.slice(0, 120).replace(/\*\*/g, "") : "Document securely deposited in encrypted Vault",
                        portalLink: matchedScheme ? `${process.env.NEXTAUTH_URL || "https://smart-beneficiary-mapping-system.vercel.app"}/schemes/${matchedScheme.id}` : `${process.env.NEXTAUTH_URL || "https://smart-beneficiary-mapping-system.vercel.app"}/documents`,
                        triggerReason: "DOCUMENT_VERIFIED"
                    });
                }
            } catch (bgErr) {
                console.error("[BG AUTO-WHATSAPP TRIGGER ERROR]", bgErr);
            }
        })();

        return NextResponse.json({ document }, { status: 201 });
    } catch (err) {
        console.error("[POST /api/documents]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
