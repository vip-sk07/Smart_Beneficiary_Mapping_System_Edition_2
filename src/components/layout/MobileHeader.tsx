"use client";

import { Menu, X, Shield } from "lucide-react";

interface MobileHeaderProps {
    isOpen: boolean;
    onToggle: () => void;
    pageTitle?: string;
}

export default function MobileHeader({ isOpen, onToggle, pageTitle }: MobileHeaderProps) {
    return (
        <header
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0,
                height: 56,
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(226,232,240,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                zIndex: 45,
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
            }}
            className="md:hidden"
        >
            {/* Logo + title */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                    width: 34, height: 34,
                    background: "linear-gradient(135deg, #4338ca, #6366f1)",
                    borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(99,102,241,0.35)",
                    flexShrink: 0,
                }}>
                    <Shield size={17} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#0f172a", letterSpacing: "-0.01em" }}>
                    {pageTitle ?? "SBMS"}
                </span>
            </div>

            {/* Flag stripe — decorative thin bar below header */}
            <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, #f97316 0% 33.3%, white 33.3% 66.6%, #16a34a 66.6% 100%)",
                opacity: 0.7,
            }} />

            {/* Toggle button */}
            <button
                id="mobile-menu-toggle"
                onClick={onToggle}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                style={{
                    width: 38, height: 38,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isOpen ? "#eef2ff" : "white",
                    border: "1.5px solid",
                    borderColor: isOpen ? "#c7d2fe" : "#e2e8f0",
                    borderRadius: 10,
                    cursor: "pointer",
                    color: isOpen ? "#4338ca" : "#475569",
                    transition: "all 0.15s ease",
                }}
            >
                {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
        </header>
    );
}
