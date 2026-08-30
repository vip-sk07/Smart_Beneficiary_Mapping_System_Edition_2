import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { rateLimitRegister } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
    try {
        // Rate limit check
        const rateLimitResult = await rateLimitRegister(req);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "Too many attempts. Please wait 15 minutes before trying again." },
                { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfter || 900) } }
            );
        }
        const body = await req.json();
        const {
            name, email, password,
            dob, gender, phone, aadhaarNo,
            income, occupation, state, address,
        } = body;

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        // Check Aadhaar uniqueness if provided
        if (aadhaarNo) {
            const aadhaarExists = await prisma.user.findUnique({ where: { aadhaarNo } });
            if (aadhaarExists) {
                return NextResponse.json(
                    { error: "This Aadhaar number is already registered" },
                    { status: 409 }
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER",
                dob: dob ? new Date(dob) : undefined,
                gender: gender || undefined,
                phone: phone || undefined,
                aadhaarNo: aadhaarNo || undefined,
                income: income ? parseFloat(income) : undefined,
                occupation: occupation || undefined,
                state: state || undefined,
                address: address || undefined,
            },
            select: { id: true, name: true, email: true },
        });

        try {
            if (user.email) {
                await sendWelcomeEmail(user.email, user.name || "User");
            }
        } catch (emailErr) {
            console.error("Failed to send welcome email:", emailErr);
        }

        return NextResponse.json(
            { message: "Account created successfully", user },
            { status: 201 }
        );
    } catch (err) {
        console.error("[/api/auth/register]", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
