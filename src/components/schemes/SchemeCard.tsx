"use client";

import Link from "next/link";
import type { SchemeWithCategory } from "@/types";
import { ArrowRight, CheckCircle, ExternalLink, Building2 } from "lucide-react";
import EligibilityBadge from "./EligibilityBadge";
import AudioReadButton from "@/components/voice/AudioReadButton";
import SendSchemeToWhatsApp from "@/components/whatsapp/SendSchemeToWhatsApp";
import { motion } from "framer-motion";

interface SchemeCardProps {
    scheme: SchemeWithCategory;
    applied?: boolean;
    eligibilityStatus?: "eligible" | "not_eligible" | "docs_pending" | "unknown";
}

export default function SchemeCard({ scheme, applied = false, eligibilityStatus }: SchemeCardProps) {
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

    const catColor = scheme.category?.color ?? "#1e40af";

    return (
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
                    {isCentral ? "Central Govt" : "State Welfare"}
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
                    {scheme.category?.name || "General"}
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
                    borderTop: "1px solid #f1f5f9"
                }}>
                    <AudioReadButton text={`${scheme.title}. ${preview}`} />
                    <SendSchemeToWhatsApp
                        schemeTitle={scheme.title}
                        schemeBenefit={scheme.benefits}
                        applyLink={scheme.applyLink || undefined}
                        variant="icon"
                    />

                    <Link
                        href={`/schemes/${scheme.id}`}
                        style={{
                            flex: 1,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            padding: "8px 12px",
                            borderRadius: 6,
                            background: "#0f2e5a",
                            color: "white",
                            fontSize: 12.5,
                            fontWeight: 600,
                            textDecoration: "none",
                            transition: "background 0.15s ease",
                        }}
                        className="hover:bg-blue-900"
                    >
                        View Details <ArrowRight size={13} />
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
                                gap: 4,
                                padding: "8px 12px",
                                borderRadius: 6,
                                background: "#f8fafc",
                                color: "#0f2e5a",
                                border: "1px solid #cbd5e1",
                                fontSize: 12.5,
                                fontWeight: 600,
                                textDecoration: "none",
                                transition: "all 0.15s ease",
                            }}
                            className="hover:bg-slate-100 hover:border-slate-400"
                            title="Open Official Portal"
                        >
                            Portal <ExternalLink size={12} />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
