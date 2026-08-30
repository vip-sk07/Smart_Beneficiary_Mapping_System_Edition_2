import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/push";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [announcements, schemes] = await Promise.all([
        (prisma as any).announcement.findMany({
            orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
            include: { scheme: { select: { id: true, title: true } } }
        }),
        prisma.scheme.findMany({
            select: { id: true, title: true },
            orderBy: { title: "asc" }
        })
    ]);

    return NextResponse.json({ announcements, schemes });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { title, content, pinned, category, schemeId } = await req.json();
        if (!title?.trim() || !content?.trim() || !category) {
            return NextResponse.json({ error: "Title, content and category are required" }, { status: 400 });
        }

        const announcement = await (prisma as any).announcement.create({
            data: { 
                title: title.trim(), 
                content: content.trim(), 
                category,
                schemeId: schemeId || null,
                pinned: !!pinned, 
                isActive: true 
            },
        });

        // Create notification for ALL users
        try {
            const users = await prisma.user.findMany({ select: { id: true } });
            if (users.length > 0) {
                const notificationsData = users.map(u => ({
                    userId: u.id,
                    title: `New Update: ${title.trim()}`,
                    message: content.trim().substring(0, 100) + '...',
                    type: "announcement",
                    link: "/dashboard"
                }));
                await prisma.notification.createMany({
                    data: notificationsData
                });

                // Fire-and-forget Native Push Notifications using Web-Push API
                Promise.allSettled(
                    users.map(u => 
                        sendPushNotification(
                            u.id, 
                            `New Announcement`,
                            title.trim().substring(0, 50) + '...',
                            "/announcements"
                        )
                    )
                ).catch(err => console.error("[Push Batch Error]", err));
            }
        } catch (notifErr) {
            console.error("Failed to push announcement notifications:", notifErr);
        }

        return NextResponse.json({ announcement }, { status: 201 });
    } catch (err) {
        console.error("[POST /api/admin/announcements]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
