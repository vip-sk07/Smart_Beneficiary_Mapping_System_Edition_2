import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        
        // Ensure the family member belongs to the current user
        const existingMember = await (prisma as any).familyMember.findUnique({
            where: { id }
        });

        if (!existingMember || existingMember.userId !== session.user.id) {
            return NextResponse.json({ error: "Family member not found" }, { status: 404 });
        }

        const { name, dob, gender, relation, aadhaarNo, income, occupation } = body;

        const updatedMember = await (prisma as any).familyMember.update({
            where: { id },
            data: {
                name: name !== undefined ? name : undefined,
                dob: dob !== undefined ? (dob ? new Date(dob) : null) : undefined,
                gender: gender !== undefined ? (gender || null) : undefined,
                relation: relation !== undefined ? relation : undefined,
                aadhaarNo: aadhaarNo !== undefined ? (aadhaarNo || null) : undefined,
                income: income !== undefined ? (income ? parseFloat(income) : null) : undefined,
                occupation: occupation !== undefined ? (occupation || null) : undefined,
            }
        });

        return NextResponse.json({ familyMember: updatedMember });
    } catch (err) {
        console.error("[PATCH /api/family/[id]]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        
        // Ensure the family member belongs to the current user
        const existingMember = await (prisma as any).familyMember.findUnique({
            where: { id }
        });

        if (!existingMember || existingMember.userId !== session.user.id) {
            return NextResponse.json({ error: "Family member not found" }, { status: 404 });
        }

        await (prisma as any).familyMember.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[DELETE /api/family/[id]]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
