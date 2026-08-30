import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { ApplicationStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    // First, verify the application exists
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const updateData: {
      externalApplicationId?: string;
      externalPortal?: string;
      externalStatus?: string;
      lastSyncedAt?: Date;
      status?: ApplicationStatus;
      notes?: string;
    } = {};

    // Handle updates based on user role
    if (session.user.role === "ADMIN") {
      // Admin can update status and notes
      const { status, notes } = body;
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
    } else {
      // Regular user can only update their own external application details
      if (application.userId !== session.user.id) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }
      
      const { externalApplicationId, externalPortal } = body;
      if (externalApplicationId && externalPortal) {
        updateData.externalApplicationId = externalApplicationId;
        updateData.externalPortal = externalPortal;
        updateData.externalStatus = "ID_ADDED";
        updateData.lastSyncedAt = new Date();
      } else {
        return NextResponse.json({ error: "External Application ID and Portal are required." }, { status: 400 });
      }
    }
    
    // Do nothing if no data is being updated
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: "No update data provided." }, { status: 200 });
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

