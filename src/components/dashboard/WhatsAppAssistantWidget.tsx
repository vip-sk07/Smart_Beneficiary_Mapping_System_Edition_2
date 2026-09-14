"use client";

import React from "react";
import { 
    MessageSquare, 
    Mic, 
    MapPin, 
    FileCheck2, 
    ExternalLink, 
    Sparkles, 
    Bot,
    Compass
} from "lucide-react";

interface WhatsAppWidgetProps {
    botNumber?: string;
    userName?: string;
}

export default function WhatsAppAssistantWidget({
    botNumber = "919384102655",
    userName = "Citizen"
}: WhatsAppWidgetProps) {
    const waUrl = `https://wa.me/${botNumber}?text=MENU`;

    const features = [
        {
            icon: <Mic size={18} color="#059669" />,
            title: "Vernacular Voice Notes",
            desc: "Speak naturally in Tamil, Hindi, Telugu, or English to discover matching schemes.",
            badge: "Bhashini AI"
        },
        {
            icon: <MapPin size={18} color="#0284c7" />,
            title: "Hyperlocal GPS Locator",
            desc: "Drop a location pin to find the 3 nearest Arasu e-Seva & CSC Kendras with Maps directions.",
            badge: "Live Navigation"
        },
        {
            icon: <FileCheck2 size={18} color="#7c3aed" />,
            title: "Instant Signed PDF Slips",
            desc: "Text SLIP to download your official SHA-256 encrypted application receipt.",
            badge: "Verifiable Seal"
        }
    ];

    const commands = ["MENU", "SHOW", "STATUS", "SLIP", "VAULT", "HELP"];

    return (
        <div style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
            borderRadius: 20,
            border: "1.5px solid #bbf7d0",
            padding: "24px",
            boxShadow: "0 4px 20px -2px rgba(16, 185, 129, 0.08)",
            marginBottom: 24,
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Background Glow */}
            <div style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, rgba(255,255,255,0) 70%)",
                pointerEvents: "none"
            }} />

            {/* Header Row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #15803d, #22c55e)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)"
                    }}>
                        <Bot size={24} />
                    </div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                24/7 Autonomous WhatsApp Companion
                            </h2>
                            <div style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "2px 8px",
                                borderRadius: 99,
                                background: "rgba(34, 197, 94, 0.12)",
                                border: "1px solid rgba(34, 197, 94, 0.25)"
                            }}>
                                <span style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: "#22c55e",
                                    boxShadow: "0 0 8px #22c55e"
                                }} />
                                <span style={{ fontSize: 10, fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                    Active Gateway
                                </span>
                            </div>
                        </div>
                        <p style={{ fontSize: 13, color: "#64748b", margin: "3px 0 0 0" }}>
                            Discover schemes, track status, and get e-Seva navigation directly on your phone
                        </p>
                    </div>
                </div>

                {/* Open in WhatsApp CTA Button */}
                <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        color: "white",
                        padding: "9px 18px",
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: "none",
                        boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                        transition: "all 0.18s ease"
                    }}
                >
                    <MessageSquare size={16} />
                    <span>Open in WhatsApp</span>
                    <ExternalLink size={14} />
                </a>
            </div>

            {/* Feature Cards Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                marginBottom: 16
            }}>
                {features.map((feat, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: "14px",
                            borderRadius: 12,
                            background: "white",
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            flexDirection: "column",
                            gap: 6
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: "#f8fafc",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                {feat.icon}
                            </div>
                            <span style={{
                                fontSize: 9.5,
                                fontWeight: 800,
                                background: "#f1f5f9",
                                color: "#475569",
                                padding: "2px 7px",
                                borderRadius: 99
                            }}>
                                {feat.badge}
                            </span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                            {feat.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.4 }}>
                            {feat.desc}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Command Chips Footer */}
            <div style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                paddingTop: 12,
                borderTop: "1px solid rgba(22, 163, 74, 0.15)"
            }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#15803d", display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <Sparkles size={13} />
                    Try Texting:
                </span>
                {commands.map((cmd) => (
                    <a
                        key={cmd}
                        href={`https://wa.me/${botNumber}?text=${cmd}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#166534",
                            background: "white",
                            border: "1px solid #86efac",
                            padding: "3px 9px",
                            borderRadius: 6,
                            textDecoration: "none",
                            letterSpacing: "0.04em",
                            transition: "all 0.15s ease"
                        }}
                    >
                        {cmd}
                    </a>
                ))}
                <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>
                    Host Gateway: +91 {botNumber.slice(-10)}
                </span>
            </div>
        </div>
    );
}
