import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const familyMembers = await (prisma as any).familyMember.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ familyMembers });
    } catch (err) {
        console.error("[GET /api/family]", err);
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
        const { name, dob, gender, relation, aadhaarNo, income, occupation } = body;

        if (!name || !relation) {
            return NextResponse.json({ error: "Name and relation are required" }, { status: 400 });
        }

        const count = await (prisma as any).familyMember.count({
            where: { userId: session.user.id }
        });

        if (count >= 10) {
            return NextResponse.json({ error: "Maximum family members limit (10) reached" }, { status: 400 });
        }

        const familyMember = await (prisma as any).familyMember.create({
            data: {
                userId: session.user.id,
                name,
                dob: dob ? new Date(dob) : null,
                gender: gender || null,
                relation,
                aadhaarNo: aadhaarNo || null,
                income: income ? parseFloat(income) : null,
                occupation: occupation || null,
            }
        });

        return NextResponse.json({ familyMember }, { status: 201 });
    } catch (err) {
        console.error("[POST /api/family]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
