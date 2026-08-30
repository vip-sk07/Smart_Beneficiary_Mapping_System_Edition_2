import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { subscription } = await req.json();

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
        }

        const { endpoint, keys: { p256dh, auth: authKey } } = subscription;

        await (prisma as any).pushSubscription.upsert({
            where: {
                userId_endpoint: {
                    userId: session.user.id,
                    endpoint: endpoint,
                }
            },
            update: {
                p256dh,
                auth: authKey
            },
            create: {
                userId: session.user.id,
                endpoint,
                p256dh,
                auth: authKey
            }
        });

        return NextResponse.json({ success: true, message: "Subscribed to push notifications" }, { status: 201 });
    } catch (err: any) {
        console.error("[POST /api/push/subscribe]", err);
        return NextResponse.json(
            { error: "Failed to subscribe to push notifications" },
            { status: 500 }
        );
    }
}
