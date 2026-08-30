"use client";

import { useState } from "react";
import { Shield, UserCheck, Download } from "lucide-react";
import { exportToCSV, transformUsersForExport, type ExportUser } from "@/lib/exportCSV";

interface UsersTableProps {
    users: {
        id: string;
        name: string | null;
        email: string | null;
        role: string;
        state: string | null;
        occupation: string | null;
        createdAt: Date;
        _count: { applications: number; grievances: number };
    }[];
}

export function UsersTable({ users }: UsersTableProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        try {
            const exportData: ExportUser[] = users.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email || "",
                role: u.role,
                state: u.state,
                income: null,
                createdAt: u.createdAt,
            }));
            const transformed = transformUsersForExport(exportData);
            exportToCSV(transformed, "users");
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                <button
                    onClick={handleExport}
                    disabled={isExporting || users.length === 0}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 16px",
                        background: users.length === 0 ? "#e5e7eb" : "linear-gradient(135deg, #1a38f5, #4f6ef7)",
                        color: users.length === 0 ? "#9ca3af" : "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: users.length === 0 ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                    }}
                >
                    <Download size={16} />
                    {isExporting ? "Exporting..." : "Export CSV"}
                </button>
            </div>

            <div className="table-wrapper">
                <table className="gov-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>State / Occupation</th>
                            <th>Role</th>
                            <th>Applications</th>
                            <th>Grievances</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div
                                            style={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: "50%",
                                                background:
                                                    u.role === "ADMIN"
                                                        ? "linear-gradient(135deg, #ff9933, #f59e0b)"
                                                        : "linear-gradient(135deg, #1a38f5, #4f6ef7)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "white",
                                                fontWeight: 700,
                                                fontSize: 13,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {u.name?.[0]?.toUpperCase() ?? "?"}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>
                                                {u.name ?? "—"}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#9ca3af" }}>{u.email ?? "—"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: 13, color: "#374151" }}>{u.state ?? "—"}</div>
                                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{u.occupation ?? "—"}</div>
                                </td>
                                <td>
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            padding: "3px 10px",
                                            borderRadius: 99,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            background: u.role === "ADMIN" ? "#fff4e6" : "#e8ecff",
                                            color: u.role === "ADMIN" ? "#c2410c" : "#1a38f5",
                                            border: `1px solid ${u.role === "ADMIN" ? "#fed7aa" : "#bfdbfe"}`,
                                        }}
                                    >
                                        {u.role === "ADMIN" ? <Shield size={11} /> : <UserCheck size={11} />}
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ fontSize: 13, color: "#374151", textAlign: "center" }}>
                                    {u._count.applications}
                                </td>
                                <td style={{ fontSize: 13, color: "#374151", textAlign: "center" }}>
                                    {u._count.grievances}
                                </td>
                                <td style={{ fontSize: 13, color: "#6b7280", whiteSpace: "nowrap" }}>
                                    {new Intl.DateTimeFormat("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }).format(new Date(u.createdAt))}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}
                                >
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
