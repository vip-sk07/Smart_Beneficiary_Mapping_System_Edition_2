import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { scanSchemePortal } from "@/lib/portal-scanner";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { schemeId } = body;

        if (!schemeId) {
            return NextResponse.json({ error: "schemeId is required" }, { status: 400 });
        }

        const [scheme, user] = await Promise.all([
            prisma.scheme.findUnique({
                where: { id: schemeId },
                include: { category: true },
            }),
            prisma.user.findUnique({
                where: { id: session.user.id },
                include: {
                    documents: true,
                    familyMembers: true,
                },
            }),
        ]);

        if (!scheme) {
            return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
        }

        if (!user) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        // Run deep pre-flight portal scan & vault matching
        const scanResult = await scanSchemePortal(scheme as any, user as any);

        return NextResponse.json({
            success: true,
            scan: scanResult,
            scheme: {
                id: scheme.id,
                title: scheme.title,
                category: scheme.category?.name,
                applyLink: scheme.applyLink,
            },
            userVault: {
                totalDocuments: user.documents?.length || 0,
                hasAadhaar: !!user.aadhaarNo,
                hasIncome: user.income !== null,
                hasPhone: !!user.phone,
            },
        });
    } catch (err: any) {
        console.error("[POST /api/agent/scan]", err);
        return NextResponse.json({ error: err.message || "Failed to scan portal" }, { status: 500 });
    }
}
