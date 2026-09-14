import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { scanSchemePortal } from "@/lib/portal-scanner";
import { runAutonomousBrowserAgent } from "@/lib/browser-agent";

export const maxDuration = 60; // 60s runtime

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { schemeId, relayData } = body;

        if (!schemeId) {
            return NextResponse.json({ error: "schemeId is required" }, { status: 400 });
        }

        const [scheme, user] = await Promise.all([
            prisma.scheme.findUnique({
                where: { id: schemeId },
                include: { category: true },
            }),
            prisma.user.findUnique({
                where: { id: session.user.id },
                include: {
                    documents: true,
                    familyMembers: true,
                },
            }),
        ]);

        if (!scheme) {
            return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
        }

        if (!user) {
            return NextResponse.json({ error: "Citizen profile not found" }, { status: 404 });
        }

        // 1. Run Pre-flight Scanner
        const scanResult = await scanSchemePortal(scheme as any, user as any);

        // Determine target URL (Use official applyLink or the integrated sandbox portal)
        const baseUrl = process.env.NEXTAUTH_URL || "https://smart-beneficiary-mapping-system.vercel.app";
        let targetPortalUrl = scheme.applyLink?.trim();

        // If the scheme doesn't have an external URL or is a local demo, route to mock-portal sandbox
        if (!targetPortalUrl || !targetPortalUrl.startsWith("http")) {
            targetPortalUrl = `${baseUrl}/mock-portal`;
        }

        console.log(`[Agent Run API] Launching Real Playwright Browser Agent on: ${targetPortalUrl}`);

        // 2. Execute Real Autonomous Browser Engine
        const browserResult = await runAutonomousBrowserAgent(
            targetPortalUrl,
            scheme.title,
            {
                name: user.name,
                aadhaarNo: user.aadhaarNo,
                dob: user.dob,
                gender: user.gender,
                phone: user.phone,
                income: user.income,
                state: user.state,
                address: user.address,
                occupation: user.occupation,
                documents: user.documents?.map(d => ({ name: d.name, type: d.type, fileUrl: d.fileUrl })),
            },
            relayData
        );

        if (!browserResult.success) {
            return NextResponse.json({
                error: browserResult.errorMessage || "Browser agent encountered an error during portal navigation",
                steps: browserResult.steps,
            }, { status: 500 });
        }

        const referenceId = browserResult.referenceId;
        const currentYear = new Date().getFullYear();
        const ackDate = new Date();

        // 3. Generate Official Receipt Payload
        const ackReceipt = {
            receiptNumber: `SBMS-ACK-${currentYear}-${Math.floor(100000 + Math.random() * 900000)}`,
            applicationRefNo: referenceId,
            schemeTitle: scheme.title,
            category: scheme.category?.name || "General Welfare",
            applicantName: user.name || "Citizen Beneficiary",
            aadhaarMasked: user.aadhaarNo ? `••••••••${user.aadhaarNo.slice(-4)}` : "Verified e-KYC",
            domicileState: user.state || "India",
            submissionTimestamp: ackDate.toISOString(),
            formattedDate: ackDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
            formattedTime: ackDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            portalGateway: browserResult.portalName || scanResult.portalName,
            status: "SUBMITTED_AND_PENDING_VERIFICATION",
            digitalSignatureHash: crypto.createHash("sha256").update(session.user.id + schemeId + referenceId).digest("hex"),
            finalScreenshot: browserResult.finalScreenshotBase64,
            attachedVaultDocuments: (user.documents || []).map(d => `${d.name} (${d.type})`),
        };

        // 4. Update / Create Application Record in DB
        const existingApp = await prisma.application.findUnique({
            where: { userId_schemeId: { userId: session.user.id, schemeId: scheme.id } },
        });

        let applicationRecord;
        if (existingApp) {
            applicationRecord = await prisma.application.update({
                where: { id: existingApp.id },
                data: {
                    status: "PENDING",
                    externalApplicationId: referenceId,
                    externalPortal: browserResult.portalName || scanResult.portalName,
                    externalStatus: "Submitted — Verified via Autonomous Browser Agent",
                    externalStatusUrl: scheme.applyLink || undefined,
                    notes: `Filed via Real Playwright Chromium Engine. Reference ID: ${referenceId}.`,
                    lastSyncedAt: new Date(),
                },
            });
        } else {
            applicationRecord = await prisma.application.create({
                data: {
                    userId: session.user.id,
                    schemeId: scheme.id,
                    status: "PENDING",
                    externalApplicationId: referenceId,
                    externalPortal: browserResult.portalName || scanResult.portalName,
                    externalStatus: "Submitted — Verified via Autonomous Browser Agent",
                    externalStatusUrl: scheme.applyLink || undefined,
                    notes: `Filed via Real Playwright Chromium Engine. Reference ID: ${referenceId}.`,
                    lastSyncedAt: new Date(),
                },
            });
        }

        // 5. Deposit Official Acknowledgment Receipt into User Document Vault
        const shortSchemeCode = scheme.title.replace(/[^A-Za-z0-9]/g, "").slice(0, 6).toUpperCase();
        const receiptDocumentName = `Ack_Slip_${shortSchemeCode}_${referenceId.replace(/[^A-Za-z0-9]/g, "")}.pdf`;
        const receiptDataUrl = browserResult.finalScreenshotBase64 || `data:application/json;base64,${Buffer.from(JSON.stringify(ackReceipt, null, 2)).toString("base64")}`;

        await prisma.document.create({
            data: {
                userId: session.user.id,
                name: receiptDocumentName,
                type: "other",
                fileUrl: receiptDataUrl,
                fileSize: 1024 * 12,
            },
        });

        // 6. Create Citizen Notification
        await prisma.notification.create({
            data: {
                userId: session.user.id,
                title: `Application Registered: ${scheme.title.slice(0, 35)}...`,
                message: `Your application has been submitted via Playwright Autonomous Agent. Reference ID: ${referenceId}. Receipt slip deposited into your Document Vault.`,
                type: "application_update",
                link: "/applications",
            },
        });

        // 7. Dispatch Autonomous WhatsApp Citizen Alert
        const citizenPhone = user.phone;
        if (citizenPhone) {
            (async () => {
                try {
                    const { sendAutomatedCitizenAlert } = await import("@/lib/notifications");
                    await sendAutomatedCitizenAlert({
                        userId: session.user.id,
                        phone: citizenPhone,
                        schemeTitle: scheme.title,
                        schemeBenefit: scheme.benefits ? scheme.benefits.slice(0, 120).replace(/\*\*/g, "") : "Welfare Benefits",
                        portalLink: `${baseUrl}/applications`,
                        triggerReason: "APPLICATION_SUBMITTED"
                    });
                } catch (bgErr) {
                    console.error("[BG AUTO-WHATSAPP AGENT RUN SUBMIT ERROR]", bgErr);
                }
            })();
        }

        return NextResponse.json({
            success: true,
            status: "COMPLETED",
            referenceId,
            receipt: ackReceipt,
            application: applicationRecord,
            steps: browserResult.steps,
            finalScreenshot: browserResult.finalScreenshotBase64,
            message: `Successfully registered on portal with Reference ID: ${referenceId}!`,
        });

    } catch (err: any) {
        console.error("[POST /api/agent/run] Error:", err);
        return NextResponse.json({ error: err.message || "Failed to execute autonomous registration" }, { status: 500 });
    }
}
