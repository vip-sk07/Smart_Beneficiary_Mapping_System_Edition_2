import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// To trigger this cron job, set up a scheduled request (e.g., once a day) to this endpoint.
// On Vercel, this can be configured in the `vercel.json` file.
// Example vercel.json configuration:
// {
//   "crons": [
//     {
//       "path": "/api/cron/sync-status",
//       "schedule": "0 0 * * *" // Runs every day at midnight
//     }
//   ]
// }
//
// IMPORTANT: Protect this endpoint with a secret, passed as a bearer token.
// The request should include an `Authorization: Bearer <YOUR_CRON_SECRET>` header.

export async function GET(request: Request) {
  const authToken = (request.headers.get("authorization") || "").split("Bearer ").at(1);

  if (authToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));

    // Find applications that have an external ID, are still pending/under review,
    // and haven't been updated by the user in the last 7 days.
    const applicationsToNotify = await prisma.application.findMany({
      where: {
        externalApplicationId: { not: null },
        status: { in: ["PENDING", "UNDER_REVIEW"] },
        updatedAt: { lt: sevenDaysAgo },
      },
      select: {
        id: true,
        userId: true,
        scheme: { select: { title: true } },
      },
    });

    if (applicationsToNotify.length === 0) {
      return NextResponse.json({ message: "No applications needed a reminder." });
    }

    const notifications = applicationsToNotify.map((app) => ({
      userId: app.userId,
      title: "Application Status Reminder",
      message: `Have you checked the status of your application for "${app.scheme.title}" on the official portal recently? If there's an update, please add your External ID on our platform.`,
      type: "application_update",
      link: "/applications",
    }));

    // Create notifications in bulk
    await prisma.notification.createMany({
      data: notifications,
    });
    
    // As an alternative to notifications, you could also integrate an email service here
    // to send email reminders to users.

    return NextResponse.json({
      message: `Sent reminders for ${applicationsToNotify.length} applications.`,
    });

  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
