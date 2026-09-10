"use client";

import { useState, useEffect } from "react";
import {
    ShieldCheck,
    Lock,
    CheckCircle2,
    Download,
    Loader2,
    Sparkles,
    FileText,
    ExternalLink,
    AlertCircle,
    KeyRound,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

interface DigiLockerDoc {
    id: string;
    docType: string;
    name: string;
    issuer: string;
    issuedDate: string;
    certificateNumber: string;
    digitalSignature: string;
    validUntil: string | null;
}

interface DigiLockerSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DigiLockerSyncModal({
    isOpen,
    onClose,
    onSuccess,
}: DigiLockerSyncModalProps) {
    const [step, setStep] = useState<"consent" | "select" | "importing">("consent");
    const [availableDocs, setAvailableDocs] = useState<DigiLockerDoc[]>([]);
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);

    // Fetch available documents when opened
    useEffect(() => {
        if (isOpen) {
            setStep("consent");
            setSelectedDocIds([]);
            fetchIssuedDocs();
        }
    }, [isOpen]);

    const fetchIssuedDocs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/digilocker");
            if (res.ok) {
                const data = await res.json();
                setAvailableDocs(data.issuedDocs || []);
                // By default select all
                setSelectedDocIds((data.issuedDocs || []).map((d: any) => d.id));
            }
        } catch {
            toast.error("Failed to connect to DigiLocker Gateway");
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedDocIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleImport = async () => {
        if (selectedDocIds.length === 0) {
            toast.error("Please select at least 1 certificate to import.");
            return;
        }

        setImporting(true);
        setStep("importing");

        try {
            const res = await fetch("/api/digilocker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selectedDocIds }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`🎉 ${data.message}`);
                onSuccess();
                onClose();
            } else {
                toast.error(data.error || "Failed to import certificates.");
                setStep("select");
            }
        } catch {
            toast.error("Network error during DigiLocker sync.");
            setStep("select");
        } finally {
            setImporting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => !importing && onClose()}
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#002147", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                        DL
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f2e5a" }}>DigiLocker National Gateway Sync</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>MeriPehchaan (National SSO) • 100% Cryptographically Verified</div>
                    </div>
                </div>
            }
            maxWidth={640}
        >
            <div style={{ marginTop: 14 }}>
                {step === "consent" && (
                    <div>
                        <div style={{ background: "linear-gradient(135deg, #002147 0%, #1e40af 100%)", borderRadius: 12, padding: "20px", color: "white", marginBottom: 18 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, width: "fit-content", marginBottom: 10 }}>
                                <ShieldCheck size={14} color="#86efac" />
                                <span>OFFICIAL DIGILOCKER PARTNER INTEGRATION</span>
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 6px" }}>
                                Direct Government Certificate Import
                            </h3>
                            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.5 }}>
                                Automatically import your issued government certificates (Aadhaar e-KYC, Revenue Income Certificate, Community Certificate, Marksheets) directly from the DigiLocker National Repository.
                            </p>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#334155" }}>
                                <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                                <span><strong>Zero Manual Uploads:</strong> No need to scan or take photos of physical certificates.</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#334155" }}>
                                <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                                <span><strong>Cryptographic Digital Signatures:</strong> Issued directly by Tamil Nadu e-District & UIDAI.</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#334155" }}>
                                <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                                <span><strong>100% Vault Completion:</strong> Automatically unlocks all top matching welfare schemes!</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{ padding: "9px 16px", borderRadius: 8, background: "#f1f5f9", color: "#475569", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep("select")}
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 8, background: "#002147", color: "white", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}
                            >
                                Continue to Document Selection →
                            </button>
                        </div>
                    </div>
                )}

                {step === "select" && (
                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2e5a" }}>
                                Available DigiLocker Certificates ({availableDocs.length})
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedDocIds(selectedDocIds.length === availableDocs.length ? [] : availableDocs.map(d => d.id))}
                                style={{ fontSize: 12, color: "#2563eb", fontWeight: 700, background: "transparent", border: "none", cursor: "pointer" }}
                            >
                                {selectedDocIds.length === availableDocs.length ? "Deselect All" : "Select All"}
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                <Loader2 size={28} color="#002147" className="animate-spin" style={{ margin: "0 auto 8px" }} />
                                <div style={{ fontSize: 13, color: "#64748b" }}>Querying DigiLocker Issued Repository...</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 340, overflowY: "auto", paddingRight: 4, marginBottom: 20 }}>
                                {availableDocs.map(doc => {
                                    const isSelected = selectedDocIds.includes(doc.id);
                                    return (
                                        <div
                                            key={doc.id}
                                            onClick={() => toggleSelect(doc.id)}
                                            style={{
                                                padding: "12px 14px",
                                                borderRadius: 10,
                                                border: isSelected ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                                                background: isSelected ? "#f0f7ff" : "white",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: 12,
                                                transition: "all 0.15s ease",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    style={{ width: 16, height: 16, accentColor: "#2563eb", cursor: "pointer" }}
                                                />
                                                <div>
                                                    <h4 style={{ fontSize: 13.5, fontWeight: 800, color: "#0f2e5a", margin: 0 }}>
                                                        {doc.name}
                                                    </h4>
                                                    <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                                                        {doc.issuer} · Ref: <span style={{ fontFamily: "monospace" }}>{doc.certificateNumber}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <span style={{ fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>
                                                ✓ Signed
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <button
                                type="button"
                                onClick={() => setStep("consent")}
                                style={{ padding: "9px 14px", borderRadius: 8, background: "#f1f5f9", color: "#475569", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
                            >
                                ← Back
                            </button>

                            <button
                                type="button"
                                onClick={handleImport}
                                disabled={selectedDocIds.length === 0}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "9px 22px",
                                    borderRadius: 8,
                                    background: "#16a34a",
                                    color: "white",
                                    fontSize: 13.5,
                                    fontWeight: 700,
                                    border: "none",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.2)",
                                }}
                            >
                                <Download size={15} /> Import {selectedDocIds.length} Certificates to Vault
                            </button>
                        </div>
                    </div>
                )}

                {step === "importing" && (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <Loader2 size={36} color="#16a34a" className="animate-spin" style={{ margin: "0 auto 14px" }} />
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f2e5a", margin: "0 0 6px" }}>
                            Importing & Cryptographically Verifying...
                        </h3>
                        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                            Writing signed XML certificates into your secure Document Vault and synchronizing profile data.
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
