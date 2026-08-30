"use client";

import React from "react";

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Base skeleton box with shimmer animation
 */
function SkeletonBox({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return <div className={`skeleton ${className ?? ""}`} style={style} />;
}

/**
 * Generic skeleton component - can be used for any shape
 */
export function Skeleton({ className, style }: SkeletonProps) {
    return <div className={`skeleton ${className ?? ""}`} style={style} />;
}

/**
 * Skeleton for scheme cards (title, description, badges, button)
 */
export function SkeletonCard({ count = 1 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <SkeletonBox style={{ height: 20, width: "60%", borderRadius: 6 }} />
                    <SkeletonBox style={{ height: 14, width: "100%", borderRadius: 4 }} />
                    <SkeletonBox style={{ height: 14, width: "80%", borderRadius: 4 }} />
                    <SkeletonBox style={{ height: 14, width: "90%", borderRadius: 4 }} />
                    <SkeletonBox style={{ height: 36, width: 120, borderRadius: 8, marginTop: 4 }} />
                </div>
            ))}
        </>
    );
}

/**
 * Skeleton for table rows
 */
export function SkeletonRow({ cols = 4, count = 5 }: { cols?: number; count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <td key={colIndex} style={{ padding: "14px 16px" }}>
                            <SkeletonBox style={{ height: 14, borderRadius: 4 }} />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

/**
 * @deprecated Use SkeletonRow instead
 */
export const SkeletonTableRow = SkeletonRow;

/**
 * Skeleton for stat cards (icon + label + value)
 */
export function SkeletonStat({ count = 4 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="stat-card">
                    <SkeletonBox style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0 }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        <SkeletonBox style={{ height: 12, width: "50%", borderRadius: 4 }} />
                        <SkeletonBox style={{ height: 28, width: "40%", borderRadius: 6 }} />
                    </div>
                </div>
            ))}
        </>
    );
}

/**
 * Skeleton for text paragraphs
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonBox
                    key={i}
                    style={{
                        height: 14,
                        width: i === lines - 1 ? "70%" : "100%",
                        borderRadius: 4
                    }}
                />
            ))}
        </div>
    );
}

/**
 * Skeleton for avatar placeholder
 */
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
    return (
        <SkeletonBox
            style={{
                width: size,
                height: size,
                borderRadius: "50%"
            }}
        />
    );
}

/**
 * Skeleton for eligibility scheme cards
 */
export function SkeletonEligibilityCard({ count = 6 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card" style={{ display: "flex", gap: 16, padding: 16 }}>
                    <SkeletonBox style={{ width: 64, height: 64, borderRadius: 8 }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        <SkeletonBox style={{ height: 18, width: "50%", borderRadius: 4 }} />
                        <SkeletonBox style={{ height: 14, width: "80%", borderRadius: 4 }} />
                        <SkeletonBox style={{ height: 14, width: "60%", borderRadius: 4 }} />
                    </div>
                    <SkeletonBox style={{ width: 100, height: 36, borderRadius: 8 }} />
                </div>
            ))}
        </>
    );
}

/**
 * Skeleton for document cards
 */
export function SkeletonDocumentCard({ count = 4 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="card" style={{ display: "flex", gap: 12, padding: 16 }}>
                    <SkeletonBox style={{ width: 48, height: 48, borderRadius: 8 }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <SkeletonBox style={{ height: 16, width: "60%", borderRadius: 4 }} />
                        <SkeletonBox style={{ height: 12, width: "40%", borderRadius: 4 }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <SkeletonBox style={{ width: 32, height: 32, borderRadius: 6 }} />
                        <SkeletonBox style={{ width: 32, height: 32, borderRadius: 6 }} />
                    </div>
                </div>
            ))}
        </>
    );
}

export default Skeleton;
