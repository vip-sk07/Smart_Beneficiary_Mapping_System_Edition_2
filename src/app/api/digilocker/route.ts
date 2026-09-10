import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MOCK_ISSUED_DIGILOCKER_DOCS } from "@/lib/digilocker";

// GET: Fetch available DigiLocker issued documents
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
        success: true,
        issuerGateway: "DigiLocker National Locker Service (MeriPehchaan SSO)",
        issuedDocs: MOCK_ISSUED_DIGILOCKER_DOCS,
    });
}

// POST: Import selected certificates from DigiLocker into Document Vault
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { selectedDocIds } = body;

        if (!Array.isArray(selectedDocIds) || selectedDocIds.length === 0) {
            return NextResponse.json({ error: "No documents selected for import." }, { status: 400 });
        }

        const docsToImport = MOCK_ISSUED_DIGILOCKER_DOCS.filter(d => selectedDocIds.includes(d.id));
        const importedList = [];

        for (const doc of docsToImport) {
            // Check if document already exists
            const existing = await prisma.document.findFirst({
                where: {
                    userId: session.user.id,
                    type: doc.docType,
                }
            });

            const dummySvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="4"/><text x="50" y="60" font-family="sans-serif" font-size="20" font-weight="bold" fill="%230f2e5a">GOVERNMENT OF TAMIL NADU / DIGILOCKER</text><text x="50" y="100" font-family="sans-serif" font-size="16" fill="%2316a34a">✓ DIGITALLY SIGNED CERTIFICATE</text><text x="50" y="140" font-family="sans-serif" font-size="14" fill="%23334155">Certificate Name: ${encodeURIComponent(doc.name)}</text><text x="50" y="170" font-family="sans-serif" font-size="14" fill="%23334155">Issuer: ${encodeURIComponent(doc.issuer)}</text><text x="50" y="200" font-family="sans-serif" font-size="14" fill="%23334155">Certificate No: ${encodeURIComponent(doc.certificateNumber)}</text><text x="50" y="230" font-family="sans-serif" font-size="14" fill="%23334155">Digital Signature: ${encodeURIComponent(doc.digitalSignature)}</text><text x="50" y="270" font-family="sans-serif" font-size="12" fill="%2364748b">Verified on DigiLocker Public Key Infrastructure (PKI)</text></svg>`;

            if (existing) {
                // Update existing
                const updated = await prisma.document.update({
                    where: { id: existing.id },
                    data: {
                        name: `${doc.name} (DigiLocker)`,
                        fileUrl: dummySvg,
                        expiresAt: doc.validUntil ? new Date(doc.validUntil) : null,
                    }
                });
                importedList.push(updated);
            } else {
                // Create new
                const created = await prisma.document.create({
                    data: {
                        userId: session.user.id,
                        type: doc.docType,
                        name: `${doc.name} (DigiLocker)`,
                        fileUrl: dummySvg,
                        fileSize: 45000,
                        expiresAt: doc.validUntil ? new Date(doc.validUntil) : null,
                    }
                });
                importedList.push(created);
            }

            // Sync user profile fields if available from DigiLocker payload
            if (doc.xmlPayload.annualIncome) {
                await (prisma as any).user.update({
                    where: { id: session.user.id },
                    data: { income: doc.xmlPayload.annualIncome }
                });
            }
        }

        return NextResponse.json({
            success: true,
            importedCount: importedList.length,
            message: `Successfully imported ${importedList.length} verified certificates from DigiLocker!`,
        });
    } catch (err: any) {
        console.error("DigiLocker Import Error:", err);
        return NextResponse.json({ error: err.message || "Failed to import from DigiLocker" }, { status: 500 });
    }
}
