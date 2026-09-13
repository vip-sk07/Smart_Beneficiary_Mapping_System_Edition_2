"use client";

import { useState } from "react";
import Link from "next/link";
import type { SchemeWithCategory } from "@/types";
import { ArrowRight, ExternalLink, Building2, Bot } from "lucide-react";
import EligibilityBadge from "./EligibilityBadge";
import AudioReadButton from "@/components/voice/AudioReadButton";
import SendSchemeToWhatsApp from "@/components/whatsapp/SendSchemeToWhatsApp";
import AutonomousAgentModal from "@/components/agent/AutonomousAgentModal";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface SchemeCardProps {
    scheme: SchemeWithCategory;
    applied?: boolean;
    eligibilityStatus?: "eligible" | "not_eligible" | "docs_pending" | "unknown";
}

export default function SchemeCard({ scheme, applied = false, eligibilityStatus }: SchemeCardProps) {
    const { t } = useLanguage();
    const [isAgentOpen, setIsAgentOpen] = useState(false);
    const isCentral = scheme.description?.toLowerCase().includes("level:** central") ?? false;
    
    // Extract ministry if available
    let ministry = "";
    const ministryMatch = scheme.description?.match(/\*\*Nodal Ministry \/ Department:\*\*\s*([^\n*]+)/i);
    if (ministryMatch) {
        ministry = ministryMatch[1].trim();
    }

    const preview = scheme.description
        ? scheme.description.replace(/\*\*[^*]+\*\*/g, "").replace(/•/g, "").slice(0, 140).trim() + "…"
        : scheme.benefits.slice(0, 140) + "…";

    const categoryName = scheme.category?.name || "General";
    const localizedCategory = t(`category.${categoryName}`, categoryName);

    return (
        <>
            <motion.div
                style={{
                    background: "#ffffff",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 6px rgba(0, 33, 71, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    height: "100%",
                    transition: "all 0.2s ease",
                }}
                whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0, 33, 71, 0.08)", borderColor: "#93c5fd" }}
            >
                {/* Top Government Tag Bar */}
                <div style={{
                    background: "#f8fafc",
                    padding: "8px 16px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    fontSize: 11,
                    fontWeight: 600
                }}>
                    <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        color: isCentral ? "#1d4ed8" : "#047857",
                        background: isCentral ? "#eff6ff" : "#ecfdf5",
                        padding: "2px 8px",
                        borderRadius: 4,
                        border: `1px solid ${isCentral ? "#bfdbfe" : "#a7f3d0"}`,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        fontSize: 10,
                        fontWeight: 700
                    }}>
                        {isCentral ? t("card.central_govt", "Central Govt") : t("card.state_welfare", "State Welfare")}
                    </span>

                    <span style={{
                        color: "#475569",
                        background: "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        maxWidth: 160,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>
                        {localizedCategory}
                    </span>
                </div>

                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                    {/* Ministry Label */}
                    {ministry && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 11.5, fontWeight: 500 }}>
                            <Building2 size={13} color="#94a3b8" />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ministry}</span>
                        </div>
                    )}

                    {/* Scheme Title */}
                    <h3 style={{
                        fontSize: 15.5,
                        fontWeight: 700,
                        color: "#0f2e5a",
                        lineHeight: 1.4,
                        letterSpacing: "-0.01em"
                    }}>
                        <Link
                            href={`/schemes/${scheme.id}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                            className="hover:text-blue-700 transition-colors"
                        >
                            {scheme.title}
                        </Link>
                    </h3>

                    {/* Eligibility badge if available */}
                    {eligibilityStatus && (
                        <div><EligibilityBadge status={eligibilityStatus} /></div>
                    )}

                    {/* Description Preview */}
                    <p style={{
                        fontSize: 13,
                        color: "#475569",
                        lineHeight: 1.6,
                        flex: 1,
                        fontWeight: 400
                    }}>
                        {preview}
                    </p>

                    {/* Bottom Actions Bar */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: "auto",
                        paddingTop: 12,
                        borderTop: "1px solid #f1f5f9",
                        flexWrap: "wrap",
                    }}>
                        <AudioReadButton text={`${scheme.title}. ${preview}`} />
                        <SendSchemeToWhatsApp
                            schemeTitle={scheme.title}
                            schemeBenefit={scheme.benefits}
                            applyLink={scheme.applyLink || undefined}
                            variant="icon"
                        />

                        {/* Fast Autonomous Agent Action */}
                        <button
                            onClick={() => setIsAgentOpen(true)}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "7px 11px",
                                borderRadius: 6,
                                background: "linear-gradient(135deg, #0f2e5a 0%, #1e40af 100%)",
                                color: "white",
                                fontSize: 12,
                                fontWeight: 700,
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(15, 46, 90, 0.15)",
                            }}
                            className="hover:opacity-95"
                            title="Auto-fill and submit via Autonomous Agent"
                        >
                            <Bot size={13} className="text-blue-300" />
                            <span>Fast Apply</span>
                        </button>

                        <Link
                            href={`/schemes/${scheme.id}`}
                            style={{
                                flex: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 4,
                                padding: "7px 10px",
                                borderRadius: 6,
                                background: "#f8fafc",
                                color: "#0f2e5a",
                                border: "1px solid #cbd5e1",
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: "none",
                                transition: "background 0.15s ease",
                            }}
                            className="hover:bg-slate-100"
                        >
                            {t("card.view_details", "Details")} <ArrowRight size={12} />
                        </Link>

                        {scheme.applyLink && (
                            <a
                                href={scheme.applyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 3,
                                    padding: "7px 9px",
                                    borderRadius: 6,
                                    background: "#f8fafc",
                                    color: "#64748b",
                                    border: "1px solid #e2e8f0",
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                }}
                                className="hover:bg-slate-100"
                                title="Open Official Portal"
                            >
                                <ExternalLink size={12} />
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>

            <AutonomousAgentModal
                isOpen={isAgentOpen}
                onClose={() => setIsAgentOpen(false)}
                schemeId={scheme.id}
                schemeTitle={scheme.title}
            />
        </>
    );
}
