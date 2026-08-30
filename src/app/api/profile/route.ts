import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true, name: true, email: true, role: true,
            dob: true, gender: true, phone: true, aadhaarNo: true,
            income: true, occupation: true, state: true, address: true,
            createdAt: true,
        },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, dob, gender, phone, aadhaarNo, income, occupation, state, address } = body;

        // Check Aadhaar uniqueness if being changed
        if (aadhaarNo) {
            const existing = await prisma.user.findFirst({
                where: { aadhaarNo, id: { not: session.user.id } },
            });
            if (existing) {
                return NextResponse.json({ error: "This Aadhaar number is already registered" }, { status: 409 });
            }
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(name && { name }),
                ...(dob && { dob: new Date(dob) }),
                ...(gender !== undefined && { gender: gender || null }),
                ...(phone !== undefined && { phone: phone || null }),
                ...(aadhaarNo !== undefined && { aadhaarNo: aadhaarNo || null }),
                ...(income !== undefined && { income: income ? parseFloat(income) : null }),
                ...(occupation !== undefined && { occupation: occupation || null }),
                ...(state !== undefined && { state: state || null }),
                ...(address !== undefined && { address: address || null }),
            },
            select: { id: true, name: true, email: true },
        });

        return NextResponse.json({ user });
    } catch (err) {
        console.error("[PATCH /api/profile]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
