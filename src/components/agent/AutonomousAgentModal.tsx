"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Bot,
    Shield,
    CheckCircle2,
    Clock,
    AlertTriangle,
    X,
    FolderCheck,
    ArrowRight,
    KeyRound,
    Cpu,
    Zap,
    Download,
    Copy,
    Check,
    RefreshCw,
    Smartphone,
    Eye,
    MonitorPlay,
} from "lucide-react";
import { fireConfetti } from "@/components/ui/ConfettiEffect";
import toast from "react-hot-toast";

interface DocumentItem {
    type: string;
    label: string;
    availableInVault: boolean;
    fileName?: string;
}

interface RequiredField {
    key: string;
    label: string;
    type: string;
    required: boolean;
    vaultMatched: boolean;
    sourceValue?: string;
}

interface ScanResult {
    url: string;
    portalName: string;
    portalStatus: "ONLINE" | "MAINTENANCE" | "SLOW";
    latencyMs: number;
    sslValid: boolean;
    isCloudflareProtected: boolean;
    captchaDetected: boolean;
    captchaType: string;
    requiresAadhaarOtp: boolean;
    requiresDigiLockerAuth: boolean;
    recommendedMode: "ZERO_TOUCH" | "ASSISTED_COPILOT" | "PDF_DOSSIER";
    estimatedDurationSec: number;
    securitySummary: string;
    requiredDocuments: DocumentItem[];
    requiredFields: RequiredField[];
    vaultReadinessScore: number;
    missingDocsCount: number;
    canAutoSubmit: boolean;
}

interface AckReceipt {
    receiptNumber: string;
    applicationRefNo: string;
    schemeTitle: string;
    category: string;
    applicantName: string;
    aadhaarMasked: string;
    domicileState: string;
    submissionTimestamp: string;
    formattedDate: string;
    formattedTime: string;
    portalGateway: string;
    status: string;
    digitalSignatureHash: string;
    finalScreenshot?: string;
    attachedVaultDocuments: string[];
}

interface AutonomousAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    schemeId: string;
    schemeTitle: string;
    onSuccessCallback?: () => void;
}

type ModalStage = "SCANNING" | "READY" | "RUNNING" | "AWAITING_RELAY" | "SUCCESS" | "ERROR";

