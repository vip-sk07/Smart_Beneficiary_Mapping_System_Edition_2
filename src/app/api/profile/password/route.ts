import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { oldPassword, newPassword } = await req.json();

        if (!oldPassword || !newPassword) {
            return NextResponse.json({ error: "Both old and new passwords are required" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
        }

        // Get current hashed password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true },
        });

        if (!user?.password) {
            return NextResponse.json(
                { error: "Password change is not available for social login accounts" },
                { status: 400 }
            );
        }

        // Verify old password
        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
        }

        // Hash and save new password
        const hashed = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashed },
        });

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("[POST /api/profile/password]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
