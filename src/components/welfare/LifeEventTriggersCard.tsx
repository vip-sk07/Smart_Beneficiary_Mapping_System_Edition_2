"use client";

import { useState, useEffect } from "react";
import { Clock, ArrowRight, ShieldCheck, Sparkles, ChevronRight, BookmarkPlus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LifeEventTriggersCard() {
    const [milestones, setMilestones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/life-events")
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d && d.milestones) {
                    setMilestones(d.milestones);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading || milestones.length === 0) return null;

    return (
        <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0, 33, 71, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Clock size={16} color="#002147" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f2e5a", margin: 0 }}>
                            Proactive Life-Stage Welfare Triggers
                        </h2>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                            Schemes automatically predicted for your current age, education, and career milestones.
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
                {milestones.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{
                            background: "white",
                            border: `1.5px solid ${m.border}`,
                            borderRadius: 14,
                            padding: "18px 20px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}
                    >
                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: 99, background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
                                    {m.tag}
                                </span>
                            </div>

                            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                                {m.stage}
                            </h3>
                            <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5, marginBottom: 14 }}>
                                {m.description}
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                                {m.schemes.map((s: any, idx: number) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: "8px 10px",
                                            background: "#f8fafc",
                                            borderRadius: 8,
                                            border: "1px solid #e2e8f0",
                                            fontSize: 12.5
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, color: "#0f2e5a" }}>{s.title}</div>
                                        <div style={{ fontSize: 11.5, color: "#16a34a", fontWeight: 600 }}>✦ {s.benefit}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link
                            href="/schemes"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "8px 14px",
                                borderRadius: 8,
                                background: m.bg,
                                color: m.color,
                                border: `1px solid ${m.border}`,
                                fontSize: 12.5,
                                fontWeight: 700,
                                textDecoration: "none",
                                textAlign: "center"
                            }}
                            className="hover:opacity-90"
                        >
                            Explore Stage Schemes <ChevronRight size={14} />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
