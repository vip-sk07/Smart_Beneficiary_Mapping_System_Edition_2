"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Megaphone, Search, Pin, ArrowRight } from "lucide-react";
import { AnnouncementsAnimate } from "@/components/ui/PageAnimations";

interface Announcement {
    id: string; title: string; content: string; pinned: boolean; 
    category?: string | null; schemeId?: string | null; scheme?: { title: string } | null;
    createdAt: string;
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch("/api/announcements");
                const data = await res.json();
                setAnnouncements(data.announcements || []);
                // Mark as read in background
                fetch("/api/announcements/read", { method: "POST" }).catch(() => {});
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        }
        load();
    }, []);

    const filtered = announcements.filter(a => {
        if (filterCategory !== "all" && a.category !== filterCategory) return false;
        if (searchQuery.trim() && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    return (
        <AnnouncementsAnimate>
        <div style={{ maxWidth: 800 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
                <div>
                    <h1 className="page-title">Announcements</h1>
                    <p className="page-subtitle">Latest news, updates, and scheme alerts.</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 24, padding: "16px 20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ flex: "1 1 250px", position: "relative" }}>
                        <Search size={16} color="#9ca3af" style={{ position: "absolute", left: 14, top: 12 }} />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            className="input"
                            style={{ paddingLeft: 40, height: 40 }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: "0 1 200px" }}>
                        <select className="input" style={{ height: 40 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            <option value="all">All Categories</option>
                            <option value="general">General</option>
                            <option value="scheme_update">Scheme Update</option>
                            <option value="deadline">Deadline Alert</option>
                            <option value="new_scheme">New Scheme</option>
                            <option value="budget">Budget News</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                    <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#1a38f5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "60px 24px", color: "#9ca3af" }}>
                    <Megaphone size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                    <p style={{ fontSize: 16, fontWeight: 600 }}>No announcements found</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {filtered.map(a => (
                        <div key={a.id} className="card" style={{ padding: "20px" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                                {a.pinned && (
                                    <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "#1a38f5", color: "white" }}>
                                        <Pin size={10} style={{ display: "inline", marginRight: 4 }} /> PINNED
                                    </span>
                                )}
                                {a.category && (
                                    <span style={{ 
                                        padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, 
                                        background: a.category === "deadline" ? "#fee2e2" : a.category === "new_scheme" ? "#dcfce7" : a.category === "scheme_update" ? "#f3e8ff" : a.category === "budget" ? "#ffedd5" : "#e0e7ff",
                                        color: a.category === "deadline" ? "#ef4444" : a.category === "new_scheme" ? "#22c55e" : a.category === "scheme_update" ? "#a855f7" : a.category === "budget" ? "#f97316" : "#6366f1",
                                    }}>
                                        {a.category.replace("_", " ").toUpperCase()}
                                    </span>
                                )}
                                {a.scheme && (
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", background: "#f3f4f6", padding: "2px 10px", borderRadius: 99 }}>
                                        🔗 {a.scheme.title}
                                    </span>
                                )}
                            </div>
                            
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
                                {a.title}
                            </h2>
                            <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, whiteSpace: "pre-line", marginBottom: 16 }}>
                                {a.content}
                            </p>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
                                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                                    {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(a.createdAt))}
                                </span>
                                {a.schemeId && (
                                    <Link href={`/schemes/${a.schemeId}`} style={{ fontSize: 13, fontWeight: 600, color: "#1a38f5", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                        View Scheme <ArrowRight size={14} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        </AnnouncementsAnimate>
    );
}
