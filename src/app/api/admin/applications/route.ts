import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
        orderBy: { submittedAt: "desc" },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    dob: true,
                    gender: true,
                    state: true,
                    income: true,
                    occupation: true,
                    documents: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            fileUrl: true,
                            fileSize: true,
                            expiresAt: true,
                            createdAt: true,
                        }
                    }
                }
            },
            scheme: { select: { id: true, title: true, documents: true } },
        },
    });

    return NextResponse.json({ applications });
}
