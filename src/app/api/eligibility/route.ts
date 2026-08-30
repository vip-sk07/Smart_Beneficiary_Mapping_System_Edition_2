import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkSchemeEligibility } from "@/lib/eligibility";

export async function GET(req: NextRequest) {
    const session = await auth();
    const url = new URL(req.url);
    const familyId = url.searchParams.get("familyId");
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { documents: true }
        }) as any;

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let targetPerson: any = user;

        // Fetch family members
        const familyMembers = await (prisma as any).familyMember.findMany({
            where: { userId: session.user.id }
        });
        user.familyMembers = familyMembers;

        if (familyId && familyId !== "none") {
            const member = familyMembers.find((m: any) => m.id === familyId);
            if (!member) return NextResponse.json({ error: "Family member not found" }, { status: 404 });
            targetPerson = {
                ...member,
                state: user.state, // inherit state from primary user
                income: member.income !== null ? Number(member.income) : null,
                documents: user.documents // inherit vault documents
            };
        }

        let householdIncome = user.income || 0;
        householdIncome += user.familyMembers.reduce((sum: number, m: any) => sum + (m.income ? Number(m.income) : 0), 0);

        const schemes = await prisma.scheme.findMany({
            where: { isActive: true },
            include: { category: true }
        });

        const eligible = [];
        const docsPending = [];
        const notEligible = [];
        const incomplete = [];

        for (const scheme of schemes) {
            const result = checkSchemeEligibility(targetPerson, scheme as any);

            if (result.status === "not_eligible") {
                notEligible.push({
                    ...scheme,
                    status: result.status,
                    reason: result.reason,
                    matchScore: result.matchScore,
                    missingDocs: result.missingDocs
                });
            } else if (result.status === "docs_pending") {
                docsPending.push({
                    ...scheme,
                    status: result.status,
                    reason: result.reason,
                    matchScore: result.matchScore,
                    missingDocs: result.missingDocs
                });
            } else if (result.status === "unknown" || result.isIncomplete) {
                incomplete.push({
                    ...scheme,
                    status: result.status,
                    reason: result.reason,
                    matchScore: result.matchScore,
                    missingFields: result.missingFields
                });
            } else {
                eligible.push({
                    ...scheme,
                    status: result.status,
                    reason: result.reason,
                    matchScore: result.matchScore
                });
            }
        }

        return NextResponse.json({
            eligible,
            docsPending,
            notEligible,
            incomplete,
            profile: {
                hasMissingData: incomplete.length > 0,
                hasDocuments: (user.documents || []).length > 0,
                documentsCount: (user.documents || []).length
            },
            householdIncome
        });

    } catch (err) {
        console.error("[GET /api/eligibility]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