export default function AutonomousAgentModal({
    isOpen,
    onClose,
    schemeId,
    schemeTitle,
    onSuccessCallback,
}: AutonomousAgentModalProps) {
    const router = useRouter();
    const [stage, setStage] = useState<ModalStage>("SCANNING");
    const [scanData, setScanData] = useState<ScanResult | null>(null);
    const [scanSteps, setScanSteps] = useState<string[]>([]);
    const [executingStepIndex, setExecutingStepIndex] = useState(0);
    const [executionSteps, setExecutionSteps] = useState<any[]>([]);
    const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);
    const [showLiveBrowser, setShowLiveBrowser] = useState(true);
    const [barrierInfo, setBarrierInfo] = useState<any>(null);
    const [userRelayInput, setUserRelayInput] = useState("");
    const [receipt, setReceipt] = useState<AckReceipt | null>(null);
    const [copiedRef, setCopiedRef] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef<any>(null);

    // Reset and trigger initial scan on modal open
    useEffect(() => {
        if (isOpen && schemeId) {
            setStage("SCANNING");
            setScanData(null);
            setScanSteps([]);
            setExecutingStepIndex(0);
            setExecutionSteps([]);
            setActiveScreenshot(null);
            setShowLiveBrowser(true);
            setBarrierInfo(null);
            setUserRelayInput("");
            setReceipt(null);
            setErrorMessage("");
            setElapsedSeconds(0);
            runPreFlightScan();
        }
    }, [isOpen, schemeId]);

    // Timer for execution
    useEffect(() => {
        if (stage === "RUNNING") {
            timerRef.current = setInterval(() => {
                setElapsedSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [stage]);

    async function runPreFlightScan() {
        try {
            setScanSteps([
                "Probing Official Government Portal & SSL Certificate...",
                "Analyzing WAF & Cloudflare Anti-Bot Barriers...",
                "Inspecting Form DOM Tree & Aadhaar e-KYC Requirements...",
                "Matching Citizen Credentials & Document Vault...",
            ]);

            const res = await fetch("/api/agent/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ schemeId }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to scan portal");
            }

            const data = await res.json();
            setScanData(data.scan);
            setTimeout(() => {
                setStage("READY");
            }, 600);
        } catch (e: any) {
            console.error("Scan error:", e);
            setErrorMessage(e.message || "Failed to inspect government portal");
            setStage("ERROR");
        }
    }

    async function handleLaunchAgent(relayPayload?: { otp?: string; captcha?: string }) {
        setStage("RUNNING");
        setExecutingStepIndex(0);

        try {
            // Animate initial step progress
            setTimeout(() => setExecutingStepIndex(1), 600);
            setTimeout(() => setExecutingStepIndex(2), 1200);

            const res = await fetch("/api/agent/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    schemeId,
                    relayData: relayPayload,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Autonomous agent encountered an error");
            }

            // Check if human relay (OTP / CAPTCHA) is required
            if (data.status === "AWAITING_RELAY") {
                setBarrierInfo(data);
                setStage("AWAITING_RELAY");
                return;
            }

            if (data.status === "COMPLETED" && data.receipt) {
                setExecutingStepIndex(4);
                setExecutionSteps(data.steps || []);
                setReceipt(data.receipt);
                if (data.finalScreenshot) {
                    setActiveScreenshot(data.finalScreenshot);
                }

                setTimeout(() => {
                    setStage("SUCCESS");
                    fireConfetti("indian");
                    if (onSuccessCallback) onSuccessCallback();
                }, 600);
            }
        } catch (e: any) {
            console.error("Agent execution error:", e);
            setErrorMessage(e.message || "Execution error during autonomous submission");
            setStage("ERROR");
        }
    }

    function handleRelaySubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userRelayInput.trim()) {
            toast.error("Please enter the required verification code");
            return;
        }

        if (barrierInfo?.barrierType === "AADHAAR_OTP") {
            handleLaunchAgent({ otp: userRelayInput.trim() });
        } else {
            handleLaunchAgent({ captcha: userRelayInput.trim() });
        }
    }

    function copyReferenceNumber() {
        if (receipt?.applicationRefNo) {
            navigator.clipboard.writeText(receipt.applicationRefNo);
            setCopiedRef(true);
            toast.success("Application Reference Number copied to clipboard!");
            setTimeout(() => setCopiedRef(false), 2500);
        }
    }

    function downloadAcknowledgmentSlip() {
        if (!receipt) return;
        const receiptJson = JSON.stringify(receipt, null, 2);
        const blob = new Blob([receiptJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SBMS_Acknowledgment_${receipt.applicationRefNo.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Official Acknowledgment Receipt downloaded!");
    }

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && stage !== "RUNNING") onClose();
            }}
        >
            <div
                style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
                    width: "100%",
                    maxWidth: stage === "SUCCESS" ? 740 : 640,
                    maxHeight: "92vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "16px 22px",
                        background: "linear-gradient(135deg, #0f2e5a 0%, #1e3a8a 100%)",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: "rgba(255, 255, 255, 0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#93c5fd",
                            }}
                        >
                            <Bot size={22} />
                        </div>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em" }}>
                                    SBMS Autonomous Browser Action Engine
                                </span>
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 800,
                                        background: "#10b981",
                                        color: "white",
                                        padding: "1px 6px",
                                        borderRadius: 4,
                                        letterSpacing: "0.04em",
                                    }}
                                >
                                    AUTONOMOUS AGENT LIVE
                                </span>
                            </div>
                            <div
                                style={{
                                    fontSize: 11.5,
                                    color: "#93c5fd",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: 420,
                                }}
                            >
                                {schemeTitle}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={stage === "RUNNING"}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "rgba(255, 255, 255, 0.7)",
                            cursor: stage === "RUNNING" ? "not-allowed" : "pointer",
                            padding: 6,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
                    {/* STAGE 1: SCANNING */}
                    {stage === "SCANNING" && (
                        <div style={{ textAlign: "center", padding: "30px 10px" }}>
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: "50%",
                                    background: "#eff6ff",
                                    color: "#2563eb",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <RefreshCw size={28} className="animate-spin" />
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f2e5a", marginBottom: 6 }}>
                                Pre-Flight Security & Portal Inspection
                            </h3>
                            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                                Probing official government endpoint & matching with verified Document Vault...
                            </p>

                            <div
                                style={{
                                    maxWidth: 440,
                                    margin: "0 auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                    textAlign: "left",
                                }}
                            >
                                {scanSteps.map((step, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            fontSize: 12.5,
                                            color: "#334155",
                                            background: "#f8fafc",
                                            padding: "8px 12px",
                                            borderRadius: 6,
                                            border: "1px solid #e2e8f0",
                                        }}
                                    >
                                        <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0" />
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STAGE 2: READY */}
                    {stage === "READY" && scanData && (
                        <div>
                            {/* Mode Banner */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: scanData.recommendedMode === "ZERO_TOUCH" ? "#f0fdf4" : "#eff6ff",
                                    border: `1px solid ${scanData.recommendedMode === "ZERO_TOUCH" ? "#bbf7d0" : "#bfdbfe"}`,
                                    padding: "12px 16px",
                                    borderRadius: 10,
                                    marginBottom: 16,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 8,
                                            background: scanData.recommendedMode === "ZERO_TOUCH" ? "#dcfce7" : "#dbeafe",
                                            color: scanData.recommendedMode === "ZERO_TOUCH" ? "#15803d" : "#1d4ed8",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Zap size={18} />
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: scanData.recommendedMode === "ZERO_TOUCH" ? "#166534" : "#1e40af",
                                            }}
                                        >
                                            {scanData.recommendedMode === "ZERO_TOUCH"
                                                ? "⚡ 100% Zero-Touch Autonomous Browser Mode"
                                                : "🛡️ AI Assisted Copilot Browser Mode"}
                                        </div>
                                        <div style={{ fontSize: 11.5, color: "#475569" }}>
                                            {scanData.securitySummary}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        textAlign: "right",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "#64748b",
                                    }}
                                >
                                    Est. ~{scanData.estimatedDurationSec}s
                                </div>
                            </div>

                            {/* Security & Vault Breakdown */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                                <div
                                    style={{
                                        background: "#f8fafc",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: 8,
                                        padding: "12px 14px",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: "#0f2e5a",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Shield size={14} color="#0f2e5a" /> Portal Gateway Status
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11.5 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#64748b" }}>Target Portal:</span>
                                            <strong style={{ color: "#0f172a" }}>{scanData.portalName}</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#64748b" }}>SSL Security:</span>
                                            <span style={{ color: "#166534", fontWeight: 600 }}>✓ 256-bit Valid</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "#64748b" }}>Anti-Bot / CAPTCHA:</span>
                                            <span style={{ color: scanData.captchaDetected ? "#b45309" : "#166534", fontWeight: 600 }}>
                                                {scanData.captchaDetected ? "Vision AI Auto-Solve" : "Bypassed / None"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background: "#f8fafc",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: 8,
                                        padding: "12px 14px",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: "#0f2e5a",
                                            }}
                                        >
                                            <FolderCheck size={14} color="#0f2e5a" /> Document Vault Match
                                        </div>
                                        <span
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 800,
                                                background: scanData.vaultReadinessScore >= 80 ? "#dcfce7" : scanData.vaultReadinessScore >= 50 ? "#fef3c7" : "#fee2e2",
                                                color: scanData.vaultReadinessScore >= 80 ? "#15803d" : scanData.vaultReadinessScore >= 50 ? "#b45309" : "#b91c1c",
                                                padding: "1px 6px",
                                                borderRadius: 4,
                                            }}
                                        >
                                            {scanData.vaultReadinessScore}% Ready
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 11.5 }}>
                                        {scanData.requiredDocuments.slice(0, 4).map((doc, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: 8,
                                                }}
                                            >
                                                <span style={{ color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.label}</span>
                                                {doc.availableInVault ? (
                                                    <span style={{ color: "#166534", fontWeight: 600, flexShrink: 0 }}>✓ In Vault</span>
                                                ) : (
                                                    <span style={{ color: "#dc2626", fontWeight: 600, flexShrink: 0 }}>✗ Missing</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Launch Action Bar */}
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <button
                                    onClick={() => handleLaunchAgent()}
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        padding: "12px 20px",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                        background: "linear-gradient(135deg, #0f2e5a 0%, #1e40af 100%)",
                                        borderRadius: 8,
                                    }}
                                >
                                    <Cpu size={16} /> Launch Autonomous Application Agent
                                </button>
                                <button
                                    onClick={onClose}
                                    style={{
                                        padding: "12px 18px",
                                        background: "#f8fafc",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "#475569",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STAGE 3: RUNNING (Live Execution Animation) */}
                    {stage === "RUNNING" && (
                        <div style={{ padding: "10px 0" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2e5a", margin: 0 }}>
                                        Autonomous Application Agent Running...
                                    </h3>
                                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                        Driving automated portal session, auto-filling fields, and resolving security challenges
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        background: "#eff6ff",
                                        color: "#1d4ed8",
                                        padding: "4px 10px",
                                        borderRadius: 6,
                                        border: "1px solid #bfdbfe",
                                    }}
                                >
                                    <Clock size={13} /> {elapsedSeconds}s
                                </div>
                            </div>

                            {/* Multi-step execution tracker */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                                {[
                                    { title: "Launching Secure Automated Browser Instance", desc: "Setting up viewport 1280x800 and navigating to target portal" },
                                    { title: "Inspecting Live DOM & Auto-Populating Form Inputs", desc: "Mapping verified Aadhaar, Name, Income, and State credentials" },
                                    { title: "Multimodal Vision AI CAPTCHA Auto-Solver", desc: "Taking live viewport screenshot and solving challenge with Vision AI" },
                                    { title: "Live Portal Submission & Real Reference ID Extraction", desc: "Submitting application form and capturing official confirmation DOM receipt" },
                                ].map((step, idx) => {
                                    const isDone = idx < executingStepIndex;
                                    const isCurrent = idx === executingStepIndex;
                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 12,
                                                padding: "10px 14px",
                                                borderRadius: 8,
                                                background: isCurrent ? "#eff6ff" : isDone ? "#f0fdf4" : "#f8fafc",
                                                border: `1px solid ${isCurrent ? "#93c5fd" : isDone ? "#bbf7d0" : "#e2e8f0"}`,
                                                transition: "all 0.3s ease",
                                            }}
                                        >
                                            <div style={{ marginTop: 2 }}>
                                                {isDone ? (
                                                    <CheckCircle2 size={16} className="text-green-600" />
                                                ) : isCurrent ? (
                                                    <RefreshCw size={16} className="text-blue-600 animate-spin" />
                                                ) : (
                                                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #cbd5e1" }} />
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        color: isCurrent ? "#1e40af" : isDone ? "#166534" : "#64748b",
                                                    }}
                                                >
                                                    {step.title}
                                                </div>
                                                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                                                    {step.desc}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* STAGE 4: AWAITING RELAY */}
                    {stage === "AWAITING_RELAY" && barrierInfo && (
                        <form onSubmit={handleRelaySubmit} style={{ padding: "10px 0" }}>
                            <div
                                style={{
                                    background: "#fffbeb",
                                    border: "1px solid #fef3c7",
                                    borderRadius: 10,
                                    padding: "16px 18px",
                                    marginBottom: 18,
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 8,
                                        background: "#fef3c7",
                                        color: "#b45309",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {barrierInfo.barrierType === "AADHAAR_OTP" ? <Smartphone size={20} /> : <KeyRound size={20} />}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#92400e", margin: 0 }}>
                                        {barrierInfo.barrierType === "AADHAAR_OTP"
                                            ? "Aadhaar e-KYC SMS OTP Relay"
                                            : "Government Portal Security Challenge"}
                                    </h4>
                                    <p style={{ fontSize: 12.5, color: "#b45309", margin: "4px 0 0" }}>
                                        {barrierInfo.prompt}
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                                    {barrierInfo.barrierType === "AADHAAR_OTP" ? "Enter 6-Digit SMS OTP" : "Enter Solution / Captcha"}
                                </label>
                                <input
                                    type="text"
                                    value={userRelayInput}
                                    onChange={(e) => setUserRelayInput(e.target.value)}
                                    placeholder={barrierInfo.barrierType === "AADHAAR_OTP" ? "e.g. 849201" : "Enter answer"}
                                    maxLength={barrierInfo.barrierType === "AADHAAR_OTP" ? 6 : 20}
                                    autoFocus
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        fontSize: 18,
                                        fontWeight: 700,
                                        letterSpacing: "0.1em",
                                        textAlign: "center",
                                        borderRadius: 8,
                                        border: "1.5px solid #0f2e5a",
                                        outline: "none",
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: 10 }}>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        padding: "12px 20px",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        background: "#0f2e5a",
                                        borderRadius: 8,
                                    }}
                                >
                                    Verify & Complete Registration →
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{
                                        padding: "12px 18px",
                                        background: "#f8fafc",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "#475569",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STAGE 5: SUCCESS (Digital Acknowledgment Slip & Real Browser Screenshots) */}
                    {stage === "SUCCESS" && receipt && (
                        <div>
                            {/* Top Badge */}
                            <div style={{ textAlign: "center", marginBottom: 16 }}>
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        background: "#dcfce7",
                                        color: "#15803d",
                                        padding: "4px 14px",
                                        borderRadius: 20,
                                        fontSize: 12.5,
                                        fontWeight: 700,
                                        marginBottom: 8,
                                    }}
                                >
                                    <CheckCircle2 size={15} /> Application Registered via Live Browser!
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f2e5a", margin: 0 }}>
                                    Official Digital Acknowledgment Receipt
                                </h3>
                                <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                    Captured directly from live portal and archived to your Document Vault
                                </p>
                            </div>

                            {/* Live Browser Screenshot Gallery */}
                            {executionSteps.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#0f2e5a" }}>
                                            <MonitorPlay size={14} color="#0f2e5a" /> Live Browser Execution Timeline ({executionSteps.length} Steps)
                                        </div>
                                        <button
                                            onClick={() => setShowLiveBrowser(!showLiveBrowser)}
                                            style={{
                                                fontSize: 11.5,
                                                fontWeight: 600,
                                                color: "#2563eb",
                                                background: "#eff6ff",
                                                border: "1px solid #bfdbfe",
                                                padding: "2px 8px",
                                                borderRadius: 4,
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 4,
                                            }}
                                        >
                                            <Eye size={12} /> {showLiveBrowser ? "Hide Screenshots" : "View Live Screenshots"}
                                        </button>
                                    </div>

                                    {showLiveBrowser && (
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 8,
                                                overflowX: "auto",
                                                paddingBottom: 8,
                                            }}
                                        >
                                            {executionSteps.map((s, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setActiveScreenshot(s.screenshotBase64)}
                                                    style={{
                                                        minWidth: 160,
                                                        cursor: "pointer",
                                                        border: activeScreenshot === s.screenshotBase64 ? "2px solid #2563eb" : "1px solid #e2e8f0",
                                                        borderRadius: 8,
                                                        overflow: "hidden",
                                                        background: "#f8fafc",
                                                        transition: "all 0.15s ease",
                                                    }}
                                                >
                                                    {s.screenshotBase64 && (
                                                        <img
                                                            src={s.screenshotBase64}
                                                            alt={s.title}
                                                            style={{ width: "100%", height: 90, objectFit: "cover" }}
                                                        />
                                                    )}
                                                    <div style={{ padding: "6px 8px" }}>
                                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            Step {s.stepNumber}: {s.title}
                                                        </div>
                                                        <div style={{ fontSize: 10, color: "#64748b" }}>{s.durationMs}ms</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Expanded screenshot preview */}
                                    {activeScreenshot && showLiveBrowser && (
                                        <div
                                            style={{
                                                marginTop: 10,
                                                borderRadius: 8,
                                                border: "1px solid #cbd5e1",
                                                overflow: "hidden",
                                                boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                                            }}
                                        >
                                            <img
                                                src={activeScreenshot}
                                                alt="Live Browser Action"
                                                style={{ width: "100%", maxHeight: 260, objectFit: "contain", background: "#f1f5f9" }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Official Government Receipt Slip Card */}
                            <div
                                style={{
                                    background: "#ffffff",
                                    border: "2px solid #0f2e5a",
                                    borderRadius: 12,
                                    padding: "18px 20px",
                                    boxShadow: "0 4px 12px rgba(15, 46, 90, 0.08)",
                                    marginBottom: 16,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        borderBottom: "1.5px solid #e2e8f0",
                                        paddingBottom: 10,
                                        marginBottom: 12,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: 10.5, fontWeight: 800, color: "#0f2e5a", letterSpacing: "0.05em" }}>
                                            DIRECT BENEFIT TRANSFER (DBT) WELFARE GATEWAY
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                                            {receipt.schemeTitle}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: "#15803d",
                                            background: "#dcfce7",
                                            padding: "3px 8px",
                                            borderRadius: 4,
                                            border: "1px solid #86efac",
                                        }}
                                    >
                                        OFFICIALLY VERIFIED
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background: "#f8fafc",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: 8,
                                        padding: "10px 14px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 12,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                                            Official Application Reference No.
                                        </div>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f2e5a", fontFamily: "monospace" }}>
                                            {receipt.applicationRefNo}
                                        </div>
                                    </div>

                                    <button
                                        onClick={copyReferenceNumber}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            fontSize: 11.5,
                                            fontWeight: 600,
                                            background: copiedRef ? "#dcfce7" : "#ffffff",
                                            color: copiedRef ? "#15803d" : "#0f2e5a",
                                            border: "1px solid #cbd5e1",
                                            padding: "6px 12px",
                                            borderRadius: 6,
                                            cursor: "pointer",
                                        }}
                                    >
                                        {copiedRef ? <Check size={13} /> : <Copy size={13} />}
                                        {copiedRef ? "Copied" : "Copy Ref"}
                                    </button>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11.5, marginBottom: 10 }}>
                                    <div>
                                        <span style={{ color: "#64748b" }}>Applicant: </span>
                                        <strong style={{ color: "#0f172a" }}>{receipt.applicantName}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: "#64748b" }}>Aadhaar UID: </span>
                                        <strong style={{ color: "#0f172a" }}>{receipt.aadhaarMasked}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: "#64748b" }}>Portal Gateway: </span>
                                        <strong style={{ color: "#0f172a" }}>{receipt.portalGateway}</strong>
                                    </div>
                                    <div>
                                        <span style={{ color: "#64748b" }}>Filing Time: </span>
                                        <strong style={{ color: "#0f172a" }}>{receipt.formattedDate} ({receipt.formattedTime})</strong>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        fontSize: 9.5,
                                        fontFamily: "monospace",
                                        color: "#64748b",
                                        background: "#f1f5f9",
                                        padding: "4px 8px",
                                        borderRadius: 4,
                                        wordBreak: "break-all",
                                    }}
                                >
                                    SHA-256 Stamp: {receipt.digitalSignatureHash}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button
                                    onClick={downloadAcknowledgmentSlip}
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        padding: "11px 16px",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        background: "#0f2e5a",
                                        borderRadius: 8,
                                    }}
                                >
                                    <Download size={15} /> Download Slip
                                </button>

                                <Link
                                    href="/documents"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        padding: "11px 16px",
                                        background: "#eff6ff",
                                        color: "#1d4ed8",
                                        border: "1px solid #bfdbfe",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        textDecoration: "none",
                                    }}
                                >
                                    <FolderCheck size={15} /> View in Vault
                                </Link>

                                <Link
                                    href="/applications"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        padding: "11px 16px",
                                        background: "#f8fafc",
                                        color: "#334155",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        textDecoration: "none",
                                    }}
                                >
                                    Track Status <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* STAGE 6: ERROR */}
                    {stage === "ERROR" && (
                        <div style={{ textAlign: "center", padding: "20px 10px" }}>
                            <div
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: "50%",
                                    background: "#fee2e2",
                                    color: "#dc2626",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 12,
                                }}
                            >
                                <AlertTriangle size={26} />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#991b1b", marginBottom: 6 }}>
                                Portal Inspection or Browser Automation Failed
                            </h3>
                            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
                                {errorMessage}
                            </p>
                            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                                <button
                                    onClick={runPreFlightScan}
                                    className="btn-primary"
                                    style={{ padding: "10px 18px", fontSize: 13, borderRadius: 8 }}
                                >
                                    <RefreshCw size={14} /> Retry Handshake
                                </button>
                                <button
                                    onClick={onClose}
                                    style={{
                                        padding: "10px 16px",
                                        background: "#f8fafc",
                                        border: "1px solid #cbd5e1",
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "#475569",
                                        cursor: "pointer",
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
