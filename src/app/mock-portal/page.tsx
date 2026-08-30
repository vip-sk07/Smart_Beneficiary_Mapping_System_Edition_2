"use client";

import { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export default function MockPortal() {
    const [step, setStep] = useState(1);
    const [referenceId, setReferenceId] = useState("");

    const [formData, setFormData] = useState({
        aadhaar: "",
        name: "",
        income: "",
        captcha: ""
    });

    const [error, setError] = useState("");

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (step === 1) {
            if (!formData.aadhaar || !formData.name || !formData.income) {
                setError("Please fill all details.");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (formData.captcha.toLowerCase() !== "sbms") {
                setError("Invalid Captcha. Try again.");
                return;
            }
            // Generate mock reference ID
            setReferenceId(`NSP-${Math.floor(Math.random() * 900000) + 100000}`);
            setStep(3);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column" }}>
            {/* Gov Header */}
            <div style={{ background: "#1e3a8a", color: "white", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
                <ShieldAlert size={28} />
                <div>
                    <h1 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>National Scholarship Mock Portal</h1>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: 13 }}>Government of India Initiative</p>
                </div>
            </div>

            {/* Main Form */}
            <div style={{ padding: "40px 20px", flex: 1, display: "flex", justifyContent: "center" }}>
                <div style={{ background: "white", borderRadius: 12, padding: 32, width: "100%", maxWidth: 500, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                    {step === 1 && (
                        <form id="step1-form" onSubmit={handleNext}>
                            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: "#0f172a" }}>Applicant Registration</h2>
                            
                            {error && <div style={{ background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#475569" }}>Aadhaar Number</label>
                                <input 
                                    id="aadhaar-input"
                                    type="text" 
                                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8 }}
                                    value={formData.aadhaar}
                                    onChange={e => setFormData({...formData, aadhaar: e.target.value})}
                                    placeholder="12-digit Aadhaar"
                                />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#475569" }}>Full Name (As per Aadhaar)</label>
                                <input 
                                    id="name-input"
                                    type="text" 
                                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8 }}
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#475569" }}>Annual Family Income</label>
                                <input 
                                    id="income-input"
                                    type="number" 
                                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8 }}
                                    value={formData.income}
                                    onChange={e => setFormData({...formData, income: e.target.value})}
                                    placeholder="Enter amount without commas"
                                />
                            </div>

                            <button id="next-btn" type="submit" style={{ width: "100%", background: "#2563eb", color: "white", border: "none", padding: 14, borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                                Next Step
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form id="step2-form" onSubmit={handleNext}>
                            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>Human Verification</h2>
                            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Please solve the CAPTCHA to prove you are not a bot.</p>
                            
                            {error && <div style={{ background: "#fef2f2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}

                            {/* The Captcha Challenge Frame */}
                            <div id="captcha-frame" style={{ background: "#f8fafc", border: "2px dashed #cbd5e1", padding: 32, borderRadius: 8, textAlign: "center", marginBottom: 24 }}>
                                <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: 8, color: "#334155", fontStyle: "italic", userSelect: "none" }}>
                                    SBMS
                                </div>
                                <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Type the letters shown above.</p>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "#475569" }}>Enter Captcha</label>
                                <input 
                                    id="captcha-input"
                                    type="text" 
                                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8 }}
                                    value={formData.captcha}
                                    onChange={e => setFormData({...formData, captcha: e.target.value})}
                                />
                            </div>

                            <button id="submit-btn" type="submit" style={{ width: "100%", background: "#16a34a", color: "white", border: "none", padding: 14, borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                                Final Submit
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <div id="success-screen" style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{ background: "#dcfce7", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                                <CheckCircle2 size={32} color="#16a34a" />
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: "#0f172a" }}>Application Successful!</h2>
                            <p style={{ color: "#64748b", marginBottom: 24 }}>Your application has been received and is under review.</p>
                            
                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: 20, borderRadius: 8 }}>
                                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px" }}>Your Application Reference Number:</p>
                                <p id="reference-id" style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0, userSelect: "all" }}>
                                    {referenceId}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
