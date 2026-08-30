"use client";

import { SkeletonStat } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Welcome Section Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="skeleton" style={{ height: 32, width: 200, borderRadius: 8 }} />
                    <div className="skeleton" style={{ height: 16, width: 300, borderRadius: 4 }} />
                </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SkeletonStat count={4} />
            </div>

            {/* Quick Actions Skeleton */}
            <div>
                <div className="skeleton" style={{ height: 24, width: 180, borderRadius: 6, marginBottom: 16 }} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="card" style={{ padding: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                                    <div className="skeleton" style={{ height: 16, width: "70%", borderRadius: 4 }} />
                                    <div className="skeleton" style={{ height: 12, width: "50%", borderRadius: 4 }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity Skeleton */}
            <div>
                <div className="skeleton" style={{ height: 24, width: 180, borderRadius: 6, marginBottom: 16 }} />
                <div className="card">
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton" style={{ height: 14, width: "60%", borderRadius: 4, marginBottom: 4 }} />
                                    <div className="skeleton" style={{ height: 12, width: "30%", borderRadius: 4 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
