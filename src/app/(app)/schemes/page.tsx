"use client";

import { useState, useEffect, useCallback } from "react";
import SchemeCard from "@/components/schemes/SchemeCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import type { SchemeWithCategory } from "@/types";
import VoiceInputButton from "@/components/voice/VoiceInputButton";
import {
    Search,
    Filter,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Building,
    MapPin,
    Users,
    Layers,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SchemesAnimate } from "@/components/ui/PageAnimations";

export const dynamic = "force-dynamic";

const INDIAN_STATES_AND_UTS = [
    "All States & UTs",
    "Central",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
];

export default function SchemesPage() {
    const [schemes, setSchemes] = useState<SchemeWithCategory[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [selectedState, setSelectedState] = useState("All States & UTs");
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [selectedGender, setSelectedGender] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
    const [eligibilityMap, setEligibilityMap] = useState<Record<string, "eligible" | "not_eligible" | "docs_pending" | "unknown">>({});

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const loadSchemes = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (categoryId) params.set("categoryId", categoryId);
        if (selectedState && selectedState !== "All States & UTs") params.set("state", selectedState);
        if (selectedLevel && selectedLevel !== "all") params.set("level", selectedLevel);
        if (selectedGender && selectedGender !== "all") params.set("gender", selectedGender);
        params.set("page", page.toString());
        params.set("limit", "12");

        try {
            const [sRes, aRes, eRes] = await Promise.all([
                fetch(`/api/schemes?${params.toString()}`),
                fetch("/api/applications"),
                fetch("/api/eligibility"),
            ]);

            const sData = await sRes.json();
            const aData = await aRes.json();
            const eData = await eRes.json();

            setSchemes(sData.schemes ?? []);
            if (sData.categories) setCategories(sData.categories);
            if (sData.pagination) {
                setTotalPages(sData.pagination.totalPages || 1);
                setTotalCount(sData.pagination.totalCount || 0);
            }

            if (aData.applications) {
                setAppliedIds(new Set(aData.applications.map((a: { schemeId: string }) => a.schemeId)));
            }

            if (eData) {
                const eMap: Record<string, "eligible" | "not_eligible" | "docs_pending" | "unknown"> = {};
                (eData.eligible || []).forEach((s: any) => (eMap[s.id] = "eligible"));
                (eData.docsPending || []).forEach((s: any) => (eMap[s.id] = "docs_pending"));
                (eData.notEligible || []).forEach((s: any) => (eMap[s.id] = "not_eligible"));
                (eData.incomplete || []).forEach((s: any) => (eMap[s.id] = "unknown"));
                setEligibilityMap(eMap);
            }
        } catch (e) {
            console.error("Failed to load schemes:", e);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, categoryId, selectedState, selectedLevel, selectedGender, page]);

    useEffect(() => {
        loadSchemes();
    }, [loadSchemes]);

    const resetFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setCategoryId("");
        setSelectedState("All States & UTs");
        setSelectedLevel("all");
        setSelectedGender("all");
        setPage(1);
    };

    const hasActiveFilters = Boolean(
        search || categoryId || selectedState !== "All States & UTs" || selectedLevel !== "all" || selectedGender !== "all"
    );

    return (
        <SchemesAnimate>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                {/* Classical myScheme Banner */}
                <div style={{
                    background: "linear-gradient(135deg, #002147 0%, #0a3d62 100%)",
                    borderRadius: 12,
                    padding: "24px 28px",
                    color: "white",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 16,
                    boxShadow: "0 4px 14px rgba(0, 33, 71, 0.12)"
                }}>
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
                            National Welfare Directory
                        </div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
                            Browse Government Schemes
                        </h1>
                        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.8)", marginTop: 4, margin: 0 }}>
                            Explore and filter official Central and State Government welfare programs
                        </p>
                    </div>

                    <div style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: "10px 20px",
                        borderRadius: 8,
                        textAlign: "center",
                    }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#93c5fd" }}>
                            {totalCount.toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Schemes Available
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Layout */}
                <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
                    
                    {/* Left Faceted Filters Sidebar */}
                    <aside style={{
                        background: "white",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        padding: 20,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        position: "sticky",
                        top: 20,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#0f2e5a", fontSize: 15 }}>
                                <Filter size={16} /> Filters
                            </div>
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        background: "none",
                                        border: "none",
                                        color: "#ef4444",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    <RotateCcw size={12} /> Reset
                                </button>
                            )}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            {/* State / UT Filter */}
                            <div>
                                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                                    <MapPin size={14} color="#64748b" /> State / UT
                                </label>
                                <select
                                    value={selectedState}
                                    onChange={(e) => {
                                        setSelectedState(e.target.value);
                                        setPage(1);
                                    }}
                                    className="input"
                                    style={{ width: "100%", fontSize: 13, padding: "8px 10px", borderColor: "#cbd5e1" }}
                                >
                                    {INDIAN_STATES_AND_UTS.map((st) => (
                                        <option key={st} value={st}>{st}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Level Filter */}
                            <div>
                                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                                    <Building size={14} color="#64748b" /> Scheme Level
                                </label>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                                    {[
                                        { id: "all", label: "All" },
                                        { id: "central", label: "Central" },
                                        { id: "state", label: "State" }
                                    ].map((lvl) => (
                                        <button
                                            key={lvl.id}
                                            onClick={() => {
                                                setSelectedLevel(lvl.id);
                                                setPage(1);
                                            }}
                                            style={{
                                                padding: "6px 8px",
                                                borderRadius: 6,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                border: selectedLevel === lvl.id ? "1.5px solid #0f2e5a" : "1px solid #cbd5e1",
                                                background: selectedLevel === lvl.id ? "#0f2e5a" : "#f8fafc",
                                                color: selectedLevel === lvl.id ? "white" : "#475569",
                                                cursor: "pointer",
                                                transition: "all 0.15s ease",
                                            }}
                                        >
                                            {lvl.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Gender Filter */}
                            <div>
                                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
                                    <Users size={14} color="#64748b" /> Beneficiary Gender
                                </label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                    {[
                                        { id: "all", label: "All Genders" },
                                        { id: "female", label: "Women Only" },
                                        { id: "male", label: "Men" },
                                        { id: "transgender", label: "Transgender" }
                                    ].map((g) => (
                                        <button
                                            key={g.id}
                                            onClick={() => {
                                                setSelectedGender(g.id);
                                                setPage(1);
                                            }}
                                            style={{
                                                padding: "6px 8px",
                                                borderRadius: 6,
                                                fontSize: 11.5,
                                                fontWeight: 600,
                                                border: selectedGender === g.id ? "1.5px solid #0f2e5a" : "1px solid #cbd5e1",
                                                background: selectedGender === g.id ? "#0f2e5a" : "#f8fafc",
                                                color: selectedGender === g.id ? "white" : "#475569",
                                                cursor: "pointer",
                                                textAlign: "center",
                                            }}
                                        >
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "#334155", marginBottom: 10 }}>
                                    <Layers size={14} color="#64748b" /> Categories
                                </label>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                                    <button
                                        onClick={() => {
                                            setCategoryId("");
                                            setPage(1);
                                        }}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "7px 10px",
                                            borderRadius: 6,
                                            fontSize: 12.5,
                                            fontWeight: categoryId === "" ? 700 : 500,
                                            background: categoryId === "" ? "#eff6ff" : "transparent",
                                            color: categoryId === "" ? "#1d4ed8" : "#334155",
                                            border: "none",
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        <span>All Categories</span>
                                        <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "1px 6px", borderRadius: 99 }}>
                                            {totalCount}
                                        </span>
                                    </button>

                                    {categories.map((c) => {
                                        const count = c._count?.schemes ?? "";
                                        const isSelected = categoryId === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    setCategoryId(isSelected ? "" : c.id);
                                                    setPage(1);
                                                }}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "7px 10px",
                                                    borderRadius: 6,
                                                    fontSize: 12.5,
                                                    fontWeight: isSelected ? 700 : 500,
                                                    background: isSelected ? "#eff6ff" : "transparent",
                                                    color: isSelected ? "#1d4ed8" : "#334155",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    textAlign: "left",
                                                    transition: "all 0.15s ease",
                                                }}
                                                className="hover:bg-slate-50"
                                            >
                                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 6 }}>
                                                    {c.name}
                                                </span>
                                                {count !== "" && (
                                                    <span style={{ fontSize: 10.5, color: isSelected ? "#1d4ed8" : "#64748b", background: isSelected ? "#dbeafe" : "#f1f5f9", padding: "1px 6px", borderRadius: 99, flexShrink: 0 }}>
                                                        {count}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Content Area */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        
                        {/* Search Bar + Active Filters Bar */}
                        <div style={{
                            background: "white",
                            padding: "16px 20px",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                                <div style={{ position: "relative", flex: 1 }}>
                                    <Search
                                        size={17}
                                        color="#64748b"
                                        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
                                    />
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Search 4,700+ schemes by keyword, ministry, benefit, or qualification…"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{ paddingLeft: 42, paddingRight: search ? 36 : 14, height: 42, fontSize: 13.5, borderColor: "#cbd5e1" }}
                                        id="scheme-search"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch("")}
                                            style={{
                                                position: "absolute",
                                                right: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                background: "none",
                                                border: "none",
                                                color: "#94a3b8",
                                                cursor: "pointer",
                                                padding: 4
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                <VoiceInputButton
                                    onTranscript={(transcript) => setSearch(transcript)}
                                    placeholder="Search by voice..."
                                />
                            </div>

                            {/* Status Header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#64748b" }}>
                                <div>
                                    Showing <strong style={{ color: "#0f2e5a" }}>{schemes.length}</strong> of <strong style={{ color: "#0f2e5a" }}>{totalCount.toLocaleString("en-IN")}</strong> schemes
                                    {debouncedSearch && <span> for &ldquo;{debouncedSearch}&rdquo;</span>}
                                </div>
                                <div>
                                    Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Scheme Grid */}
                        {loading ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : schemes.length === 0 ? (
                            <div style={{
                                background: "white",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                padding: "60px 24px",
                                textAlign: "center",
                                color: "#64748b"
                            }}>
                                <Search size={44} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f2e5a", marginBottom: 6 }}>No matching schemes found</h3>
                                <p style={{ fontSize: 13.5, maxWidth: 400, margin: "0 auto 16px" }}>
                                    Try adjusting your search terms, changing the state filter, or clearing your selected category.
                                </p>
                                <button
                                    onClick={resetFilters}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: 6,
                                        background: "#0f2e5a",
                                        color: "white",
                                        border: "none",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer"
                                    }}
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                                {schemes.map((s, index) => (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <SchemeCard
                                            scheme={s}
                                            applied={appliedIds.has(s.id)}
                                            eligibilityStatus={eligibilityMap[s.id]}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Classical Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                marginTop: 16,
                                padding: "16px",
                                background: "white",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0"
                            }}>
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "7px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #cbd5e1",
                                        background: page === 1 ? "#f1f5f9" : "#ffffff",
                                        color: page === 1 ? "#94a3b8" : "#0f2e5a",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: page === 1 ? "not-allowed" : "pointer"
                                    }}
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>

                                <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "0 8px" }}>
                                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                        let pageNum = page;
                                        if (page <= 3) {
                                            pageNum = i + 1;
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }

                                        if (pageNum < 1 || pageNum > totalPages) return null;

                                        const isActive = pageNum === page;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                style={{
                                                    width: 34,
                                                    height: 34,
                                                    borderRadius: 6,
                                                    border: isActive ? "1.5px solid #0f2e5a" : "1px solid #e2e8f0",
                                                    background: isActive ? "#0f2e5a" : "#f8fafc",
                                                    color: isActive ? "white" : "#334155",
                                                    fontSize: 13,
                                                    fontWeight: isActive ? 700 : 500,
                                                    cursor: "pointer"
                                                }}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "7px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #cbd5e1",
                                        background: page === totalPages ? "#f1f5f9" : "#ffffff",
                                        color: page === totalPages ? "#94a3b8" : "#0f2e5a",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: page === totalPages ? "not-allowed" : "pointer"
                                    }}
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SchemesAnimate>
    );
}
