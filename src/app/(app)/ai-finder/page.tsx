// @ts-nocheck
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Search, CheckCircle2, Zap, Brain, Target } from "lucide-react";
import SchemeCard from "@/components/schemes/SchemeCard";
import toast from "react-hot-toast";

const SUGGESTIONS = [
    { emoji: "🌾", text: "Farmer crop support", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
    { emoji: "👩", text: "Woman business loan", color: "#c026d3", bg: "rgba(192,38,211,0.08)" },
    { emoji: "🎓", text: "Student scholarship", color: "#4338ca", bg: "rgba(67,56,202,0.08)" },
    { emoji: "👴", text: "Senior citizen pension", color: "#ea580c", bg: "rgba(234,88,12,0.08)" },
    { emoji: "🏠", text: "Housing for low income", color: "#0891b2", bg: "rgba(8,145,178,0.08)" },
];

export default function AIFinderPage() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    async function handleSearch() {
        const q = query.trim();
        if (!q) return;
        setIsLoading(true);
        setResults(null);
        try {
            const res = await fetch("/api/ai-finder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q }),
            });
            if (!res.ok) throw new Error("Failed to fetch matches");
            setResults(await res.json());
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            {/* ── Hero ── */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                style={{ textAlign: "center", marginBottom: 40 }}
            >
                {/* Floating icon */}
                <div style={{ display: "inline-flex", position: "relative", marginBottom: 20 }}>
                    <div style={{
                        width: 72, height: 72,
                        background: "linear-gradient(135deg, #4338ca, #818cf8)",
                        borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 12px 32px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.2)",
                    }}>
                        <Sparkles size={34} color="white" />
                    </div>
                    {/* Ping ring */}
                    <div style={{
                        position: "absolute", inset: -6, borderRadius: 26,
                        border: "2px solid rgba(99,102,241,0.25)",
                        animation: "ping-slow 3s ease-in-out infinite",
                    }} />
                </div>

                {/* Pill badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 99, padding: "5px 14px", marginBottom: 16 }}>
                    <Brain size={13} color="#4338ca" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#4338ca", letterSpacing: "0.03em" }}>Local AI (Ollama) + pgvector RAG</span>
                </div>

                <h1 style={{ fontSize: 36, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", lineHeight: 1.15, marginBottom: 14 }}>
                    AI Scheme Finder
                </h1>
                <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, maxWidth: 560, margin: "0 auto", fontWeight: 400 }}>
                    Describe your situation in plain language — our advanced AI will instantly analyze your needs and match you to the right government schemes.
                </p>
            </motion.div>

            {/* ── Search Box ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12, duration: 0.45 }}
                style={{ marginBottom: 32 }}
            >
                <div style={{ position: "relative", marginBottom: 16 }}>
                    {/* Glow effect */}
                    <div style={{
                        position: "absolute", inset: -2, borderRadius: 100,
                        background: "linear-gradient(135deg, #4338ca, #818cf8, #c084fc)",
                        opacity: 0.25, filter: "blur(8px)",
                        pointerEvents: "none",
                    }} />
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <Search size={20} color="#94a3b8" style={{ position: "absolute", left: 20, zIndex: 1 }} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="E.g. I am a 45 year old farmer looking for tractor subsidy in Maharashtra..."
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                padding: "18px 20px 18px 52px",
                                fontSize: 15,
                                fontFamily: "Sora, sans-serif",
                                background: "white",
                                border: "2px solid #e2e8f0",
                                borderRadius: 100,
                                outline: "none",
                                fontWeight: 500,
                                color: "#0f172a",
                                transition: "border-color 0.2s, box-shadow 0.2s",
                                boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                                paddingRight: 64,
                            }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.12)"; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.05)"; }}
                        />
                        <button
                            onClick={handleSearch}
                            disabled={!query.trim() || isLoading}
                            style={{
                                position: "absolute", right: 6,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                width: 48, height: 48,
                                background: !query.trim() || isLoading ? "#e2e8f0" : "linear-gradient(135deg, #4338ca, #6366f1)",
                                color: !query.trim() || isLoading ? "#94a3b8" : "white",
                                border: "none", borderRadius: "50%", cursor: !query.trim() || isLoading ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: !query.trim() || isLoading ? "none" : "0 4px 12px rgba(99,102,241,0.35)",
                            }}
                        >
                            {isLoading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                    <Sparkles size={18} />
                                </motion.div>
                            ) : (
                                <ArrowRight size={20} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Suggestion Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                    {SUGGESTIONS.map((s, i) => (
                        <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.06 }}
                            onClick={() => setQuery(s.text)}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "8px 16px",
                                background: query === s.text ? s.bg : "white",
                                border: `1.5px solid ${query === s.text ? s.color : "#e2e8f0"}`,
                                borderRadius: 99,
                                fontSize: 13, fontWeight: 600,
                                color: query === s.text ? s.color : "#475569",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                fontFamily: "Sora, sans-serif",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                            }}
                            whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(0,0,0,0.08)" }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {s.emoji} {s.text}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* ── Loading ── */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            background: "white",
                            borderRadius: 24, border: "1.5px solid #e8edf5",
                            padding: "48px 32px",
                            textAlign: "center",
                            boxShadow: "0 8px 32px rgba(99,102,241,0.1)",
                        }}
                    >
                        <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 20px" }}>
                            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(99,102,241,0.12)", animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
                            <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "linear-gradient(135deg, #4338ca, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
                                <Sparkles size={24} color="white" />
                            </div>
                        </div>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 8, letterSpacing: "-0.02em" }}>Analyzing your query...</h3>
                        <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>Running local AI model &amp; pgvector similarity search</p>

                        {/* Animated progress dots */}
                        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 20 }}>
                            {["Embedding query...", "Vector search...", "AI matching..."].map((step, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", animation: `pulse ${1.2 + i * 0.2}s ease-in-out infinite` }} />
                                    {step}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Results ── */}
            <AnimatePresence>
                {results && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ display: "flex", flexDirection: "column", gap: 28 }}
                    >
                        {/* AI Analysis Card */}
                        <div style={{ background: "linear-gradient(145deg, #1e1b4b, #312e81)", borderRadius: 24, padding: "28px 32px", color: "white", position: "relative", overflow: "hidden", boxShadow: "0 20px 40px rgba(30,27,75,0.3)" }}>
                            {/* Background decoration */}
                            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(129,140,248,0.1)", pointerEvents: "none" }} />
                            <div style={{ position: "absolute", bottom: -20, left: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(192,132,252,0.08)", pointerEvents: "none" }} />

                            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 20 }}>
                                {/* Header row */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(165,180,252,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                            <Brain size={12} /> AI Detected Intent
                                        </div>
                                        <h2 style={{ fontSize: 22, fontWeight: 900, color: "white", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{results.intent}</h2>
                                    </div>

                                    {/* Confidence gauge */}
                                    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "14px 20px", border: "1px solid rgba(255,255,255,0.1)", minWidth: 180 }}>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                                            <Target size={11} /> Confidence Score
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 99, overflow: "hidden" }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${results.confidence}%` }}
                                                    transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                                                    style={{ height: "100%", borderRadius: 99, background: results.confidence > 75 ? "linear-gradient(90deg, #34d399, #22c55e)" : "linear-gradient(90deg, #fbbf24, #f59e0b)" }}
                                                />
                                            </div>
                                            <span style={{ fontWeight: 900, fontSize: 18, color: "white", minWidth: 44 }}>{results.confidence}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 20px", border: "1px solid rgba(165,180,252,0.15)" }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(165,180,252,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                                        <Zap size={11} /> AI Summary
                                    </div>
                                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, fontStyle: "italic", fontWeight: 400 }}>
                                        "{results.ai_summary}"
                                    </p>
                                </div>

                                {/* Keywords */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>Keywords:</span>
                                    {results.keywords?.map((kw: string, i: number) => (
                                        <span key={i} style={{ padding: "4px 12px", background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.25)", color: "#a5b4fc", borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: "capitalize" }}>
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Schemes Grid */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(22,163,74,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <CheckCircle2 size={18} color="#16a34a" />
                                    </div>
                                    Top Matched Schemes
                                </h3>
                                <span style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a", fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 99, border: "1px solid rgba(22,163,74,0.2)" }}>
                                    {results.schemes?.length || 0} matched
                                </span>
                            </div>

                            {results.schemes?.length > 0 ? (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 20 }}>
                                    {results.schemes.map((scheme: any, idx: number) => (
                                        <motion.div
                                            key={scheme.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.08 }}
                                        >
                                            <SchemeCard scheme={scheme} />

                                            {/* AI reason */}
                                            <div style={{
                                                marginTop: 8, padding: "12px 14px",
                                                background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                                                borderRadius: 12, border: "1px solid #c7d2fe",
                                                display: "flex", gap: 8, alignItems: "flex-start"
                                            }}>
                                                <div style={{ width: 22, height: 22, borderRadius: 6, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <Sparkles size={12} color="#4338ca" />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 9, fontWeight: 800, color: "#4338ca", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
                                                        AI Match Reason · {scheme.matchScore}% score
                                                    </div>
                                                    <p style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.5, fontWeight: 500 }}>{scheme.matchReason}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: "48px 32px", textAlign: "center", background: "white", borderRadius: 20, border: "2px dashed #e2e8f0" }}>
                                    <Search size={40} color="#cbd5e1" style={{ margin: "0 auto 12px" }} />
                                    <p style={{ color: "#94a3b8", fontSize: 15, fontWeight: 600 }}>No matching schemes found.</p>
                                    <p style={{ color: "#cbd5e1", fontSize: 13, marginTop: 6 }}>Try rephrasing your query with more details.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle CSS animations */}
            <style>{`
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                @keyframes ping-slow {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.12); opacity: 0.1; }
                }
            `}</style>
        </div>
    );
}
