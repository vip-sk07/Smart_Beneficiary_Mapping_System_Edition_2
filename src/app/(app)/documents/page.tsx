"use client";

import { useEffect, useState, useRef } from "react";
import {
    FolderOpen,
    UploadCloud,
    Trash2,
    FileText,
    AlertTriangle,
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
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { DocumentsAnimate } from "@/components/ui/PageAnimations";
import DocumentPreviewModal from "@/components/vault/DocumentPreviewModal";
import QRCodeCertificateScanner from "@/components/vault/QRCodeCertificateScanner";
import DigiLockerSyncModal from "@/components/vault/DigiLockerSyncModal";

// 🏛️ The 6 Essential Government Documents Needed for Welfare Schemes
const ESSENTIAL_DOC_SLOTS = [
    {
        type: "aadhaar",
        title: "Aadhaar Card (e-KYC)",
        description: "Primary identity proof required for Direct Benefit Transfer (DBT) & authentication.",
        icon: "🪪",
        color: "#2563eb",
        bg: "#eff6ff",
        schemesUnlocked: "Required for all 4,700+ Schemes",
    },
    {
        type: "income_cert",
        title: "Income Certificate",
        description: "Annual income proof issued by Revenue Dept (Tahsildar / e-Seva).",
        icon: "💰",
        color: "#16a34a",
        bg: "#f0fdf4",
        schemesUnlocked: "Unlocks ₹2.5L+ Scholarships & Aid",
    },
    {
        type: "caste_cert",
        title: "Community / Caste Certificate",
        description: "Reserved category certificate for SC / ST / OBC / BC / MBC welfare quotas.",
        icon: "🏛️",
        color: "#9333ea",
        bg: "#faf5ff",
        schemesUnlocked: "Unlocks Education & Fee Waivers",
    },
    {
        type: "domicile",
        title: "Domicile / Nativity Certificate",
        description: "State residency certificate proving eligibility for Tamil Nadu state schemes.",
        icon: "🏠",
        color: "#ea580c",
        bg: "#fff7ed",
        schemesUnlocked: "Unlocks TN State Specific Grants",
    },
    {
        type: "ration_card",
        title: "Smart Ration Card / Patta",
        description: "Family food quota & agricultural land record proof for farmer DBT.",
        icon: "🌾",
        color: "#0284c7",
        bg: "#f0f9ff",
        schemesUnlocked: "Unlocks PM-Kisan & PDS Food Aid",
    },
    {
        type: "education_cert",
        title: "Educational Certificate / ID",
        description: "10th/12th Marksheet, Bonafide certificate, or College Student ID card.",
        icon: "🎓",
        color: "#d97706",
        bg: "#fffbeb",
        schemesUnlocked: "Unlocks Higher Education Grants",
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
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // OCR Extract states
    const [extractingId, setExtractingId] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<any | null>(null);
    const [parseModalOpen, setParseModalOpen] = useState(false);

    // Preview modal states
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

    // DigiLocker Sync state
    const [digiLockerModalOpen, setDigiLockerModalOpen] = useState(false);

    // Form states
    const [docType, setDocType] = useState("aadhaar");
    const [docName, setDocName] = useState("");
    const [docExpiresAt, setDocExpiresAt] = useState("");
    const [fileBase64, setFileBase64] = useState<string | null>(null);
    const [fileSizeStr, setFileSizeStr] = useState("");
    const [rawFileSize, setRawFileSize] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = async () => {
        try {
            const res = await fetch("/api/documents");
            if (res.ok) {
                const data = await res.json();
                if (data.documents) {
                    setDocuments(data.documents);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size must be under 2MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setFileBase64(event.target?.result as string);
            setFileSizeStr((file.size / 1024).toFixed(0) + " KB");
            setRawFileSize(file.size);
            if (!docName) {
                setDocName(file.name.split('.')[0]);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!fileBase64 || !docType || !docName) {
            toast.error("Please select a file and enter a name");
            return;
        }

        setUploading(true);
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: docType,
                    name: docName,
                    fileUrl: fileBase64,
                    fileSize: rawFileSize,
                    expiresAt: docExpiresAt || null
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`✅ ${docName} uploaded & verified in Vault!`);
                setUploadModalOpen(false);
                resetForm();
                fetchDocuments();
            } else {
                toast.error(data.error || "Failed to upload document");
            }
        } catch (err) {
            toast.error("Network error while uploading");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete '${name}'?`)) return;

        try {
            const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Document deleted");
                setDocuments(docs => docs.filter(d => d.id !== id));
            } else {
                toast.error("Failed to delete document");
            }
        } catch (err) {
            toast.error("Error deleting document");
        }
    };

    const handleExtract = async (id: string) => {
        setExtractingId(id);
        const loadingToast = toast.loading("AI is analyzing document data...");
        try {
            const res = await fetch(`/api/documents/${id}/parse`, { method: "POST" });
            const data = await res.json();
            toast.dismiss(loadingToast);

            if (res.ok && data.extractedData) {
                setExtractedData(data.extractedData);
                setParseModalOpen(true);
            } else {
                toast.error(data.error || "Failed to extract data. Ensure it is a clear image.");
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Network error analyzing document");
        } finally {
            setExtractingId(null);
        }
    };

    const handleUpdateProfileWithExtracted = async () => {
        if (!extractedData) return;
        try {
            const loadingToast = toast.loading("Updating profile...");
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(extractedData),
            });
            toast.dismiss(loadingToast);
            if (res.ok) {
                toast.success("Profile updated with verified document data!");
                setParseModalOpen(false);
                setExtractedData(null);
            } else {
                toast.error("Failed to update profile");
            }
        } catch (err) {
            toast.error("Network error updating profile");
        }
    };

    const resetForm = () => {
        setDocType("aadhaar");
        setDocName("");
        setDocExpiresAt("");
        setFileBase64(null);
        setFileSizeStr("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const openUploadForType = (type: string, title: string) => {
        setDocType(type);
        setDocName(title);
        setUploadModalOpen(true);
    };

    // Calculate Completion Score
    const uploadedTypes = new Set(documents.map(d => d.type));
    const verifiedCount = ESSENTIAL_DOC_SLOTS.filter(s => uploadedTypes.has(s.type)).length;
    const readinessScore = Math.round((verifiedCount / ESSENTIAL_DOC_SLOTS.length) * 100);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20 animate-pulse">
                <FolderOpen className="w-10 h-10 text-blue-300 mr-3" />
                <span className="text-gray-500 font-medium">Opening Document Vault...</span>
            </div>
        );
    }

    return (
        <DocumentsAnimate>
            <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 40 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(37, 99, 235, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FolderOpen size={20} color="#2563eb" />
                            </div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f2e5a", margin: 0 }}>
                                Document Vault
                            </h1>
                        </div>
                        <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
                            Upload essential certificates once — automatically verify & attach to 4,700+ government welfare schemes.
                        </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <button
                            onClick={() => setDigiLockerModalOpen(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "10px 18px",
                                borderRadius: 10,
                                background: "#0284c7",
                                color: "white",
                                fontSize: 13.5,
                                fontWeight: 700,
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
                            }}
                        >
                            <ShieldCheck size={16} /> Sync with DigiLocker
                        </button>

                        <button
                            onClick={() => { resetForm(); setUploadModalOpen(true); }}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "10px 20px",
                                borderRadius: 10,
                                background: "#002147",
                                color: "white",
                                fontSize: 13.5,
                                fontWeight: 700,
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(0, 33, 71, 0.15)",
                            }}
                        >
                            <Plus size={16} /> Upload New Document
                        </button>
                    </div>
                </div>

                {/* Vault Readiness Progress Banner */}
                <div style={{
                    background: "linear-gradient(135deg, #0f2e5a 0%, #1e40af 100%)",
                    borderRadius: 16,
                    padding: "20px 24px",
                    color: "white",
                    boxShadow: "0 10px 25px rgba(15, 46, 90, 0.15)",
                    marginBottom: 28,
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 14 }}>
                        <div>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
                                <ShieldCheck size={13} color="#86efac" />
                                <span>SCHEME ELIGIBILITY READINESS</span>
                            </div>
                            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                                Vault Readiness: {readinessScore}% Complete ({verifiedCount} of {ESSENTIAL_DOC_SLOTS.length} Essential Documents)
                            </h2>
                        </div>

                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "right" }}>
                            {readinessScore === 100 ? (
                                <span style={{ color: "#86efac", fontWeight: 700 }}>🎉 100% Ready for Instant DBT Disbursals!</span>
                            ) : (
                                <span>Upload remaining proofs to unlock all maximum financial aid.</span>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                            width: `${readinessScore}%`,
                            height: "100%",
                            background: readinessScore > 60 ? "#22c55e" : "#f59e0b",
                            borderRadius: 99,
                            transition: "width 0.4s ease",
                        }} />
                    </div>
                </div>

                {/* Section 1: Essential Document Slots (The Exact Things to Upload) */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <div>
                            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f2e5a", margin: 0 }}>
                                Essential Welfare Document Checklist
                            </h2>
                            <p style={{ fontSize: 12.5, color: "#64748b", margin: "2px 0 0" }}>
                                These 6 documents qualify you for 95% of state & central government subsidies.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
                        {ESSENTIAL_DOC_SLOTS.map((slot) => {
                            const isUploaded = uploadedTypes.has(slot.type);
                            const matchingDoc = documents.find(d => d.type === slot.type);

                            return (
                                <div
                                    key={slot.type}
                                    style={{
                                        background: "white",
                                        borderRadius: 14,
                                        border: isUploaded ? "1.5px solid #86efac" : "1.5px solid #e2e8f0",
                                        padding: "18px 20px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        boxShadow: isUploaded ? "0 4px 12px rgba(34, 197, 94, 0.05)" : "0 2px 6px rgba(0,0,0,0.02)",
                                        position: "relative",
                                        overflow: "hidden",
                                    }}
                                >
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <span style={{ fontSize: 22 }}>{slot.icon}</span>
                                                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f2e5a", margin: 0 }}>
                                                    {slot.title}
                                                </h3>
                                            </div>
                                            {isUploaded ? (
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f0fdf4", color: "#16a34a", padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                                                    <CheckCircle2 size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span style={{ background: "#fef2f2", color: "#dc2626", padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
                                                    Missing
                                                </span>
                                            )}
                                        </div>

                                        <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 10px", lineHeight: 1.4 }}>
                                            {slot.description}
                                        </p>

                                        <div style={{ fontSize: 11.5, fontWeight: 600, color: slot.color, background: slot.bg, padding: "4px 8px", borderRadius: 6, marginBottom: 14, display: "inline-block" }}>
                                            💡 {slot.schemesUnlocked}
                                        </div>
                                    </div>

                                    <div>
                                        {isUploaded && matchingDoc ? (
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                                                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                                                    📄 {matchingDoc.name}
                                                </span>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <button
                                                        onClick={() => { setPreviewDoc(matchingDoc); setPreviewModalOpen(true); }}
                                                        style={{ padding: "4px 8px", borderRadius: 6, background: "#eff6ff", color: "#1d4ed8", fontSize: 11.5, fontWeight: 700, border: "none", cursor: "pointer" }}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleExtract(matchingDoc.id)}
                                                        style={{ padding: "4px 8px", borderRadius: 6, background: "#f0fdf4", color: "#15803d", fontSize: 11.5, fontWeight: 700, border: "none", cursor: "pointer" }}
                                                    >
                                                        AI OCR
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => openUploadForType(slot.type, slot.title)}
                                                style={{
                                                    width: "100%",
                                                    padding: "8px 14px",
                                                    borderRadius: 8,
                                                    background: "#002147",
                                                    color: "white",
                                                    fontSize: 12.5,
                                                    fontWeight: 700,
                                                    border: "none",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: 6,
                                                }}
                                            >
                                                <UploadCloud size={14} /> Upload {slot.title.split(" ")[0]}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section 2: Cryptographic QR Code Scanner */}
                <div style={{ marginBottom: 32 }}>
                    <QRCodeCertificateScanner
                        onVerifiedData={(verified) => {
                            setDocType(verified.type);
                            setDocName(`${verified.type.replace(/_/g, " ").toUpperCase()} (QR Verified)`);
                            setUploadModalOpen(true);
                        }}
                    />
                </div>

                {/* Section 3: All Uploaded Files List */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f2e5a", margin: 0 }}>
                            All Vault Documents ({documents.length})
                        </h2>
                    </div>

                    {documents.length === 0 ? (
                        <div style={{ background: "white", borderRadius: 14, border: "1.5px dashed #cbd5e1", padding: "40px 20px", textAlign: "center" }}>
                            <FolderOpen size={36} color="#94a3b8" style={{ margin: "0 auto 10px" }} />
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f2e5a", margin: "0 0 4px" }}>No documents in vault yet</h3>
                            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                                Click on any essential document card above to upload and verify your certificate.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    style={{
                                        background: "white",
                                        borderRadius: 12,
                                        border: "1.5px solid #e2e8f0",
                                        padding: "14px 16px",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                                            <FileText size={18} color="#0284c7" />
                                            <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f2e5a", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {doc.name}
                                            </h4>
                                        </div>

                                        <div style={{ display: "flex", gap: 4 }}>
                                            <button
                                                onClick={() => { setPreviewDoc(doc); setPreviewModalOpen(true); }}
                                                style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}
                                                title="Preview Document"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleExtract(doc.id)}
                                                style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", color: "#2563eb" }}
                                                title="AI OCR Extract"
                                            >
                                                <ScanText size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id, doc.name)}
                                                style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", color: "#ef4444" }}
                                                title="Delete"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11.5, color: "#94a3b8" }}>
                                        <span>Type: <strong>{doc.type}</strong></span>
                                        <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upload Modal */}
                <Modal
                    isOpen={uploadModalOpen}
                    onClose={() => !uploading && setUploadModalOpen(false)}
                    title="Upload & Verify Document"
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
                        <div>
                            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f2e5a", display: "block", marginBottom: 4 }}>
                                Document Category
                            </label>
                            <select
                                value={docType}
                                onChange={e => setDocType(e.target.value)}
                                disabled={uploading}
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13, outline: "none" }}
                            >
                                <option value="aadhaar">🪪 Aadhaar Card (e-KYC)</option>
                                <option value="income_cert">💰 Income Certificate</option>
                                <option value="caste_cert">🏛️ Community / Caste Certificate</option>
                                <option value="domicile">🏠 Domicile / Nativity Certificate</option>
                                <option value="ration_card">🌾 Smart Ration Card / Land Patta</option>
                                <option value="education_cert">🎓 Educational Marksheet / College ID</option>
                                <option value="photo">👤 Passport Photo</option>
                                <option value="other">📄 Other Document</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f2e5a", display: "block", marginBottom: 4 }}>
                                Document Label / Title
                            </label>
                            <input
                                value={docName}
                                onChange={e => setDocName(e.target.value)}
                                placeholder="e.g., My Income Certificate 2026"
                                disabled={uploading}
                                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 13, outline: "none" }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f2e5a", display: "block", marginBottom: 4 }}>
                                Select Certificate Image / PDF (Max 2MB)
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleFileSelect}
                                disabled={uploading}
                                style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 12 }}
                            />
                            {fileSizeStr && (
                                <div style={{ fontSize: 11.5, color: "#16a34a", marginTop: 4, fontWeight: 600 }}>
                                    ✓ File selected: {fileSizeStr}
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                            <button
                                type="button"
                                onClick={() => setUploadModalOpen(false)}
                                disabled={uploading}
                                style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", color: "#475569", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploading || !fileBase64}
                                style={{ padding: "8px 20px", borderRadius: 8, background: "#002147", color: "white", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}
                            >
                                {uploading ? "Uploading & Verifying..." : "Save to Vault"}
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Preview Modal */}
                {previewDoc && (
                    <DocumentPreviewModal
                        isOpen={previewModalOpen}
                        onClose={() => { setPreviewModalOpen(false); setPreviewDoc(null); }}
                        document={previewDoc}
                    />
                )}

                {/* AI OCR Extracted Data Modal */}
                <Modal
                    isOpen={parseModalOpen}
                    onClose={() => setParseModalOpen(false)}
                    title="AI OCR Extracted Data"
                >
                    <div style={{ marginTop: 10 }}>
                        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
                            Local Multimodal AI extracted the following verified fields from your certificate:
                        </p>

                        <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "monospace", marginBottom: 16 }}>
                            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                                {JSON.stringify(extractedData, null, 2)}
                            </pre>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button
                                onClick={() => setParseModalOpen(false)}
                                style={{ padding: "8px 16px", borderRadius: 8, background: "#f1f5f9", color: "#475569", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
                            >
                                Close
                            </button>
                            <button
                                onClick={handleUpdateProfileWithExtracted}
                                style={{ padding: "8px 16px", borderRadius: 8, background: "#16a34a", color: "white", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}
                            >
                                Sync to Profile
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* DigiLocker National Gateway Sync Modal */}
                <DigiLockerSyncModal
                    isOpen={digiLockerModalOpen}
                    onClose={() => setDigiLockerModalOpen(false)}
                    onSuccess={() => fetchDocuments()}
                />
            </div>
        </DocumentsAnimate>
    );
}
