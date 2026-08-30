import React from "react";

export default function LoadingSchemes() {
    return (
        <div>
            {/* Header Skeleton */}
            <div style={{ marginBottom: 32 }}>
                <div style={{ width: 250, height: 36, background: "#f3f4f6", borderRadius: 8, marginBottom: 12, animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
                <div style={{ width: 400, height: 20, background: "#f3f4f6", borderRadius: 8, animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            </div>

            {/* Grid of 6 cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "24px",
                }}
            >
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            background: "white",
                            borderRadius: 16,
                            border: "1px solid #f3f4f6",
                            padding: 24,
                            height: 280,
                            display: "flex",
                            flexDirection: "column",
                            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                        }}
                    >
                        {/* Title & Tag Skeletons */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                            <div style={{ width: 120, height: 24, background: "#f3f4f6", borderRadius: 12 }} />
                            <div style={{ width: 80, height: 24, background: "#f3f4f6", borderRadius: 12 }} />
                        </div>
                        
                        <div style={{ width: "90%", height: 28, background: "#f3f4f6", borderRadius: 4, marginBottom: 12 }} />
                        <div style={{ width: "60%", height: 28, background: "#f3f4f6", borderRadius: 4, marginBottom: 24 }} />

                        {/* Details Skeletons */}
                        <div style={{ width: "100%", height: 16, background: "#e5e7eb", borderRadius: 4, marginBottom: 8 }} />
                        <div style={{ width: "90%", height: 16, background: "#e5e7eb", borderRadius: 4, marginBottom: "auto" }} />

                        {/* Action Area Skeleton */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
                            <div style={{ width: 100, height: 36, background: "#f3f4f6", borderRadius: 8 }} />
                            <div style={{ width: 100, height: 36, background: "#e5e7eb", borderRadius: 8 }} />
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
            `}</style>
        </div>
    );
}
