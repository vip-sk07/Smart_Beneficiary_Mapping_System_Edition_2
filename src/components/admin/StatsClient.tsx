"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { exportToCSV, transformApplicationStatsForExport, type ExportApplicationStats } from "@/lib/exportCSV";
import {
    Users,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    BookOpen,
    TrendingUp,
    MessageSquare,
    PieChart,
    BarChart3,
    Activity
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { ApplicationTrendsChart, SchemePopularityChart, StatusDistributionChart } from "@/components/admin/AnalyticsCharts";

interface StatsClientProps {
    totalUsers: number;
    totalSchemes: number;
    totalApps: number;
    totalCategories: number;
    appByStatus: Record<string, number>;
    openGrievances: number;
    trendData: { date: string; count: number }[];
    schemeData: { title: string; applications: number }[];
    pieData: { name: string; value: number }[];
    recentApplications: {
        id: string;
        user: { name: string | null; email: string | null };
        scheme: { title: string };
        submittedAt: Date;
        status: string;
    }[];
}

export function StatsClient({
    totalUsers,
    totalSchemes,
    totalApps,
    totalCategories,
    appByStatus,
    openGrievances,
    trendData,
    schemeData,
    pieData,
    recentApplications,
}: StatsClientProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        try {
            // Transform scheme data for export
            const exportData: ExportApplicationStats[] = schemeData.map((s) => ({
                scheme: s.title,
                totalApplications: s.applications,
                approved: Math.floor(s.applications * 0.4), // Approximate for demo
                pending: Math.floor(s.applications * 0.3),
                rejected: Math.floor(s.applications * 0.3),
            }));
            const transformed = transformApplicationStatsForExport(exportData);
            exportToCSV(transformed, "application_stats");
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div style={{ maxWidth: 1100 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                    <h1 className="page-title">Platform Statistics</h1>
                    <p className="page-subtitle">Real-time overview of the Smart Beneficiary Mapping System</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 16px",
                        background: "linear-gradient(135deg, #1a38f5, #4f6ef7)",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    <Download size={16} />
                    {isExporting ? "Exporting..." : "Export CSV"}
                </button>
            </div>

            {/* Stat Cards Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 24 }}>
                <StatCard title="Registered Citizens" value={totalUsers.toLocaleString("en-IN")} icon={<Users size={22} />} color="#1a38f5" bg="#e8ecff" />
                <StatCard title="Active Schemes" value={totalSchemes} icon={<BookOpen size={22} />} color="#138808" bg="#e6f4e6" />
                <StatCard title="Total Applications" value={totalApps.toLocaleString("en-IN")} icon={<FileText size={22} />} color="#7c3aed" bg="#f5f3ff" />
                <StatCard title="Categories" value={totalCategories} icon={<TrendingUp size={22} />} color="#ff9933" bg="#fff4e6" />
            </div>

            {/* Stat Cards Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 32 }}>
                <StatCard title="Approved" value={appByStatus["APPROVED"] ?? 0} icon={<CheckCircle2 size={22} />} color="#138808" bg="#e6f4e6" />
                <StatCard title="Pending" value={appByStatus["PENDING"] ?? 0} icon={<Clock size={22} />} color="#ff9933" bg="#fff4e6" />
                <StatCard title="Under Review" value={appByStatus["UNDER_REVIEW"] ?? 0} icon={<FileText size={22} />} color="#1a38f5" bg="#e8ecff" />
                <StatCard title="Open Grievances" value={openGrievances} icon={<AlertCircle size={22} />} color="#dc2626" bg="#fef2f2" />
            </div>

            {/* Analytics Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 32 }}>
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                        <Activity size={18} color="#1a38f5" />
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Application Trends</h2>
                    </div>
                    <ApplicationTrendsChart data={trendData} />
                </div>

                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                        <BarChart3 size={18} color="#138808" />
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Top Schemes</h2>
                    </div>
                    <SchemePopularityChart data={schemeData} />
                </div>

                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                        <PieChart size={18} color="#ff9933" />
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Status Distribution</h2>
                    </div>
                    <StatusDistributionChart data={pieData} />
                </div>
            </div>

            {/* Recent Applications Table */}
            <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                    <MessageSquare size={18} color="#1a38f5" />
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Recent Applications</h2>
                </div>
                <div className="table-wrapper" style={{ border: "none", boxShadow: "none", borderRadius: 0 }}>
                    <table className="gov-table">
                        <thead>
                            <tr>
                                <th>Citizen</th>
                                <th>Scheme</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentApplications.map((app) => (
                                <tr key={app.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{app.user.name ?? "—"}</div>
                                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{app.user.email ?? "—"}</div>
                                    </td>
                                    <td style={{ fontSize: 13, color: "#374151" }}>{app.scheme.title}</td>
                                    <td style={{ fontSize: 13, color: "#6b7280" }}>
                                        {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(app.submittedAt))}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${app.status.toLowerCase().replace("_", "-")}`}>
                                            {app.status.replace("_", " ")}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentApplications.length === 0 && (
                                <tr><td colSpan={4} style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>No applications yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
