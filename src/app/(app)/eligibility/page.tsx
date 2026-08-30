"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, UserCog, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import EligibilityRing from "@/components/ui/EligibilityRing";
import SendSchemeToWhatsApp from "@/components/whatsapp/SendSchemeToWhatsApp";

type SchemeMatch = {
    id: string;
    title: string;
    description: string;
    reason: string;
    matchScore?: number;
    missingDocs?: string[];
    category: { name: string; color: string; icon: string; }
};

type EligibilityData = {
    eligible: SchemeMatch[];
    docsPending?: SchemeMatch[];
    notEligible: SchemeMatch[];
    incomplete: SchemeMatch[];
    profile: { hasMissingData: boolean; hasDocuments?: boolean; documentsCount?: number };
    householdIncome?: number;
};

export default function EligibilityPage() {
    const [data, setData] = useState<EligibilityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"eligible" | "docsPending" | "notEligible" | "incomplete">("eligible");
    const [familyMembers, setFamilyMembers] = useState<{ id: string; name: string; relation: string }[]>([]);
    const [selectedFamilyId, setSelectedFamilyId] = useState<string>("none");

    useEffect(() => {
        fetch("/api/family")
            .then(r => r.json())
            .then(d => { if (d.familyMembers) setFamilyMembers(d.familyMembers); })
            .catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/eligibility?familyId=${selectedFamilyId}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setData(d); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedFamilyId]);

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", gap: 16 }}>
                <div style={{ width: 64, height: 64, position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(99,102,241,0.15)", animation: "ping 1.5s ease-in-out infinite" }} />
                    <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "linear-gradient(135deg, #4338ca, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ShieldCheck size={22} color="white" />
                    </div>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#64748b" }}>Analyzing your profile & documents...</p>
                <style>{`@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }`}</style>
            </div>
        );
    }

    if (!data) return <div style={{ color: "#64748b", textAlign: "center", padding: 40 }}>Failed to load eligibility data.</div>;

    const tabs = [
        { id: "eligible", label: "Eligible & Verified", count: data.eligible.length, icon: CheckCircle2, color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
        { id: "docsPending", label: "Documents Pending", count: (data.docsPending || []).length, icon: ShieldCheck, color: "#d97706", bg: "#fffbeb", border: "#fcd34d" },
        { id: "incomplete", label: "Need More Data", count: data.incomplete.length, icon: AlertTriangle, color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
        { id: "notEligible", label: "Not Eligible", count: data.notEligible.length, icon: XCircle, color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
    ];
    const currentList = (data as any)[activeTab] || [];

    return (
        <div style={{ maxWidth: 1100 }}>
            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ShieldCheck size={20} color="#4338ca" />
                            </div>
                            {selectedFamilyId === "none" ? "My Eligibility Report" : `Eligibility — ${familyMembers.find(m => m.id === selectedFamilyId)?.name || "Member"}`}
                        </h1>
                        <p className="page-subtitle">Schemes automatically matched based on your age, gender, income, and state.</p>
                        {data.householdIncome !== undefined && (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 99, padding: "4px 12px" }}>
                                <Sparkles size={12} color="#4338ca" />
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#4338ca" }}>Household income: ₹{data.householdIncome?.toLocaleString("en-IN")} (you + family)</span>
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        {/* Send Eligible Report to WhatsApp Button */}
                        <SendSchemeToWhatsApp
                            allEligibleSchemes={data.eligible}
                            variant="banner"
                            buttonLabel="📲 Send Report to My WhatsApp"
                        />

                        {/* Family selector */}
                        <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${selectedFamilyId !== "none" ? "#4338ca" : "#cbd5e1"}`, background: selectedFamilyId !== "none" ? "#4338ca" : "white", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease", flexShrink: 0, cursor: "pointer" }}
                                    onClick={() => setSelectedFamilyId(selectedFamilyId !== "none" ? "none" : (familyMembers[0]?.id || "none"))}>
                                    {selectedFamilyId !== "none" && <CheckCircle2 size={10} color="white" />}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Check for Family</span>
                            </label>
                            {selectedFamilyId !== "none" && familyMembers.length > 0 && (
                                <select className="input" value={selectedFamilyId} onChange={(e) => setSelectedFamilyId(e.target.value)} style={{ minWidth: 160, padding: "6px 12px", fontSize: 13 }}>
                                    {familyMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Incomplete profile warning */}
            {data.profile.hasMissingData && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "1.5px solid #fcd34d", borderRadius: 16, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(217,119,6,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <AlertTriangle size={18} color="#d97706" />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#92400e", marginBottom: 2 }}>Your profile is incomplete</div>
                            <div style={{ fontSize: 13, color: "#b45309", fontWeight: 400 }}>
                                We couldn't check eligibility for {data.incomplete.length} schemes — complete your profile to unlock results.
                            </div>
                        </div>
                    </div>
                    <Link href="/profile" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#d97706", color: "white", padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", flexShrink: 0, boxShadow: "0 4px 12px rgba(217,119,6,0.3)" }}>
                        <UserCog size={15} /> Complete Profile
                    </Link>
                </motion.div>
            )}

            {/* Tab Bar */}
            <div style={{ display: "flex", gap: 4, background: "#f1f5f9", padding: 5, borderRadius: 16, marginBottom: 28, border: "1px solid #e2e8f0" }}>
                {tabs.map(({ id, label, count, icon: Icon, color, bg, border }) => {
                    const active = activeTab === id;
                    return (
                        <button key={id} onClick={() => setActiveTab(id as any)}
                            style={{
                                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                                padding: "11px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                                fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: active ? 700 : 600,
                                color: active ? color : "#64748b",
                                background: active ? bg : "transparent",
                                boxShadow: active ? `0 2px 8px rgba(0,0,0,0.08), inset 0 0 0 1.5px ${border}` : "none",
                                transition: "all 0.18s ease",
                            }}>
                            <Icon size={15} />
                            {label}
                            <span style={{
                                fontSize: 11, fontWeight: 800,
                                background: active ? `${color}18` : "#e2e8f0",
                                color: active ? color : "#94a3b8",
                                padding: "2px 8px", borderRadius: 99,
                                border: active ? `1px solid ${color}30` : "none",
                            }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Scheme Grid */}
            {currentList.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ padding: "64px 32px", textAlign: "center", background: "white", borderRadius: 20, border: "2px dashed #e2e8f0" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                        {activeTab === "eligible" ? <CheckCircle2 size={28} color="#cbd5e1" /> : activeTab === "notEligible" ? <XCircle size={28} color="#cbd5e1" /> : <AlertTriangle size={28} color="#cbd5e1" />}
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>No schemes in this category.</p>
                    <p style={{ fontSize: 13, color: "#cbd5e1" }}>Try updating your profile for more matches.</p>
                </motion.div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                    <AnimatePresence mode="popLayout">
                        {currentList.map((scheme, i) => {
                            const statusConfig = activeTab === "eligible"
                                ? { label: "Eligible & Verified ✓", bg: "#f0fdf4", color: "#16a34a", border: "#86efac" }
                                : activeTab === "docsPending"
                                    ? { label: "Docs Pending 📄", bg: "#fffbeb", color: "#d97706", border: "#fcd34d" }
                                    : activeTab === "notEligible"
                                        ? { label: "Not Eligible ✕", bg: "#fef2f2", color: "#dc2626", border: "#fca5a5" }
                                        : { label: "Profile Incomplete ⚠", bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" };

                            return (
                                <motion.div
                                    key={scheme.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{
                                        background: "white", borderRadius: 18,
                                        border: "1.5px solid #e8edf5",
                                        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                                        display: "flex", flexDirection: "column",
                                        overflow: "hidden",
                                        transition: "box-shadow 0.2s ease",
                                    }}
                                    whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.1)" }}
                                >
                                    {/* Top bar */}
                                    <div style={{ height: 4, background: statusConfig.color, opacity: 0.6 }} />

                                    <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                                        {/* Header row */}
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ padding: "7px 9px", borderRadius: 10, fontSize: 18, background: `${scheme.category.color}12`, border: `1px solid ${scheme.category.color}20` }}>
                                                    {scheme.category.icon}
                                                </div>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: scheme.category.color, letterSpacing: "0.03em" }}>{scheme.category.name}</span>
                                            </div>
                                            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.04em", padding: "3px 9px", borderRadius: 99, background: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}`, textTransform: "uppercase", flexShrink: 0 }}>
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        <h3 style={{ fontSize: 14.5, fontWeight: 800, color: "#0f172a", lineHeight: 1.35, marginBottom: 8, letterSpacing: "-0.01em" }}>
                                            {scheme.title}
                                        </h3>
                                        <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.55, marginBottom: 12, flex: 1, fontWeight: 400 }}>
                                            {scheme.description?.slice(0, 110)}{scheme.description?.length > 110 ? "…" : ""}
                                        </p>

                                        {/* Reason chip */}
                                        <div style={{ padding: "9px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600, marginBottom: 14, background: statusConfig.bg, color: statusConfig.color, lineHeight: 1.5, border: `1px solid ${statusConfig.border}` }}>
                                            {scheme.reason}
                                        </div>

                                        <Link href={`/schemes/${scheme.id}`} style={{
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                            padding: "10px 16px", borderRadius: 10,
                                            background: activeTab === "eligible" ? "linear-gradient(135deg, #4338ca, #6366f1)" : "white",
                                            color: activeTab === "eligible" ? "white" : "#475569",
                                            border: activeTab === "eligible" ? "none" : "1.5px solid #e2e8f0",
                                            fontSize: 13, fontWeight: 700, textDecoration: "none",
                                            boxShadow: activeTab === "eligible" ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                                            transition: "all 0.15s ease",
                                        }}>
                                            {activeTab === "eligible" ? "Apply Now" : "View Details"} <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
