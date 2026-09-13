import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
            password: true,
            createdAt: true,
        },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const { password, ...safeUser } = user;
    return NextResponse.json({ user: { ...safeUser, hasPassword: Boolean(password) } });
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

export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({}));
        const { confirmation, password } = body;

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, email: true, password: true, name: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (confirmation !== "DELETE") {
            return NextResponse.json(
                { error: 'Please type "DELETE" to confirm account deletion.' },
                { status: 400 }
            );
        }

        if (user.password) {
            if (!password) {
                return NextResponse.json(
                    { error: "Password is required to delete your account." },
                    { status: 400 }
                );
            }
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return NextResponse.json(
                    { error: "Incorrect password. Account deletion aborted." },
                    { status: 400 }
                );
            }
        }

        // Permanently delete user account and cascade delete all related models
        await prisma.user.delete({
            where: { id: session.user.id },
        });

        return NextResponse.json({
            success: true,
            message: "Your account and all associated citizen data have been permanently deleted.",
        });
    } catch (err) {
        console.error("[DELETE /api/profile]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
