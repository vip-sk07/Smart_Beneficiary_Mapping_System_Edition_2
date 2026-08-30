"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { Plus, Pin, Trash2, Megaphone } from "lucide-react";

interface Announcement {
    id: string; title: string; content: string; pinned: boolean; isActive: boolean; createdAt: string;
    category?: string | null; schemeId?: string | null; scheme?: { id: string, title: string } | null;
}
interface SchemeOpt { id: string; title: string; }

export default function AdminAnnouncementsPage() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [pinned, setPinned] = useState(false);
    const [category, setCategory] = useState("general");
    const [schemeId, setSchemeId] = useState("");
    const [schemes, setSchemes] = useState<SchemeOpt[]>([]);
    const [saving, setSaving] = useState(false);

    async function load() {
        setLoading(true);
        const res = await fetch("/api/admin/announcements");
        const data = await res.json();
        setItems(data.announcements ?? []);
        setSchemes(data.schemes ?? []);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    function openCreate() {
        setTitle(""); setContent(""); setPinned(false); setCategory("general"); setSchemeId(""); setModalOpen(true);
    }

    async function handleCreate() {
        if (!title.trim() || !content.trim()) { toast.error("Title and content required"); return; }
        setSaving(true);
        try {
            const res = await fetch("/api/admin/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, pinned, category, schemeId: schemeId || undefined }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error ?? "Failed"); return; }
            toast.success("Announcement published!");
            setModalOpen(false);
            load();
        } catch { toast.error("Something went wrong"); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this announcement?")) return;
        const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("Deleted"); load(); }
        else toast.error("Delete failed");
    }

    return (
        <div style={{ maxWidth: 800 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                    <h1 className="page-title">Announcements</h1>
                    <p className="page-subtitle">Publish notices visible to all citizens on their dashboard</p>
                </div>
                <button id="create-announcement-btn" onClick={openCreate} className="btn-primary"><Plus size={16} /> New Announcement</button>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                    <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#1a38f5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                </div>
            ) : items.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "60px 24px", color: "#9ca3af" }}>
                    <Megaphone size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                    <p style={{ fontSize: 16, fontWeight: 600 }}>No announcements yet</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {items.map(a => (
                        <div key={a.id} className="card">
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        {a.pinned && (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: "#e8ecff", color: "#1a38f5" }}>
                                                <Pin size={11} /> Pinned
                                            </span>
                                        )}
                                        {a.category && (
                                            <span style={{ 
                                                display: "inline-flex", padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700, 
                                                background: a.category === "deadline" ? "#fee2e2" : a.category === "new_scheme" ? "#dcfce7" : a.category === "scheme_update" ? "#f3e8ff" : a.category === "budget" ? "#ffedd5" : "#e0e7ff",
                                                color: a.category === "deadline" ? "#ef4444" : a.category === "new_scheme" ? "#22c55e" : a.category === "scheme_update" ? "#a855f7" : a.category === "budget" ? "#f97316" : "#6366f1",
                                            }}>
                                                {a.category.replace("_", " ").toUpperCase()}
                                            </span>
                                        )}
                                        {a.scheme && (
                                            <span style={{ display: "inline-flex", fontSize: 11, fontWeight: 600, color: "#4b5563", background: "#f3f4f6", padding: "2px 8px", borderRadius: 99 }}>
                                                🔗 {a.scheme.title}
                                            </span>
                                        )}
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{a.title}</h3>
                                    </div>
                                    <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{a.content}</p>
                                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                                        {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(a.createdAt))}
                                    </p>
                                </div>
                                <button onClick={() => handleDelete(a.id)} className="btn-danger" style={{ padding: "6px 8px", border: "none", background: "#fef2f2", flexShrink: 0 }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Announcement">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="input-group"><label className="label">Title *</label><input className="input" placeholder="Announcement title" value={title} onChange={e => setTitle(e.target.value)} /></div>
                    <div className="input-group"><label className="label">Category *</label>
                        <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="general">General</option>
                            <option value="scheme_update">Scheme Update</option>
                            <option value="deadline">Deadline Alert</option>
                            <option value="new_scheme">New Scheme</option>
                            <option value="budget">Budget News</option>
                        </select>
                    </div>
                    <div className="input-group"><label className="label">Link to Scheme (Optional)</label>
                        <select className="input" value={schemeId} onChange={e => setSchemeId(e.target.value)}>
                            <option value="">-- None --</option>
                            {schemes.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>
                    <div className="input-group"><label className="label">Content *</label><textarea className="input" rows={5} placeholder="Write the announcement…" value={content} onChange={e => setContent(e.target.value)} style={{ resize: "vertical" }} /></div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "#374151" }}>
                        <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#1a38f5" }} />
                        Pin to top of dashboard
                    </label>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button id="publish-announcement-btn" onClick={handleCreate} disabled={saving} className="btn-primary">{saving ? "Publishing…" : "Publish"}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
