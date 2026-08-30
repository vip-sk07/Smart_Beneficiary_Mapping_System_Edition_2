"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import GrievanceForm from "@/components/forms/GrievanceForm";
import type { GrievanceType } from "@/types";
import { Plus, AlertCircle, MessageSquare } from "lucide-react";
import { GrievancesAnimate } from "@/components/ui/PageAnimations";

export default function GrievancesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [grievances, setGrievances] = useState<GrievanceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Redirect admin to their own grievances panel
    useEffect(() => {
        if (session?.user?.role === "ADMIN") {
            router.replace("/admin/grievances");
        }
    }, [session, router]);

    async function loadGrievances() {
        setLoading(true);
        const res = await fetch("/api/grievances");
        const data = await res.json();
        setGrievances(data.grievances ?? []);
        setLoading(false);
    }

    useEffect(() => { loadGrievances(); }, []);

    function handleSuccess() {
        setModalOpen(false);
        loadGrievances();
    }

    return (
        <GrievancesAnimate>
        <div style={{ maxWidth: 960 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 28,
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <div>
                    <h1 className="page-title">My Grievances</h1>
                    <p className="page-subtitle">
                        {grievances.length} total grievance{grievances.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    id="new-grievance-btn"
                    onClick={() => setModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus size={16} /> Submit New Grievance
                </button>
            </div>

            {loading ? (
                <div className="card" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            border: "3px solid #e5e7eb",
                            borderTopColor: "#1a38f5",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                            margin: "0 auto",
                        }}
                    />
                </div>
            ) : grievances.length === 0 ? (
                <div
                    className="card"
                    style={{ textAlign: "center", padding: "60px 24px", color: "#9ca3af" }}
                >
                    <AlertCircle size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                    <p style={{ fontSize: 16, fontWeight: 600 }}>No grievances submitted</p>
                    <p style={{ fontSize: 14, marginTop: 6 }}>
                        If you have an issue with a scheme or application, submit a grievance.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {grievances.map((g) => (
                        <div key={g.id} className="card">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    marginBottom: g.response ? 12 : 0,
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            marginBottom: 6,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                                            {g.subject}
                                        </h3>
                                        <Badge status={g.status} />
                                    </div>
                                    <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                                        {g.description}
                                    </p>
                                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                                        Submitted:{" "}
                                        {new Intl.DateTimeFormat("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        }).format(new Date(g.createdAt))}
                                    </p>
                                </div>
                            </div>

                            {/* Admin response */}
                            {g.response && (
                                <div
                                    style={{
                                        marginTop: 12,
                                        padding: "12px 14px",
                                        background: "#f0fdf4",
                                        borderRadius: 8,
                                        borderLeft: "3px solid #86efac",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            marginBottom: 6,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: "#15803d",
                                        }}
                                    >
                                        <MessageSquare size={13} /> Admin Response
                                    </div>
                                    <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                                        {g.response}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Submit a Grievance"
            >
                <GrievanceForm onSuccess={handleSuccess} />
            </Modal>
        </div>
        </GrievancesAnimate>
    );
}
