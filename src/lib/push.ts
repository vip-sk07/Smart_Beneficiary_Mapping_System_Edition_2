import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

if (vapidPublicKey && vapidPrivateKey) {
    try {
        webpush.setVapidDetails(
            "mailto:admin@sbms.gov.in",
            vapidPublicKey,
            vapidPrivateKey
        );
    } catch (err) {
        console.warn("[web-push] Failed to set VAPID details:", err);
    }
}

export async function sendPushNotification(
    userId: string,
    title: string,
    body: string,
    url: string = "/dashboard"
) {
    if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn("[web-push] Missing VAPID keys, skipping push notification.");
        return;
    }

    try {
        const subscriptions = await (prisma as any).pushSubscription.findMany({
            where: { userId }
        });

        if (!subscriptions.length) return;

        const payload = JSON.stringify({
            title,
            body,
            url,
            icon: "/icon-192.png"
        });

        const promises = subscriptions.map(async (sub: any) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            try {
                await webpush.sendNotification(pushSubscription, payload);
            } catch (error: any) {
                // If subscription expired or is invalid, remove it
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await (prisma as any).pushSubscription.delete({ where: { id: sub.id } });
                } else {
                    console.error("[web-push] Error sending notification:", error);
                }
            }
        });

        await Promise.allSettled(promises);
    } catch (error) {
        console.error("[web-push] Failed to send push notification to user", userId, error);
    }
}
