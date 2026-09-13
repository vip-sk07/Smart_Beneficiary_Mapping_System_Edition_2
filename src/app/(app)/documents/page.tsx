"use client";

import { useEffect, useState, useRef } from "react";
import {
    FolderOpen,
    UploadCloud,
    Trash2,
    FileText,
    Image as ImageIcon,
    ScanText,
    Sparkles,
    Eye,
    CheckCircle2,
    ShieldCheck,
    Lock,
    QrCode,
    ArrowRight,
    Award,
    Plus,
    X,
    TrendingUp,
    CreditCard,
    Building2,
    Landmark,
    GraduationCap,
    HeartPulse,
    FileSignature,
    Car,
    Briefcase,
    BadgePercent,
    Layers,
    Search,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { DocumentsAnimate } from "@/components/ui/PageAnimations";
import DocumentPreviewModal from "@/components/vault/DocumentPreviewModal";
import QRCodeCertificateScanner from "@/components/vault/QRCodeCertificateScanner";

interface VaultDocSlot {
    type: string;
    tier: "universal" | "socioeconomic" | "specialized";
    title: string;
    description: string;
    icon: string;
    color: string;
    bg: string;
    schemesUnlocked: string;
}

const ALL_VAULT_SLOTS: VaultDocSlot[] = [
    // ── Tier 1: Universal Essentials (40% - 60% Demand) ──
    {
        type: "aadhaar",
        tier: "universal",
        title: "Aadhaar Card (e-KYC)",
        description: "Primary biometric identity proof required for UIDAI authentication & Direct Benefit Transfer.",
        icon: "🪪",
        color: "#1e40af",
        bg: "#eff6ff",
        schemesUnlocked: "Required for 2,796+ Schemes (59%)",
    },
    {
        type: "bank_passbook",
        tier: "universal",
        title: "Bank Passbook / Cancelled Cheque",
        description: "Account number & IFSC code for direct government cash transfers and subsidy payouts.",
        icon: "🏦",
        color: "#047857",
        bg: "#ecfdf5",
        schemesUnlocked: "Required for 2,324+ Schemes (49%)",
    },
    {
        type: "photo",
        tier: "universal",
        title: "Passport Size Photograph",
        description: "Recent clear color photograph (3.5cm x 4.5cm) for portal applications and identity cards.",
        icon: "📸",
        color: "#6d28d9",
        bg: "#f5f3ff",
        schemesUnlocked: "Required for 1,622+ Schemes (34%)",
    },
    {
        type: "signature",
        tier: "universal",
        title: "Specimen Signature / Thumb Impression",
        description: "Official scanned signature or left thumb impression for application declarations.",
        icon: "✍️",
        color: "#0f766e",
        bg: "#f0fdfa",
        schemesUnlocked: "Universal Digital Form Requirement",
    },

    // ── Tier 2: Socio-Economic & Residence (20% - 30% Demand) ──
    {
        type: "caste_cert",
        tier: "socioeconomic",
        title: "Community / Caste / EWS Certificate",
        description: "Official revenue certificate validating SC / ST / OBC / MBC / BC / EWS reservation quotas.",
        icon: "🏛️",
        color: "#7e22ce",
        bg: "#faf5ff",
        schemesUnlocked: "Unlocks 1,216+ Reserved Schemes (26%)",
    },
    {
        type: "birth_cert",
        tier: "socioeconomic",
        title: "Birth Certificate / Age Proof",
        description: "DOB proof or School Leaving Certificate for child, youth, and elderly pension eligibility.",
        icon: "👶",
        color: "#b45309",
        bg: "#fffbeb",
        schemesUnlocked: "Unlocks 1,135+ Age-based Schemes (24%)",
    },
    {
        type: "domicile",
        tier: "socioeconomic",
        title: "Domicile / Nativity Certificate",
        description: "State or district residency proof issued by Tahsildar / Revenue Department.",
        icon: "🏠",
        color: "#c2410c",
        bg: "#fff7ed",
        schemesUnlocked: "Unlocks 1,092+ State Schemes (23%)",
    },
    {
        type: "income_cert",
        tier: "socioeconomic",
        title: "Income Certificate / Salary Slip",
        description: "Annual family income certificate validating means-tested financial aid and fee waivers.",
        icon: "💰",
        color: "#15803d",
        bg: "#f0fdf4",
        schemesUnlocked: "Unlocks 970+ Low-Income Schemes (21%)",
    },
    {
        type: "ration_card",
        tier: "socioeconomic",
        title: "Smart Ration Card / BPL / Antyodaya",
        description: "Family ration card (PHH / AAY / BPL / NPHH) for food security, Ayushman Bharat, and PDS.",
        icon: "🍚",
        color: "#0369a1",
        bg: "#f0f9ff",
        schemesUnlocked: "Unlocks 897+ Food & PDS Schemes (19%)",
    },

    // ── Tier 3: Specialized & Life-Event (3% - 11% Demand) ──
    {
        type: "education_cert",
        tier: "specialized",
        title: "Educational Marksheet / Degree / ID",
        description: "10th/12th Marksheet, Bonafide certificate, College ID, or Degree for student scholarships.",
        icon: "🎓",
        color: "#4338ca",
        bg: "#eef2ff",
        schemesUnlocked: "Unlocks 506+ Scholarships & Grants (11%)",
    },
    {
        type: "disability_cert",
        tier: "specialized",
        title: "Disability Certificate / UDID Card",
        description: "Unique Disability ID card with certified disability percentage (40%+) for PwD welfare.",
        icon: "♿",
        color: "#be185d",
        bg: "#fdf2f8",
        schemesUnlocked: "Unlocks 456+ PwD & Assistive Schemes (10%)",
    },
    {
        type: "death_cert",
        tier: "specialized",
        title: "Death Certificate / Legal Heir Proof",
        description: "Required for Widow pensions (Indira Gandhi Pension), legal heir grants, and ex-gratia aid.",
        icon: "📜",
        color: "#334155",
        bg: "#f8fafc",
        schemesUnlocked: "Unlocks 326+ Widow & Survivor Schemes (7%)",
    },
    {
        type: "land_record",
        tier: "specialized",
        title: "Land Records (Patta / Chitta / 7-12 / RoR)",
        description: "Agricultural land possession records, Khasra, or Khatoni for PM-KISAN & farm subsidies.",
        icon: "🌾",
        color: "#166534",
        bg: "#f0fdf4",
        schemesUnlocked: "Unlocks 310+ Farmer & Crop Schemes (7%)",
    },
    {
        type: "driving_license",
        tier: "specialized",
        title: "Driving License / Vehicle RC",
        description: "Valid commercial or non-commercial DL for vehicle subsidies and driver training programs.",
        icon: "🚗",
        color: "#475569",
        bg: "#f1f5f9",
        schemesUnlocked: "Unlocks 257+ Driver & Transport Schemes (5%)",
    },
    {
        type: "job_card",
        tier: "specialized",
        title: "MGNREGA Job Card / Shramik Card",
        description: "Unorganized worker ID, e-Shram card, or BOCW construction worker registration.",
        icon: "👷",
        color: "#b45309",
        bg: "#fffbeb",
        schemesUnlocked: "Unlocks 117+ Worker & Toolkit Schemes (3%)",
    },
];

interface Document {
    id: string;
    name: string;
    type: string;
    fileUrl: string;
    fileSize: number | null;
    expiresAt: string | null;
    createdAt: string;
}

export default function DocumentVaultPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTier, setActiveTier] = useState<"all" | "universal" | "socioeconomic" | "specialized">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // OCR Extract states
    const [extractingId, setExtractingId] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<any | null>(null);
    const [parseModalOpen, setParseModalOpen] = useState(false);

    // Preview modal states
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

    // Form states
    const [docType, setDocType] = useState("aadhaar");
    const [docName, setDocName] = useState("");
    const [docExpiresAt, setDocExpiresAt] = useState("");
    const [fileBase64, setFileBase64] = useState<string | null>(null);
    const [fileSizeStr, setFileSizeStr] = useState("");
    const [rawFileSize, setRawFileSize] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    async function fetchDocuments() {
        try {
            const res = await fetch("/api/documents");
            const data = await res.json();
            if (data.documents) {
                setDocuments(data.documents);
            }
        } catch {
            toast.error("Failed to load document vault.");
        } finally {
            setLoading(false);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File is too large. Max allowed size is 5MB.");
            return;
        }

        setRawFileSize(file.size);
        setFileSizeStr((file.size / 1024).toFixed(1) + " KB");

        if (!docName) {
            const slot = ALL_VAULT_SLOTS.find(s => s.type === docType);
            setDocName(slot ? slot.title : file.name.replace(/\.[^/.]+$/, ""));
        }

        const reader = new FileReader();
        reader.onload = () => {
            setFileBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
    }

    function openUploadForSlot(type: string) {
        const slot = ALL_VAULT_SLOTS.find(s => s.type === type);
        setDocType(type);
        setDocName(slot ? slot.title : "");
        setDocExpiresAt("");
        setFileBase64(null);
        setFileSizeStr("");
        setRawFileSize(0);
        setUploadModalOpen(true);
    }

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!fileBase64) {
            toast.error("Please select a file to upload.");
            return;
        }

        setUploading(true);
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: docName || "Certificate",
                    type: docType,
                    fileUrl: fileBase64,
                    fileSize: rawFileSize,
                    expiresAt: docExpiresAt || null,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "Failed to upload document.");
            } else {
                toast.success(`"${docName || 'Document'}" securely stored in vault!`);
                setUploadModalOpen(false);
                fetchDocuments();
            }
        } catch {
            toast.error("Something went wrong during upload.");
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Are you sure you want to remove "${name}" from your vault?`)) return;

        try {
            const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Document removed.");
                setDocuments((prev) => prev.filter((d) => d.id !== id));
            } else {
                toast.error("Failed to delete document.");
            }
        } catch {
            toast.error("Error deleting document.");
        }
    }

    async function handleExtractData(doc: Document) {
        setExtractingId(doc.id);
        try {
            const res = await fetch(`/api/documents/${doc.id}/parse`, { method: "POST" });
            const data = await res.json();
            if (res.ok && data.extractedData) {
                setExtractedData({ ...data.extractedData, docName: doc.name });
                setParseModalOpen(true);
            } else {
                toast.error(data.error || "AI OCR could not extract structured text from this file.");
            }
        } catch {
            toast.error("Failed to extract document data.");
        } finally {
            setExtractingId(null);
        }
    }

    // Filter slots based on active tier and search
    const filteredSlots = ALL_VAULT_SLOTS.filter(slot => {
        const matchesTier = activeTier === "all" || slot.tier === activeTier;
        const matchesSearch = !searchQuery.trim() || 
            slot.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            slot.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTier && matchesSearch;
    });

    const totalUploadedCount = documents.length;
    const universalUploadedCount = ALL_VAULT_SLOTS.filter(s => s.tier === "universal" && documents.some(d => d.type === s.type)).length;
    const readinessScore = Math.min(100, Math.round((universalUploadedCount / 4) * 70 + (Math.min(totalUploadedCount, 6) / 6) * 30));

    return (
        <DocumentsAnimate>
            <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 40 }}>
                {/* Top Gov Banner */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #0f2e5a 0%, #1e3a8a 100%)",
                        borderRadius: 16,
                        padding: "24px 28px",
                        color: "#ffffff",
                        marginBottom: 24,
                        boxShadow: "0 10px 25px -5px rgba(15, 46, 90, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 16,
                    }}
                >
                    <div style={{ maxWidth: 640 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    background: "rgba(255, 255, 255, 0.15)",
                                    color: "#93c5fd",
                                    padding: "3px 8px",
                                    borderRadius: 4,
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                }}
                            >
                                Secure Gov-Vault
                            </span>
                            <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.7)", display: "flex", alignItems: "center", gap: 4 }}>
                                <ShieldCheck size={13} color="#34d399" /> 256-bit Encrypted
                            </span>
                        </div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                            Citizen Document &amp; Certificate Vault
                        </h1>
                        <p style={{ fontSize: 13.5, color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.6, margin: 0 }}>
                            Upload verified certificates once. SBMS AI automatically auto-populates applications, attaches verified proofs, and monitors validity across all 4,700+ welfare schemes.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <button
                            onClick={() => openUploadForSlot("aadhaar")}
                            className="btn-primary"
                            style={{
                                background: "#ffffff",
                                color: "#0f2e5a",
                                padding: "10px 18px",
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 13,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            }}
                        >
                            <UploadCloud size={16} /> Upload Certificate
                        </button>
                    </div>
                </div>

                {/* Vault Readiness & QR Scan Bar */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 14,
                        marginBottom: 20,
                    }}
                >
                    {/* Readiness Gauge */}
                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 12,
                            padding: "16px 20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                Overall Vault Readiness
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#0f2e5a", marginTop: 2 }}>
                                {readinessScore}% Autonomous Ready
                            </div>
                            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                                {totalUploadedCount} of {ALL_VAULT_SLOTS.length} certificate categories uploaded
                            </div>
                        </div>

                        <div
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: "50%",
                                background: readinessScore >= 75 ? "#dcfce7" : "#eff6ff",
                                color: readinessScore >= 75 ? "#15803d" : "#1d4ed8",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: 15,
                            }}
                        >
                            {readinessScore}%
                        </div>
                    </div>

                    {/* e-District 2D QR Scanner */}
                    <QRCodeCertificateScanner onCertificateExtracted={() => fetchDocuments()} />
                </div>

                {/* Tier Filter Tabs & Search Bar */}
                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        padding: "12px 16px",
                        marginBottom: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                    }}
                >
                    {/* Tabs */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {[
                            { id: "all", label: "All Categories", count: ALL_VAULT_SLOTS.length },
                            { id: "universal", label: "🌟 Universal Essentials", count: 4 },
                            { id: "socioeconomic", label: "🏛️ Socio-Economic & Residence", count: 5 },
                            { id: "specialized", label: "🌾 Specialized Welfare", count: 6 },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTier(t.id as any)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: 8,
                                    fontSize: 12.5,
                                    fontWeight: 700,
                                    border: "none",
                                    cursor: "pointer",
                                    background: activeTier === t.id ? "#0f2e5a" : "#f1f5f9",
                                    color: activeTier === t.id ? "#ffffff" : "#475569",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {t.label} ({t.count})
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div style={{ position: "relative", minWidth: 220 }}>
                        <Search size={14} color="#94a3b8" style={{ position: "absolute", left: 10, top: 10 }} />
                        <input
                            type="text"
                            placeholder="Filter document slots..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "7px 12px 7px 30px",
                                fontSize: 12.5,
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                outline: "none",
                            }}
                        />
                    </div>
                </div>

                {/* Document Slots Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
                        gap: 16,
                    }}
                >
                    {filteredSlots.map((slot) => {
                        const existingDoc = documents.find((d) => d.type === slot.type);
                        const isUploaded = !!existingDoc;

                        return (
                            <div
                                key={slot.type}
                                style={{
                                    background: "#ffffff",
                                    borderRadius: 12,
                                    border: isUploaded ? `1.5px solid ${slot.color}33` : "1px dashed #cbd5e1",
                                    boxShadow: isUploaded ? "0 2px 8px rgba(0, 33, 71, 0.04)" : "none",
                                    padding: "18px 20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    position: "relative",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {/* Top Slot Header */}
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 10,
                                                background: slot.bg,
                                                color: slot.color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 20,
                                            }}
                                        >
                                            {slot.icon}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#0f2e5a", margin: 0 }}>
                                                {slot.title}
                                            </h3>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: slot.color }}>
                                                {slot.schemesUnlocked}
                                            </span>
                                        </div>
                                    </div>

                                    {isUploaded ? (
                                        <span
                                            style={{
                                                fontSize: 10.5,
                                                fontWeight: 800,
                                                background: "#dcfce7",
                                                color: "#15803d",
                                                padding: "2px 8px",
                                                borderRadius: 4,
                                                border: "1px solid #86efac",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 3,
                                            }}
                                        >
                                            <CheckCircle2 size={11} /> READY
                                        </span>
                                    ) : (
                                        <span
                                            style={{
                                                fontSize: 10.5,
                                                fontWeight: 700,
                                                background: "#f1f5f9",
                                                color: "#64748b",
                                                padding: "2px 8px",
                                                borderRadius: 4,
                                            }}
                                        >
                                            MISSING
                                        </span>
                                    )}
                                </div>

                                <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, margin: "0 0 14px", flex: 1 }}>
                                    {slot.description}
                                </p>

                                {/* Action Toolbar */}
                                {isUploaded && existingDoc ? (
                                    <div
                                        style={{
                                            borderTop: "1px solid #f1f5f9",
                                            paddingTop: 12,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 6,
                                        }}
                                    >
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button
                                                onClick={() => {
                                                    setPreviewDoc(existingDoc);
                                                    setPreviewModalOpen(true);
                                                }}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    fontSize: 11.5,
                                                    fontWeight: 600,
                                                    color: "#0f2e5a",
                                                    background: "#f8fafc",
                                                    border: "1px solid #cbd5e1",
                                                    padding: "5px 10px",
                                                    borderRadius: 6,
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <Eye size={12} /> Preview
                                            </button>

                                            <button
                                                onClick={() => handleExtractData(existingDoc)}
                                                disabled={extractingId === existingDoc.id}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    fontSize: 11.5,
                                                    fontWeight: 600,
                                                    color: "#1d4ed8",
                                                    background: "#eff6ff",
                                                    border: "1px solid #bfdbfe",
                                                    padding: "5px 10px",
                                                    borderRadius: 6,
                                                    cursor: extractingId === existingDoc.id ? "not-allowed" : "pointer",
                                                }}
                                            >
                                                <Sparkles size={12} /> {extractingId === existingDoc.id ? "Extracting…" : "AI OCR"}
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(existingDoc.id, existingDoc.name)}
                                            style={{
                                                color: "#dc2626",
                                                background: "transparent",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: 4,
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                            title="Delete document"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                                        <button
                                            onClick={() => openUploadForSlot(slot.type)}
                                            style={{
                                                width: "100%",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 6,
                                                padding: "8px 14px",
                                                background: "#f8fafc",
                                                border: "1px solid #cbd5e1",
                                                borderRadius: 6,
                                                fontSize: 12.5,
                                                fontWeight: 700,
                                                color: "#0f2e5a",
                                                cursor: "pointer",
                                            }}
                                            className="hover:bg-slate-100"
                                        >
                                            <Plus size={14} /> Upload {slot.title.split(" ")[0]}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Upload Modal */}
                <Modal
                    isOpen={uploadModalOpen}
                    onClose={() => setUploadModalOpen(false)}
                    title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <UploadCloud size={18} color="#0f2e5a" />
                            <span>Deposit Certificate into Vault</span>
                        </div>
                    }
                    maxWidth={540}
                >
                    <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                                Document Category
                            </label>
                            <select
                                value={docType}
                                onChange={(e) => {
                                    setDocType(e.target.value);
                                    const slot = ALL_VAULT_SLOTS.find(s => s.type === e.target.value);
                                    if (slot) setDocName(slot.title);
                                }}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: "1px solid #cbd5e1",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#0f2e5a",
                                    background: "#ffffff",
                                }}
                            >
                                <optgroup label="🌟 Universal Essentials">
                                    {ALL_VAULT_SLOTS.filter(s => s.tier === "universal").map(s => (
                                        <option key={s.type} value={s.type}>{s.icon} {s.title}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="🏛️ Socio-Economic & Residence">
                                    {ALL_VAULT_SLOTS.filter(s => s.tier === "socioeconomic").map(s => (
                                        <option key={s.type} value={s.type}>{s.icon} {s.title}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="🌾 Specialized Welfare">
                                    {ALL_VAULT_SLOTS.filter(s => s.tier === "specialized").map(s => (
                                        <option key={s.type} value={s.type}>{s.icon} {s.title}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                                Certificate / File Title
                            </label>
                            <input
                                type="text"
                                value={docName}
                                onChange={(e) => setDocName(e.target.value)}
                                placeholder="e.g. Income Certificate - Tahsildar 2026"
                                required
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: "1px solid #cbd5e1",
                                    fontSize: 13,
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                                Select Certificate File (PDF, PNG, JPG, max 5MB)
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="application/pdf,image/png,image/jpeg,image/webp"
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    border: "1px dashed #94a3b8",
                                    background: "#f8fafc",
                                    fontSize: 12,
                                    cursor: "pointer",
                                }}
                            />
                            {fileSizeStr && (
                                <div style={{ fontSize: 11, color: "#166534", fontWeight: 600, marginTop: 4 }}>
                                    ✓ File Selected ({fileSizeStr})
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                                Expiry Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={docExpiresAt}
                                onChange={(e) => setDocExpiresAt(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: 8,
                                    border: "1px solid #cbd5e1",
                                    fontSize: 13,
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <button
                                type="submit"
                                disabled={uploading || !fileBase64}
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    padding: "11px 18px",
                                    fontSize: 13.5,
                                    fontWeight: 700,
                                    borderRadius: 8,
                                    background: "#0f2e5a",
                                }}
                            >
                                {uploading ? "Encrypting & Storing…" : "Save to Document Vault"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setUploadModalOpen(false)}
                                style={{
                                    padding: "11px 16px",
                                    background: "#f8fafc",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#475569",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Document Preview Modal */}
                {previewDoc && (
                    <DocumentPreviewModal
                        isOpen={previewModalOpen}
                        onClose={() => setPreviewModalOpen(false)}
                        documentName={previewDoc.name}
                        documentType={previewDoc.type}
                        fileUrl={previewDoc.fileUrl}
                        fileSize={previewDoc.fileSize}
                    />
                )}

                {/* AI OCR Extracted Data Modal */}
                {extractedData && (
                    <Modal
                        isOpen={parseModalOpen}
                        onClose={() => setParseModalOpen(false)}
                        title={
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Sparkles size={18} color="#2563eb" />
                                <span>AI Multimodal OCR Verification</span>
                            </div>
                        }
                        maxWidth={520}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div
                                style={{
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: 8,
                                    padding: "12px 14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <CheckCircle2 size={16} color="#16a34a" />
                                <span style={{ fontSize: 13, color: "#166534", fontWeight: 700 }}>
                                    Certificate Verified by Multimodal Vision OCR
                                </span>
                            </div>

                            <div
                                style={{
                                    background: "#f8fafc",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                    padding: "14px 16px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                    fontSize: 12.5,
                                }}
                            >
                                {extractedData.holderName && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Certificate Holder:</span>
                                        <strong style={{ color: "#0f172a" }}>{extractedData.holderName}</strong>
                                    </div>
                                )}
                                {extractedData.certificateNumber && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Certificate ID:</span>
                                        <strong style={{ color: "#0f172a", fontFamily: "monospace" }}>{extractedData.certificateNumber}</strong>
                                    </div>
                                )}
                                {extractedData.aadhaarNo && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Aadhaar UID:</span>
                                        <strong style={{ color: "#0f172a", fontFamily: "monospace" }}>{extractedData.aadhaarNo}</strong>
                                    </div>
                                )}
                                {extractedData.incomeAnnual && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Annual Income:</span>
                                        <strong style={{ color: "#15803d" }}>₹{extractedData.incomeAnnual.toLocaleString("en-IN")}</strong>
                                    </div>
                                )}
                                {extractedData.casteCategory && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Caste / Category:</span>
                                        <strong style={{ color: "#7e22ce" }}>{extractedData.casteCategory}</strong>
                                    </div>
                                )}
                                {extractedData.bankAccountNo && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Bank Account:</span>
                                        <strong style={{ color: "#0f172a", fontFamily: "monospace" }}>{extractedData.bankAccountNo} ({extractedData.ifscCode})</strong>
                                    </div>
                                )}
                                {extractedData.pattaSurveyNo && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Patta / Survey:</span>
                                        <strong style={{ color: "#0f172a" }}>{extractedData.pattaSurveyNo} ({extractedData.landAreaAcres} Acres)</strong>
                                    </div>
                                )}
                                {extractedData.disabilityPercentage && (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#64748b" }}>Disability %:</span>
                                        <strong style={{ color: "#be185d" }}>{extractedData.disabilityPercentage}% ({extractedData.disabilityType})</strong>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setParseModalOpen(false)}
                                className="btn-primary"
                                style={{ padding: "10px", fontSize: 13, borderRadius: 8, background: "#0f2e5a" }}
                            >
                                Done
                            </button>
                        </div>
                    </Modal>
                )}
            </div>
        </DocumentsAnimate>
    );
}
