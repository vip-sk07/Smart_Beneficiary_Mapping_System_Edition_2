"use client";

import { SkeletonEligibilityCard } from "@/components/ui/Skeleton";

export default function EligibilityLoading() {
    return (
        <div>
            {/* Header Skeleton */}
            <div style={{ marginBottom: 32 }}>
                <div className="skeleton" style={{ height: 36, width: 280, borderRadius: 8, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: 400, borderRadius: 4 }} />
            </div>

            {/* Profile Card Skeleton */}
            <div className="card" style={{ marginBottom: 24, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div className="skeleton" style={{ width: 64, height: 64, borderRadius: 32 }} />
                    <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ height: 20, width: 150, borderRadius: 4, marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 14, width: 250, borderRadius: 4 }} />
                    </div>
                </div>
            </div>

            {/* Filter Skeleton */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: 36, width: 100, borderRadius: 8 }} />
                ))}
            </div>

            {/* Eligibility Cards Skeleton */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <SkeletonEligibilityCard count={6} />
            </div>
        </div>
    );
}
