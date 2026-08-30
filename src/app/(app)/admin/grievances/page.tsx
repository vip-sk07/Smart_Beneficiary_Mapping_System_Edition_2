"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { SkeletonTableRow } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";
import { MessageSquare, Search, Download } from "lucide-react";
import { exportToCSV, transformGrievancesForExport, type ExportGrievance } from "@/lib/exportCSV";

interface Grievance {
    id: string;
    subject: string;
    description: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    response: string | null;
    createdAt: string;
    user: { name: string; email: string };
}

export default function AdminGrievancesPage() {
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Grievance | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [response, setResponse] = useState("");
    const [saving, setSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    async function load() {
        setLoading(true);
        const res = await fetch("/api/admin/grievances");
        const data = await res.json();
        setGrievances(data.grievances ?? []);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    function openReview(g: Grievance) {
        setSelected(g);
        setNewStatus(g.status);
        setResponse(g.response ?? "");
    }

    async function handleUpdate() {
        if (!selected) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/grievances`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selected.id, status: newStatus, response }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error ?? "Update failed"); return; }
            toast.success("Grievance updated!");
            setSelected(null);
            load();
        } catch { toast.error("Something went wrong"); }
        finally { setSaving(false); }
    }

    const filtered = grievances.filter(g => {
        const matchSearch = !search ||
            g.user.name?.toLowerCase().includes(search.toLowerCase()) ||
            g.subject.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || g.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const statusColors: Record<string, { bg: string; color: string }> = {
        OPEN: { bg: "#fff7ed", color: "#c2410c" },
        IN_PROGRESS: { bg: "#eff6ff", color: "#1d4ed8" },
        RESOLVED: { bg: "#f0fdf4", color: "#15803d" },
        CLOSED: { bg: "#f9fafb", color: "#6b7280" },
    };

    const handleExport = () => {
        setIsExporting(true);
        try {
            const exportData: ExportGrievance[] = filtered.map((g) => ({
                id: g.id,
                subject: g.subject,
                description: g.description,
                status: g.status,
                userName: g.user.name,
                userEmail: g.user.email,
                createdAt: g.createdAt,
                resolvedAt: g.status === "RESOLVED" || g.status === "CLOSED" ? g.createdAt : null,
            }));
            const transformed = transformGrievancesForExport(exportData);
            exportToCSV(transformed, "grievances");
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Export failed");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div style={{ maxWidth: 1100 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h1 className="page-title">Manage Grievances</h1>
                    <p className="page-subtitle">{filtered.length} grievances shown</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={handleExport}
                        disabled={isExporting || filtered.length === 0}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 16px",
                            background: filtered.length === 0 ? "#e5e7eb" : "linear-gradient(135deg, #1a38f5, #4f6ef7)",
                            color: filtered.length === 0 ? "#9ca3af" : "white",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: filtered.length === 0 ? "not-allowed" : "pointer",
                        }}
                    >
                        <Download size={16} />
                        {isExporting ? "Exporting..." : "Export CSV"}
                    </button>
                    <div style={{ position: "relative" }}>
                        <Search size={15} color="#9ca3af" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                        <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 200 }} />
                    </div>
                    <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 150 }}>
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="gov-table">
                    <thead>
                        <tr><th>Citizen</th><th>Subject</th><th>Date</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} cols={5} />) :
                            filtered.map(g => (
                                <tr key={g.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{g.user.name}</div>
                                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{g.user.email}</div>
                                    </td>
                                    <td style={{ fontSize: 13, color: "#374151", maxWidth: 260 }}>{g.subject}</td>
                                    <td style={{ fontSize: 13, color: "#6b7280", whiteSpace: "nowrap" }}>
                                        {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(g.createdAt))}
                                    </td>
                                    <td><Badge status={g.status} /></td>
                                    <td>
                                        <button onClick={() => openReview(g)} className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>
                                            Respond
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>No grievances found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Respond to Grievance">
                {selected && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{selected.subject}</div>
                            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{selected.description}</p>
                            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                                From: {selected.user.name} · {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(selected.createdAt))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Update Status</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map(s => {
                                    const c = statusColors[s];
                                    return (
                                        <button key={s} onClick={() => setNewStatus(s)}
                                            style={{
                                                padding: "9px 8px", borderRadius: 8,
                                                border: `2px solid ${newStatus === s ? c.color : "#e5e7eb"}`,
                                                background: newStatus === s ? c.bg : "white",
                                                cursor: "pointer", fontSize: 12, fontWeight: 600,
                                                color: newStatus === s ? c.color : "#6b7280",
                                                fontFamily: "Sora, sans-serif",
                                            }}
                                        >
                                            {s.replace("_", " ")}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Response to Citizen</label>
                            <textarea className="input" rows={4} placeholder="Write your official response…" value={response} onChange={e => setResponse(e.target.value)} style={{ resize: "vertical" }} />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button onClick={() => setSelected(null)} className="btn-secondary">Cancel</button>
                            <button id="update-grievance-btn" onClick={handleUpdate} disabled={saving} className="btn-primary">{saving ? "Saving…" : "Send Response"}</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
