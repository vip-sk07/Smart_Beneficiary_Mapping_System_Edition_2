"use client";

import { useState, useEffect } from "react";
import {
    Smartphone,
    ShieldCheck,
    CheckCircle2,
    Send,
    Radio,
    Lock,
    Users,
    MessageSquare,
    Sparkles,
    RefreshCw,
    Terminal,
} from "lucide-react";
import toast from "react-hot-toast";

export default function WhatsAppGatewayPage() {
    const [userPhone, setUserPhone] = useState("");
    const [sendingTest, setSendingTest] = useState(false);
    const [lastDispatch, setLastDispatch] = useState<any>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                if (data?.user?.phone) {
                    setUserPhone(data.user.phone);
                }
            })
            .catch(() => {});
    }, []);

    const handleSendLiveTest = async () => {
        if (!userPhone) {
            toast.error("Please add your Phone Number in Edit Profile first.");
            return;
        }

        setSendingTest(true);
        try {
            const res = await fetch("/api/notifications/dispatch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    schemeTitle: "Post Matric Scholarship for Higher Education",
                    schemeBenefit: "Up to ₹25,000 / year tuition fee waiver",
                    triggerReason: "DOCUMENT_VERIFIED"
                })
            });

            const data = await res.json();
            if (res.ok) {
                setLastDispatch(data.result);
                toast.success("✅ Real WhatsApp alert dispatched directly to your phone!");
            } else {
                toast.error(data.error || "Failed to dispatch WhatsApp alert");
            }
        } catch (e) {
            toast.error("Connection error while dispatching message.");
        } finally {
            setSendingTest(false);
        }
    };

    return (
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(34, 197, 94, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Smartphone size={22} color="#16a34a" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f2e5a", margin: 0 }}>
                            Real WhatsApp Autonomous Gateway
                        </h1>
                        <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
                            Direct real-time WhatsApp integration powered by open-source Baileys Gateway & Local AI.
                        </p>
                    </div>
                </div>
            </div>

            {/* Gateway Status Banner */}
            <div style={{
                background: "linear-gradient(135deg, #075e54 0%, #128c7e 100%)",
                borderRadius: 16,
                padding: "24px 28px",
                color: "white",
                boxShadow: "0 10px 25px rgba(7, 94, 84, 0.18)",
                marginBottom: 24
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                            <Radio size={14} className="animate-pulse" color="#86efac" />
                            <span>GATEWAY ENGINE ACTIVE</span>
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>
                            Connected to Real WhatsApp
                        </h2>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: 0, maxWidth: 540, lineHeight: 1.5 }}>
                            All document verifications and application approvals automatically push live alerts directly to the beneficiary&apos;s real WhatsApp phone number.
                        </p>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(6px)", borderRadius: 12, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.2)" }}>
                        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>Target Phone for Alerts:</div>
                        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "0.02em" }}>
                            {userPhone ? `+91 ${userPhone}` : "No phone added yet"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Live Dispatch Action Card */}
            <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e2e8f0", padding: "24px", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f2e5a", margin: "0 0 4px" }}>
                            Test Outbound Live Alert
                        </h3>
                        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                            Dispatches a real verified scheme notification to <strong>{userPhone ? `+91 ${userPhone}` : "your registered phone"}</strong>.
                        </p>
                    </div>

                    <button
                        onClick={handleSendLiveTest}
                        disabled={sendingTest}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 20px",
                            borderRadius: 10,
                            background: "#16a34a",
                            color: "white",
                            fontSize: 13.5,
                            fontWeight: 700,
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                            transition: "all 0.15s ease"
                        }}
                        className="hover:scale-105"
                    >
                        {sendingTest ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                        <span>{sendingTest ? "Sending Live Alert..." : "Dispatch Live Test Alert"}</span>
                    </button>
                </div>

                {lastDispatch && (
                    <div style={{ marginTop: 18, padding: "14px 18px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, color: "#166534", marginBottom: 4 }}>
                            <CheckCircle2 size={16} /> Dispatched to {lastDispatch.recipientPhone}
                        </div>
                        <div style={{ fontSize: 12, color: "#15803d", fontFamily: "monospace" }}>
                            Ref ID: {lastDispatch.messageId} · Delivered At: {new Date(lastDispatch.sentAt).toLocaleTimeString()}
                        </div>
                    </div>
                )}
            </div>

            {/* 3 Privacy & Security Guarantees Grid */}
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f2e5a", marginBottom: 14 }}>
                Active Protection & Security Guarantees:
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                {/* Rule 1 */}
                <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                        <Lock size={18} />
                    </div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 800, color: "#0f2e5a", margin: "0 0 6px" }}>
                        Personal Chat Whitelist
                    </h4>
                    <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5, margin: 0 }}>
                        The bot strictly checks the database. If an unregistered number (friend/family) messages you, the bot does nothing and ignores it.
                    </p>
                </div>

                {/* Rule 2 */}
                <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                        <Users size={18} />
                    </div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 800, color: "#0f2e5a", margin: "0 0 6px" }}>
                        Group Chats 100% Blocked
                    </h4>
                    <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5, margin: 0 }}>
                        All WhatsApp group chats (@g.us) are blocked by the gateway parser so your college and family groups are never interrupted.
                    </p>
                </div>

                {/* Rule 3 */}
                <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                        <MessageSquare size={18} />
                    </div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 800, color: "#0f2e5a", margin: "0 0 6px" }}>
                        3-Step Command Parser
                    </h4>
                    <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5, margin: 0 }}>
                        Only registered citizens sending <strong>SHOW</strong>, <strong>1, 2, 3</strong>, or scheme keywords trigger the progressive AI menu.
                    </p>
                </div>
            </div>
        </div>
    );
}
