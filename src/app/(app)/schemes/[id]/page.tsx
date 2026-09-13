import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ApplyButton from "./ApplyButton";
import SendSchemeToWhatsApp from "@/components/whatsapp/SendSchemeToWhatsApp";
import {
    ArrowLeft,
    CheckCircle2,
    FileText,
    Users,
    ExternalLink,
    AlertTriangle,
    XCircle,
    FolderOpen,
    UploadCloud,
    Building2,
    Shield,
    HelpCircle,
    Check,
    MapPin,
    Search,
} from "lucide-react";
import { checkSchemeEligibility } from "@/lib/eligibility";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const scheme = await prisma.scheme.findUnique({ where: { id }, select: { title: true } });
    return { title: scheme?.title ?? "Scheme Details" };
}

export default async function SchemeDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const { id } = await params;

    const [scheme, existingApplication, user] = await Promise.all([
        prisma.scheme.findUnique({
            where: { id },
            include: { category: true },
        }),
        prisma.application.findUnique({
            where: { userId_schemeId: { userId: session.user.id, schemeId: id } },
            select: { id: true, status: true, externalApplicationId: true, externalPortal: true },
        }),
        (prisma as any).user.findUnique({
            where: { id: session.user.id },
            include: { documents: true }
        }),
    ]);

    if (!scheme || !user) notFound();

    const eligibility = checkSchemeEligibility(user, scheme as any);

    // Extract ministry if available
    let ministry = "";
    const ministryMatch = scheme.description?.match(/\*\*Nodal Ministry \/ Department:\*\*\s*([^\n*]+)/i);
    if (ministryMatch) ministry = ministryMatch[1].trim();

    // Extract level
    const isCentral = scheme.description?.toLowerCase().includes("level:** central") ?? false;

    // Detect required docs from unstructured text
    const textLower = ((scheme.documents || "") + " " + (scheme.description || "") + " " + (scheme.eligibility || "")).toLowerCase();
    const reqChecks = [
        { label: "Aadhaar Card (e-KYC)", key: "aadhaar", needed: textLower.includes("aadhaar") || textLower.includes("aadhar") || textLower.includes("identity proof") },
        { label: "Bank Passbook / Cancelled Cheque", key: "bank_passbook", needed: textLower.includes("bank") || textLower.includes("passbook") || textLower.includes("account") || textLower.includes("cheque") || textLower.includes("ifsc") },
        { label: "Passport Size Photograph", key: "photo", needed: textLower.includes("photo") || textLower.includes("photograph") },
        { label: "Specimen Signature / Thumb Impression", key: "signature", needed: textLower.includes("signature") || textLower.includes("sign") || textLower.includes("thumb") },
        { label: "Caste / Category Certificate", key: "caste_cert", needed: textLower.includes("caste") || textLower.includes("community") || textLower.includes("tribe") || textLower.includes("sc/st") || textLower.includes("obc") || textLower.includes("ews") },
        { label: "Birth Certificate / Age Proof", key: "birth_cert", needed: textLower.includes("birth") || textLower.includes("age proof") || textLower.includes("dob") || textLower.includes("slc") },
        { label: "Domicile / Residence Certificate", key: "domicile", needed: textLower.includes("domicile") || textLower.includes("residence") || textLower.includes("residential") || textLower.includes("nativity") },
        { label: "Income Certificate / Salary Slip", key: "income_cert", needed: textLower.includes("income") || textLower.includes("salary") || textLower.includes("itr") },
        { label: "Ration Card (PHH / AAY / BPL)", key: "ration_card", needed: textLower.includes("ration") || textLower.includes("bpl") || textLower.includes("antyodaya") || textLower.includes("aay") },
        { label: "Educational Marksheet / Degree", key: "education_cert", needed: textLower.includes("marksheet") || textLower.includes("degree") || textLower.includes("bonafide") || textLower.includes("education") || textLower.includes("student") },
        { label: "Disability Certificate / UDID Card", key: "disability_cert", needed: textLower.includes("disability") || textLower.includes("medical") || textLower.includes("udid") || textLower.includes("handicap") || textLower.includes("pwd") },
        { label: "Land Record / Patta / 7-12", key: "land_record", needed: textLower.includes("land") || textLower.includes("patta") || textLower.includes("khasra") || textLower.includes("khatauni") || textLower.includes("7/12") || textLower.includes("chitta") || textLower.includes("ror") },
        { label: "Driving License / Vehicle RC", key: "driving_license", needed: textLower.includes("driving license") || textLower.includes("license") || textLower.includes("rc book") },
        { label: "Death Certificate / Legal Heir", key: "death_cert", needed: textLower.includes("death") || textLower.includes("legal heir") },
        { label: "MGNREGA / Shramik Card", key: "job_card", needed: textLower.includes("job card") || textLower.includes("mgnrega") || textLower.includes("shramik") || textLower.includes("e-shram") },
    ].filter((r) => r.needed);

    const checkVault = (docKey: string) => {
        return user.documents?.some((d: any) => d.type === docKey);
    };

    return (
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
            {/* Breadcrumbs */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                <Link href="/schemes" style={{ color: "#0f2e5a", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                    <ArrowLeft size={14} /> Schemes Directory
                </Link>
                <span>/</span>
                <span style={{ color: "#334155", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
                    {scheme.title}
                </span>
            </div>

            {/* Classical Government Header Banner */}
            <div style={{
                background: "#ffffff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                padding: "24px 28px",
                boxShadow: "0 2px 8px rgba(0, 33, 71, 0.05)",
                marginBottom: 20,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    <span style={{
                        padding: "3px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        background: isCentral ? "#eff6ff" : "#ecfdf5",
                        color: isCentral ? "#1d4ed8" : "#047857",
                        border: `1px solid ${isCentral ? "#bfdbfe" : "#a7f3d0"}`
                    }}>
                        {isCentral ? "Central Govt Scheme" : "State Government Scheme"}
                    </span>

                    <span style={{
                        padding: "3px 10px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #e2e8f0"
                    }}>
                        {scheme.category?.name || "General Welfare"}
                    </span>
                </div>

                {ministry && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                        <Building2 size={15} color="#64748b" />
                        <span>{ministry}</span>
                    </div>
                )}

                <h1 style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#0f2e5a",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.3,
                    marginBottom: 20,
                }}>
                    {scheme.title}
                </h1>

                {/* Eligibility Result Banner */}
                {eligibility.isIncomplete ? (
                    <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 8, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "start", gap: 12 }}>
                        <AlertTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" size={18} />
                        <div style={{ fontSize: 13 }}>
                            <strong style={{ color: "#92400e" }}>Complete your profile to check eligibility</strong>
                            <p style={{ color: "#b45309", margin: "4px 0 8px" }}>{eligibility.reason}</p>
                            <Link href="/profile" style={{ fontSize: 12, fontWeight: 700, color: "#92400e", background: "#fef3c7", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}>
                                Update Profile →
                            </Link>
                        </div>
                    </div>
                ) : eligibility.isEligible ? (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckCircle2 className="text-green-600 flex-shrink-0" size={18} />
                        <div style={{ fontSize: 13, color: "#166534" }}>
                            <strong>You are eligible for this scheme ✓</strong>
                            <span style={{ marginLeft: 6, color: "#15803d" }}>({eligibility.reason})</span>
                        </div>
                    </div>
                ) : (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                        <XCircle className="text-red-500 flex-shrink-0" size={18} />
                        <div style={{ fontSize: 13, color: "#991b1b" }}>
                            <strong>You may not be eligible:</strong>
                            <span style={{ marginLeft: 6 }}>{eligibility.reason}</span>
                        </div>
                    </div>
                )}

                {/* Main Action & Fallback Application Suite */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {scheme.applyLink && (
                        <a
                            href={scheme.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "10px 20px",
                                borderRadius: 8,
                                background: "#0f2e5a",
                                color: "white",
                                fontSize: 13.5,
                                fontWeight: 700,
                                textDecoration: "none",
                                boxShadow: "0 2px 6px rgba(15, 46, 90, 0.2)",
                            }}
                            className="hover:bg-blue-900"
                        >
                            Apply on State / Ministry Portal <ExternalLink size={14} />
                        </a>
                    )}

                    {/* National myScheme Gateway Backup Link */}
                    <a
                        href={`https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 16px",
                            borderRadius: 8,
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            fontSize: 13,
                            fontWeight: 700,
                            textDecoration: "none",
                            border: "1.5px solid #bfdbfe",
                        }}
                    >
                        <Search size={14} /> National myScheme Portal
                    </a>

                    {/* Offline CSC Center Locator Link */}
                    <Link
                        href="/centers"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 16px",
                            borderRadius: 8,
                            background: "#f8fafc",
                            color: "#475569",
                            fontSize: 13,
                            fontWeight: 700,
                            textDecoration: "none",
                            border: "1.5px solid #cbd5e1",
                        }}
                    >
                        <MapPin size={14} color="#0284c7" /> Apply via CSC Kendra
                    </Link>

                    {/* WhatsApp Alert Button */}
                    <SendSchemeToWhatsApp
                        schemeTitle={scheme.title}
                        schemeBenefit={scheme.benefits?.substring(0, 100)}
                        applyLink={scheme.applyLink || `https://www.myscheme.gov.in/search?q=${encodeURIComponent(scheme.title)}`}
                    />

                    {existingApplication ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "10px 18px",
                                    borderRadius: 8,
                                    background: "#f0fdf4",
                                    border: "1.5px solid #86efac",
                                    color: "#15803d",
                                    fontSize: 13.5,
                                    fontWeight: 700,
                                }}
                            >
                                <CheckCircle2 size={16} /> 
                                <span>Tracking: {existingApplication.externalApplicationId || existingApplication.status.replace("_", " ")}</span>
                            </div>
                            <Link
                                href="/applications"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    padding: "10px 14px",
                                    borderRadius: 8,
                                    background: "#eff6ff",
                                    color: "#1d4ed8",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    textDecoration: "none",
                                    border: "1px solid #bfdbfe",
                                }}
                            >
                                Track in Applications →
                            </Link>
                        </div>
                    ) : (
                        <ApplyButton schemeId={scheme.id} schemeTitle={scheme.title} userId={session.user.id} />
                    )}
                </div>
            </div>

            {/* Classical Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                
                {/* 1. Description & Overview */}
                <div style={{ background: "white", borderRadius: 10, border: "1px solid #e2e8f0", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ width: 30, height: 30, borderRadius: 6, background: "#eff6ff", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FileText size={16} />
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2e5a", margin: 0 }}>
                            Details & Overview
                        </h2>
                    </div>
                    <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                        {scheme.description}
                    </div>
                </div>

                {/* 2. Benefits */}
                <div style={{ background: "white", borderRadius: 10, border: "1px solid #e2e8f0", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ width: 30, height: 30, borderRadius: 6, background: "#ecfdf5", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CheckCircle2 size={16} />
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2e5a", margin: 0 }}>
                            Benefits & Financial Assistance
                        </h2>
                    </div>
                    <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                        {scheme.benefits}
                    </div>
                </div>

                {/* 3. Eligibility Criteria */}
                <div style={{ background: "white", borderRadius: 10, border: "1px solid #e2e8f0", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ width: 30, height: 30, borderRadius: 6, background: "#fff7ed", color: "#c2410c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Users size={16} />
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2e5a", margin: 0 }}>
                            Eligibility Criteria
                        </h2>
                    </div>
                    <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                        {scheme.eligibility}
                    </div>
                </div>

                {/* 4. Required Documents & Vault */}
                <div style={{ background: "white", borderRadius: 10, border: "1px solid #e2e8f0", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ width: 30, height: 30, borderRadius: 6, background: "#f5f3ff", color: "#6d28d9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FolderOpen size={16} />
                        </div>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2e5a", margin: 0 }}>
                            Required Documents
                        </h2>
                    </div>
                    <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-line", marginBottom: 16 }}>
                        {scheme.documents}
                    </div>

                    {reqChecks.length > 0 && (
                        <div style={{ marginTop: 16, padding: "16px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                                <Shield size={16} color="#0f2e5a" />
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f2e5a" }}>Document Vault Availability</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {reqChecks.map((req) => {
                                    const hasDoc = checkVault(req.key);
                                    return (
                                        <div key={req.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f1f5f9" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                {hasDoc ? (
                                                    <CheckCircle2 size={16} className="text-green-600" />
                                                ) : (
                                                    <XCircle size={16} className="text-slate-400" />
                                                )}
                                                <span style={{ color: hasDoc ? "#0f172a" : "#64748b", fontWeight: hasDoc ? 600 : 400 }}>
                                                    {req.label}
                                                </span>
                                            </div>
                                            {hasDoc ? (
                                                <span style={{ fontSize: 11.5, color: "#166534", background: "#dcfce7", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                                                    ✓ Ready in Vault
                                                </span>
                                            ) : (
                                                <Link href="/documents" style={{ fontSize: 11.5, color: "#1d4ed8", background: "#eff6ff", padding: "3px 8px", borderRadius: 4, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                    <UploadCloud size={12} /> Upload to Vault
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
