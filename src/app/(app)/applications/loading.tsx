"use client";

import { SkeletonRow } from "@/components/ui/Skeleton";

export default function ApplicationsLoading() {
    return (
        <div>
            {/* Header Skeleton */}
            <div style={{ marginBottom: 32 }}>
                <div className="skeleton" style={{ height: 32, width: 200, borderRadius: 8, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: 300, borderRadius: 4 }} />
            </div>

            {/* Tabs Skeleton */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 40, width: 100, borderRadius: 8 }} />
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f9fafb" }}>
                            {["Scheme", "Applied On", "Status", "Actions"].map((header, i) => (
                                <th key={i} style={{ padding: "14px 16px", textAlign: "left" }}>
                                    <div className="skeleton" style={{ height: 14, width: 60, borderRadius: 4 }} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <SkeletonRow cols={4} count={5} />
                    </tbody>
                </table>
            </div>
        </div>
    );
}
