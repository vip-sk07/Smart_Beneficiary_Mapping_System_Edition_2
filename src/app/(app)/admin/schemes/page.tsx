"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { SkeletonTableRow } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";
import { Plus, Search, Edit2, Trash2, Star } from "lucide-react";

interface Category { id: string; name: string; color: string | null; icon: string | null; }
interface Scheme {
    id: string; title: string; isActive: boolean; categoryId: string;
    category: { name: string }; description: string; benefits: string;
    eligibility: string; documents: string; applyLink: string | null;
}

export default function AdminSchemesPage() {
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editScheme, setEditScheme] = useState<Scheme | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [form, setForm] = useState({
        title: "", description: "", benefits: "", eligibility: "",
        documents: "", applyLink: "", categoryId: "",
    });

    async function loadSchemes() {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        const res = await fetch(`/api/schemes?${params}`);
        const data = await res.json();
        setSchemes(data.schemes ?? []);
        setCategories(data.categories ?? []);
        setLoading(false);
    }

    useEffect(() => { loadSchemes(); }, [search]);

    function openCreate() {
        setEditScheme(null);
        setForm({ title: "", description: "", benefits: "", eligibility: "", documents: "", applyLink: "", categoryId: categories[0]?.id ?? "" });
        setModalOpen(true);
    }

    function openEdit(s: Scheme) {
        setEditScheme(s);
        setForm({ title: s.title, description: s.description, benefits: s.benefits, eligibility: s.eligibility, documents: s.documents, applyLink: s.applyLink ?? "", categoryId: s.categoryId });
        setModalOpen(true);
    }

    async function handleSave() {
        if (!form.title || !form.description || !form.benefits || !form.eligibility || !form.categoryId) {
            toast.error("Please fill in all required fields"); return;
        }
        setSaving(true);
        try {
            const url = editScheme ? `/api/schemes/${editScheme.id}` : "/api/schemes";
            const method = editScheme ? "PATCH" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error ?? "Failed to save"); return; }
            toast.success(editScheme ? "Scheme updated!" : "Scheme created!");
            setModalOpen(false);
            loadSchemes();
        } catch { toast.error("Something went wrong"); }
        finally { setSaving(false); }
    }

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        const res = await fetch(`/api/schemes/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("Scheme deleted"); loadSchemes(); }
        else toast.error("Failed to delete");
    }

    const filtered = schemes.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ maxWidth: 1100 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h1 className="page-title">Manage Schemes</h1>
                    <p className="page-subtitle">{schemes.length} total schemes</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ position: "relative" }}>
                        <Search size={15} color="#9ca3af" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                        <input className="input" placeholder="Search schemes…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 220 }} />
                    </div>
                    <button id="create-scheme-btn" onClick={openCreate} className="btn-primary"><Plus size={16} /> New Scheme</button>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="gov-table">
                    <thead>
                        <tr><th>Scheme Title</th><th>Category</th><th>Status</th><th style={{ width: 120 }}>Actions</th></tr>
                    </thead>
                    <tbody>
                        {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={4} />) :
                            filtered.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: "#111827", display: "flex", alignItems: "center", gap: 6 }}>
                                            {s.title}
                                        </div>
                                    </td>
                                    <td><span style={{ fontSize: 13, color: "#6b7280" }}>{s.category.name}</span></td>
                                    <td>
                                        <span className={`badge ${s.isActive ? "badge-approved" : "badge-closed"}`}>
                                            {s.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button onClick={() => openEdit(s)} className="btn-ghost" style={{ padding: "6px 8px", fontSize: 12 }}><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(s.id, s.title)} className="btn-danger" style={{ padding: "6px 8px", fontSize: 12, border: "none", background: "#fef2f2" }}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editScheme ? "Edit Scheme" : "Create New Scheme"} maxWidth={600}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div className="input-group"><label className="label">Title *</label><input className="input" placeholder="Scheme name" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                    <div className="input-group">
                        <label className="label">Category *</label>
                        <select className="input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                            <option value="">Select category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="input-group"><label className="label">Description *</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: "vertical" }} /></div>
                    <div className="input-group"><label className="label">Benefits *</label><textarea className="input" rows={3} value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} style={{ resize: "vertical" }} /></div>
                    <div className="input-group"><label className="label">Eligibility Criteria *</label><textarea className="input" rows={3} value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} style={{ resize: "vertical" }} /></div>
                    <div className="input-group"><label className="label">Required Documents</label><textarea className="input" rows={2} value={form.documents} onChange={e => setForm({ ...form, documents: e.target.value })} style={{ resize: "vertical" }} /></div>
                    <div className="input-group"><label className="label">Apply Link (URL)</label><input className="input" placeholder="https://..." value={form.applyLink} onChange={e => setForm({ ...form, applyLink: e.target.value })} /></div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                        <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button id="save-scheme-btn" onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "Saving…" : editScheme ? "Update Scheme" : "Create Scheme"}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
