"use client";

import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { SkeletonTableRow } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";
import { Search, CheckCircle, XCircle, Clock, Download, ExternalLink, FileText, Eye, FolderOpen, ShieldCheck } from "lucide-react";
import { exportToCSV } from "@/lib/exportCSV";
import DocumentPreviewModal from "@/components/vault/DocumentPreviewModal";

interface ApplicantDocument {
    id: string;
    name: string;
    type: string;
    fileUrl: string;
    fileSize: number | null;
    expiresAt: string | null;
    createdAt: string;
}

interface Application {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW";
    notes: string | null;
    submittedAt: string;
    user: {
        name: string;
        email: string;
        state?: string | null;
        income?: number | null;
        documents?: ApplicantDocument[];
    };
    scheme: { id: string; title: string; documents?: string | null };
    externalApplicationId: string | null;
    externalPortal: string | null;
}

function constructPortalUrl(portal: string, id: string): string | null {
    if (portal.toLowerCase().includes("national scholarship portal") || portal.toLowerCase().includes("nsp")) {
        return `https://scholarships.gov.in/track-application-status?appId=${id}`;
    }
    return null;
}

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selected, setSelected] = useState<Application | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<ApplicantDocument | null>(null);

    async function load() {
        setLoading(true);
        const res = await fetch("/api/admin/applications");
        const data = await res.json();
        setApplications(data.applications ?? []);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    function openReview(app: Application) {
        setSelected(app);
        setNewStatus(app.status);
        setNotes(app.notes ?? "");
    }

    async function handleUpdate() {
        if (!selected) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/applications/${selected.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, notes }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error ?? "Update failed"); return; }
            toast.success("Application updated!");
            setSelected(null);
            load();
        } catch { toast.error("Something went wrong"); }
        finally { setSaving(false); }
    }

    const filtered = applications.filter(a => {
        const matchSearch = !search ||
            a.user.name?.toLowerCase().includes(search.toLowerCase()) ||
            a.scheme.title.toLowerCase().includes(search.toLowerCase()) ||
            a.externalApplicationId?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || a.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleExport = () => {
        setIsExporting(true);
        try {
            const exportData: any[] = filtered.map((app) => ({
                id: app.id,
                userName: app.user.name,
                userEmail: app.user.email,
                schemeTitle: app.scheme.title,
                status: app.status,
                submittedAt: app.submittedAt,
                notes: app.notes,
                externalApplicationId: app.externalApplicationId,
                externalPortal: app.externalPortal,
            }));
            exportToCSV(exportData, "applications");
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
                    <h1 className="page-title">Manage Applications</h1>
                    <p className="page-subtitle">{filtered.length} applications shown</p>
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
                        <Download size={15} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1 1 260px" }}>
                    <Search size={15} color="#9ca3af" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Search by citizen, scheme, or ID…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <select className="input" style={{ width: 170 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Citizen</th>
                            <th>Scheme</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} columns={5} />)}
                        {!loading && filtered.map(app => (
                            <tr key={app.id}>
                                <td>
                                    <div style={{ fontWeight: 600, color: "#111827" }}>{app.user.name}</div>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>{app.user.email}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500, color: "#111827" }}>{app.scheme.title}</div>
                                </td>
                                <td><Badge status={app.status} /></td>
                                <td style={{ fontSize: 13, color: "#6b7280" }}>
                                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(app.submittedAt))}
                                </td>
                                <td>
                                    <button
                                        onClick={() => openReview(app)}
                                        className="btn-secondary"
                                        style={{ fontSize: 12, padding: "5px 12px" }}
                                    >
                                        Review & Verify Docs
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={5} style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>No applications found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Review & Document Verification Modal */}
            <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Review Application & Verify Documents">
                {selected && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2e5a", marginBottom: 4 }}>{selected.scheme.title}</div>
                            <div style={{ fontSize: 13, color: "#475569" }}>Citizen: <strong>{selected.user.name}</strong> ({selected.user.email})</div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                                Applied on: {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(selected.submittedAt))}
                            </div>
                        </div>

                        {/* Applicant Uploaded Documents Verification Box */}
                        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                                <ShieldCheck size={16} color="#0f2e5a" />
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f2e5a" }}>Applicant Uploaded Certificates (Vault)</span>
                            </div>

                            {(!selected.user.documents || selected.user.documents.length === 0) ? (
                                <div style={{ fontSize: 12.5, color: "#ea580c", background: "#fff7ed", padding: "10px 12px", borderRadius: 6, border: "1px solid #fed7aa" }}>
                                    ⚠ No documents uploaded into the Document Vault by this applicant yet.
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {selected.user.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "8px 12px",
                                                background: "#f8fafc",
                                                borderRadius: 6,
                                                border: "1px solid #e2e8f0",
                                                fontSize: 13
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <FileText size={16} color="#1d4ed8" />
                                                <div>
                                                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{doc.name}</div>
                                                    <div style={{ fontSize: 11, color: "#64748b" }}>
                                                        Type: {doc.type} {doc.fileSize ? `· ${(doc.fileSize / 1024).toFixed(0)} KB` : ""}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setPreviewDoc(doc)}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    padding: "5px 10px",
                                                    borderRadius: 6,
                                                    background: "#eff6ff",
                                                    color: "#1d4ed8",
                                                    border: "1px solid #bfdbfe",
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    cursor: "pointer"
                                                }}
                                                className="hover:bg-blue-100"
                                            >
                                                <Eye size={13} /> View & Verify
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selected.externalApplicationId && (
                            <div className="input-group">
                                <label className="label">External Application Details</label>
                                <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                                    <p><strong>ID:</strong> {selected.externalApplicationId}</p>
                                    <p><strong>Portal:</strong> {selected.externalPortal}</p>
                                    {constructPortalUrl(selected.externalPortal!, selected.externalApplicationId) && (
                                        <a 
                                            href={constructPortalUrl(selected.externalPortal!, selected.externalApplicationId)!}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="link"
                                            style={{display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8}}
                                        >
                                            Verify on Portal <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="input-group">
                            <label className="label">Update Application Status</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setNewStatus(s)}
                                        style={{
                                            padding: "10px 8px", borderRadius: 8, border: `2px solid ${newStatus === s ? "#0f2e5a" : "#e5e7eb"}`,
                                            background: newStatus === s ? "#eff6ff" : "white", cursor: "pointer", fontSize: 12, fontWeight: 600,
                                            color: newStatus === s ? "#0f2e5a" : "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                            fontFamily: "Sora, sans-serif",
                                        }}
                                    >
                                        {s === "APPROVED" && <CheckCircle size={14} />}
                                        {s === "REJECTED" && <XCircle size={14} />}
                                        {(s === "PENDING" || s === "UNDER_REVIEW") && <Clock size={14} />}
                                        {s.replace("_", " ")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Official Remarks / Notes</label>
                            <textarea className="input" rows={3} placeholder="Add verification remarks for the citizen…" value={notes} onChange={e => setNotes(e.target.value)} style={{ resize: "vertical" }} />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                            <button onClick={() => setSelected(null)} className="btn-secondary">Cancel</button>
                            <button id="update-application-btn" onClick={handleUpdate} disabled={saving} className="btn-primary">{saving ? "Saving…" : "Save Verification Decision"}</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Document Preview Modal */}
            {previewDoc && (
                <DocumentPreviewModal
                    isOpen={!!previewDoc}
                    onClose={() => setPreviewDoc(null)}
                    fileUrl={previewDoc.fileUrl}
                    fileName={previewDoc.name}
                    fileType={previewDoc.type}
                />
            )}
        </div>
    );
}
