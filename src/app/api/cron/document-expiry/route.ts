import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDocumentExpiryEmail } from "@/lib/email";

// CRON_SECRET should be set in .env for production
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
    // Check for CRON_SECRET in production
    const authHeader = request.headers.get("Authorization");
    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Find documents expiring within the next 30 days or already expired
        const expiringDocuments = await prisma.document.findMany({
            where: {
                expiresAt: {
                    lte: thirtyDaysFromNow,
                    gte: now, // Only documents that haven't expired yet
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Also find already expired documents
        const expiredDocuments = await prisma.document.findMany({
            where: {
                expiresAt: {
                    lt: now,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        const allDocumentsToProcess = [...expiringDocuments, ...expiredDocuments];

        let notificationsCreated = 0;
        let emailsSent = 0;

        // Group documents by user to avoid duplicate notifications
        const userDocumentsMap = new Map<string, typeof allDocumentsToProcess>();

        for (const doc of allDocumentsToProcess) {
            const existing = userDocumentsMap.get(doc.userId) || [];
            userDocumentsMap.set(doc.userId, [...existing, doc]);
        }

        // Process each user's documents
        for (const [userId, documents] of userDocumentsMap) {
            const user = documents[0].user;
            if (!user.email) continue;

            // Check if we've already sent an expiry notification recently (within last 7 days)
            const recentNotification = await prisma.notification.findFirst({
                where: {
                    userId,
                    type: "document_expiry",
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            // Create notification for each expiring/expired document
            for (const doc of documents) {
                const daysUntilExpiry = Math.ceil(
                    (doc.expiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                const isExpired = daysUntilExpiry < 0;

                const documentName = doc.type
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());

                // Create in-app notification
                await prisma.notification.create({
                    data: {
                        userId: doc.userId,
                        title: isExpired ? "Document Expired" : "Document Expiring Soon",
                        message: isExpired
                            ? `Your ${documentName} has expired. Please renew it immediately.`
                            : `Your ${documentName} will expire in ${Math.abs(daysUntilExpiry)} days. Please renew it soon.`,
                        type: "document_expiry",
                        link: "/documents",
                    },
                });
                notificationsCreated++;

                // Send email (only if not recently sent)
                if (!recentNotification) {
                    await sendDocumentExpiryEmail(
                        user.email,
                        user.name || "User",
                        documentName,
                        doc.expiresAt!,
                        daysUntilExpiry
                    );
                    emailsSent++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            documentsProcessed: allDocumentsToProcess.length,
            notificationsCreated,
            emailsSent,
            message: `Processed ${allDocumentsToProcess.length} documents, created ${notificationsCreated} notifications, sent ${emailsSent} emails`,
        });
    } catch (error) {
        console.error("Error in document expiry cron:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
