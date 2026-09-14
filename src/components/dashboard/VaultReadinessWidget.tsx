"use client";

import React from "react";
import Link from "next/link";
import { 
    ShieldCheck, 
    UploadCloud, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight, 
    Sparkles, 
    CreditCard, 
    Building2, 
    FileText,
    TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

interface DocumentItem {
    id: string;
    name: string;
    type: string;
    expiresAt?: Date | string | null;
}

interface VaultReadinessProps {
    documents: DocumentItem[];
    userAadhaar?: string | null;
}

export default function VaultReadinessWidget({ documents = [], userAadhaar }: VaultReadinessProps) {
    const hasAadhaar = Boolean(userAadhaar || documents.some(d => d.type === "aadhaar" || d.name.toLowerCase().includes("aadhaar")));
    const hasBank = documents.some(d => d.type === "bank_passbook" || d.name.toLowerCase().includes("bank") || d.name.toLowerCase().includes("passbook"));
    const hasIncome = documents.some(d => d.type === "income" || d.name.toLowerCase().includes("income"));
    const hasCommunityOrRation = documents.some(d => ["caste", "ration", "residence", "domicile"].includes(d.type) || d.name.toLowerCase().includes("caste") || d.name.toLowerCase().includes("ration"));

    const coreCredentials = [
        {
            id: "aadhaar",
            title: "Aadhaar e-KYC",
            sub: "Biometric Identity & UIDAI",
            isUploaded: hasAadhaar,
            icon: <CreditCard size={18} />,
            color: "#1e40af",
            bg: "rgba(30, 64, 175, 0.08)",
            benefitText: "Primary ID for all 4,700+ schemes"
        },
        {
            id: "bank",
            title: "Bank Account / DBT",
            sub: "Direct Treasury Seeding",
            isUploaded: hasBank,
            icon: <Building2 size={18} />,
            color: "#047857",
            bg: "rgba(4, 120, 87, 0.08)",
            benefitText: "Required for Direct Cash Transfer"
        },
        {
            id: "income",
            title: "Income Certificate",
            sub: "Revenue Dept / e-Seva",
            isUploaded: hasIncome,
            icon: <FileText size={18} />,
            color: "#b45309",
            bg: "rgba(180, 83, 9, 0.08)",
            benefitText: "Unlocks ₹25,000+ Scholarships"
        },
        {
            id: "community",
            title: "Ration / Caste Card",
            sub: "Social Welfare & Food Security",
            isUploaded: hasCommunityOrRation,
            icon: <ShieldCheck size={18} />,
            color: "#7c3aed",
            bg: "rgba(124, 58, 237, 0.08)",
            benefitText: "Unlocks State Subsidies & Quota"
        }
    ];

    const completedCount = coreCredentials.filter(c => c.isUploaded).length;
    const readinessPercent = Math.max(25, Math.round((completedCount / coreCredentials.length) * 100));
    const missingDocs = coreCredentials.filter(c => !c.isUploaded);

    return (
        <div style={{
            background: "white",
            borderRadius: 20,
            border: "1.5px solid #e2e8f0",
            padding: "24px",
            boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
            marginBottom: 24,
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Top Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #4338ca, #6366f1)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)"
                    }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                Document Vault Readiness
                            </h2>
                            <span style={{
                                fontSize: 10,
                                fontWeight: 800,
                                padding: "2px 8px",
                                borderRadius: 99,
                                background: readinessPercent >= 75 ? "rgba(22, 163, 74, 0.1)" : "rgba(234, 88, 12, 0.1)",
                                color: readinessPercent >= 75 ? "#15803d" : "#c2410c",
                                border: `1px solid ${readinessPercent >= 75 ? "rgba(22, 163, 74, 0.2)" : "rgba(234, 88, 12, 0.2)"}`,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em"
                            }}>
                                {readinessPercent >= 75 ? "High Readiness" : "Action Needed"}
                            </span>
                        </div>
                        <p style={{ fontSize: 13, color: "#64748b", margin: "3px 0 0 0" }}>
                            Verified credentials enable 100% automated scheme application
                        </p>
                    </div>
                </div>

                {/* Score Dial / Pill */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "8px 14px",
                    borderRadius: 14
                }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: readinessPercent >= 75 ? "#16a34a" : "#4338ca" }}>
                        {readinessPercent}%
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, lineHeight: 1.2 }}>
                        Readiness<br />Score
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                    <span>{completedCount} of {coreCredentials.length} Core Credentials Verified</span>
                    <span style={{ color: "#4338ca" }}>{readyStatusLabel(readinessPercent)}</span>
                </div>
                <div style={{ height: 9, width: "100%", background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${readinessPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{
                            height: "100%",
                            background: readinessPercent >= 75 
                                ? "linear-gradient(90deg, #3b82f6, #6366f1, #10b981)" 
                                : "linear-gradient(90deg, #f59e0b, #6366f1)",
                            borderRadius: 99
                        }}
                    />
                </div>
            </div>

            {/* Credential Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                marginBottom: 18
            }}>
                {coreCredentials.map((cred) => (
                    <div
                        key={cred.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 14px",
                            borderRadius: 12,
                            background: cred.isUploaded ? "#f0fdf4" : "#f8fafc",
                            border: `1.5px solid ${cred.isUploaded ? "#bbf7d0" : "#e2e8f0"}`,
                            transition: "all 0.2s ease"
                        }}
                    >
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: cred.isUploaded ? "rgba(22, 163, 74, 0.12)" : cred.bg,
                            color: cred.isUploaded ? "#16a34a" : cred.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                        }}>
                            {cred.isUploaded ? <CheckCircle2 size={20} /> : cred.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                    {cred.title}
                                </span>
                                <span style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: cred.isUploaded ? "#16a34a" : "#b45309"
                                }}>
                                    {cred.isUploaded ? "Verified" : "Missing"}
                                </span>
                            </div>
                            <span style={{ fontSize: 11, color: "#64748b", display: "block", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {cred.benefitText}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Smart Unlock Callout Banner & Action Link */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 12,
                background: missingDocs.length > 0 ? "rgba(245, 158, 11, 0.08)" : "rgba(22, 163, 74, 0.08)",
                border: `1px solid ${missingDocs.length > 0 ? "rgba(245, 158, 11, 0.2)" : "rgba(22, 163, 74, 0.2)"}`
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
                    {missingDocs.length > 0 ? (
                        <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                    ) : (
                        <Sparkles size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: missingDocs.length > 0 ? "#92400e" : "#166534" }}>
                        {missingDocs.length > 0
                            ? `Upload ${missingDocs[0].title} to unlock pending welfare benefits and grants.`
                            : "All primary credentials verified! You are fully qualified for automated scheme submissions."}
                    </span>
                </div>

                <Link
                    href="/documents"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#4338ca",
                        textDecoration: "none",
                        background: "white",
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "1px solid #c7d2fe",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        transition: "all 0.15s ease"
                    }}
                >
                    <UploadCloud size={14} />
                    <span>Go to Vault</span>
                    <ArrowRight size={13} />
                </Link>
            </div>
        </div>
    );
}

function readyStatusLabel(pct: number): string {
    if (pct >= 100) return "Ready for 100% of Schemes";
    if (pct >= 75) return "Ready for 85% of Schemes";
    if (pct >= 50) return "Ready for 60% of Schemes";
    return "Initial Profile Set Up";
}
