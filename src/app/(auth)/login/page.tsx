"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        const authError = searchParams?.get("error");
        if (authError === "Configuration") {
            toast.error("Google OAuth is not configured. Please sign in with Email & Password or Register.");
        } else if (authError) {
            toast.error(`Authentication error: ${authError}`);
        }
    }, [searchParams]);

    async function handleSubmit() {
        if (!email || !password) { toast.error("Please fill in all fields"); return; }
        setLoading(true);
        try {
            const res = await signIn("credentials", { email, password, redirect: false });
            if (res?.error) { toast.error("Invalid email or password"); }
            else { toast.success("Welcome back!"); router.push("/dashboard"); router.refresh(); }
        } catch { toast.error("Something went wrong. Please try again."); }
        finally { setLoading(false); }
    }

    async function handleGoogle() {
        setGoogleLoading(true);
        try { await signIn("google", { callbackUrl: "/dashboard" }); }
        catch { toast.error("Google sign-in failed."); setGoogleLoading(false); }
    }

    const features = [
        "AI-matched welfare schemes for your profile",
        "500+ central & state government schemes",
        "Track applications in real time",
        "Secure Digilocker-style document vault",
    ];

    return (
        <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Sora, sans-serif", background: "#0a0f1e" }}>

            {/* ── Left Panel ── */}
            <div style={{
                flex: 1, display: "none", position: "relative", overflow: "hidden",
                background: "linear-gradient(145deg, #0f1629 0%, #1a1040 60%, #0f1629 100%)",
                padding: "60px 56px", flexDirection: "column", justifyContent: "center",
            }} className="auth-left-panel">

                {/* Flag stripe */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right, #ff9933 33.3%, #ffffff 33.3% 66.6%, #138808 66.6%)" }} />

                {/* Animated blobs */}
                <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: "absolute", top: "5%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
                <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                    style={{ position: "absolute", bottom: "5%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                    {/* Logo */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #4338ca, #6366f1)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(99,102,241,0.35)", marginBottom: 40, border: "1px solid rgba(255,255,255,0.1)" }}>
                            <Shield size={30} color="white" />
                        </div>
                        <h1 style={{ fontSize: 42, fontWeight: 900, color: "white", lineHeight: 1.15, letterSpacing: "-0.04em", marginBottom: 16 }}>
                            Smart Beneficiary<br />
                            <span style={{ background: "linear-gradient(135deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mapping System</span>
                        </h1>
                        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 48, maxWidth: 380 }}>
                            Your AI-powered gateway to 500+ government welfare schemes — personalised to you.
                        </p>
                    </motion.div>

                    {/* Feature list */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {features.map((f, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                                style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 18px", backdropFilter: "blur(8px)" }}>
                                <CheckCircle2 size={18} color="#4ade80" style={{ flexShrink: 0 }} />
                                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600 }}>{f}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Powered badge */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                        style={{ marginTop: 48, display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 99, padding: "8px 18px" }}>
                        <Sparkles size={14} color="#818cf8" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#818cf8", letterSpacing: "0.04em" }}>LOCAL AI · OLLAMA</span>
                    </motion.div>
                </div>
            </div>

            {/* ── Right Panel (Form) ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 24px", background: "#ffffff", position: "relative" }}>

                {/* Mobile top flag */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right, #ff9933 33.3%, #ffffff 33.3% 66.6%, #138808 66.6%)" }} />

                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: "100%", maxWidth: 420 }}>

                    {/* Mobile logo */}
                    <div style={{ textAlign: "center", marginBottom: 36 }}>
                        <div style={{ width: 52, height: 52, background: "linear-gradient(135deg, #4338ca, #6366f1)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}>
                            <Shield size={26} color="white" />
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 6 }}>Welcome back</h1>
                        <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Sign in to your SBMS account</p>
                    </div>

                    {/* Google button */}
                    <motion.button id="google-signin-btn" onClick={handleGoogle} disabled={googleLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "14px 20px", borderRadius: 14, border: "2px solid #e2e8f0", background: "#fff", fontWeight: 700, fontSize: 15, color: "#1e293b", cursor: googleLoading ? "not-allowed" : "pointer", marginBottom: 24, transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", opacity: googleLoading ? 0.7 : 1, fontFamily: "Sora, sans-serif" }}>
                        {/* Google SVG */}
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                            <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                        </svg>
                        {googleLoading ? "Redirecting..." : "Continue with Google"}
                    </motion.button>

                    {/* Divider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>or</span>
                        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }} htmlFor="email">Email address</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={17} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                            <input id="email" type="email" value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                autoComplete="email"
                                style={{ width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 13, paddingBottom: 13, borderRadius: 12, border: "2px solid #e2e8f0", background: "#f8fafc", fontSize: 15, fontWeight: 500, color: "#0f172a", outline: "none", transition: "border-color 0.2s", fontFamily: "Sora, sans-serif", boxSizing: "border-box" }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: 28 }}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }} htmlFor="password">Password</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={17} color="#94a3b8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                            <input id="password" type={showPassword ? "text" : "password"} value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                autoComplete="current-password"
                                style={{ width: "100%", paddingLeft: 44, paddingRight: 48, paddingTop: 13, paddingBottom: 13, borderRadius: 12, border: "2px solid #e2e8f0", background: "#f8fafc", fontSize: 15, fontWeight: 500, color: "#0f172a", outline: "none", transition: "border-color 0.2s", fontFamily: "Sora, sans-serif", boxSizing: "border-box" }}
                                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <motion.button id="signin-btn" onClick={handleSubmit} disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0 16px 40px rgba(99,102,241,0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        style={{ width: "100%", padding: "15px 20px", borderRadius: 14, background: loading ? "#818cf8" : "linear-gradient(135deg, #4338ca, #6366f1)", color: "white", fontWeight: 800, fontSize: 16, border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 8px 24px rgba(99,102,241,0.35)", fontFamily: "Sora, sans-serif", transition: "background 0.2s", marginBottom: 24 }}>
                        {loading ? (
                            <><div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Signing in...</>
                        ) : (
                            <><ArrowRight size={18} />Sign In Securely</>
                        )}
                    </motion.button>

                    <p style={{ textAlign: "center", fontSize: 14, color: "#64748b", fontWeight: 500 }}>
                        New to SBMS?{" "}
                        <Link href="/register" style={{ color: "#4338ca", fontWeight: 700, textDecoration: "none" }}>Create your free account</Link>
                    </p>
                    <p style={{ textAlign: "center", marginTop: 14 }}>
                        <Link href="/" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}>← Back to home</Link>
                    </p>
                </motion.div>
            </div>

            <style>{`
                @media (min-width: 1024px) { .auth-left-panel { display: flex !important; } }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
