"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, Bot, Plus } from "lucide-react";
import { saveOfflineApplication } from "@/lib/indexedDB";
import { fireConfetti } from "@/components/ui/ConfettiEffect";
import AutonomousAgentModal from "@/components/agent/AutonomousAgentModal";

export default function ApplyButton({
    schemeId,
    schemeTitle,
    userId,
}: {
    schemeId: string;
    schemeTitle: string;
    userId: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [applied, setApplied] = useState(false);
    const [isAgentOpen, setIsAgentOpen] = useState(false);

    async function handleManualTrack() {
        setLoading(true);

        // Check if offline
        if (!navigator.onLine) {
            try {
                // Save locally
                await saveOfflineApplication({
                    schemeId,
                    schemeTitle,
                    userId,
                    missingDocs: "Checked Offline",
                });

                // Try to register Background Sync
                if ("serviceWorker" in navigator && "SyncManager" in window) {
                    const registration = await navigator.serviceWorker.ready;
                    await (registration as any).sync.register("sync-applications");
                }

                toast.success("You are offline. Application saved locally and will auto-submit when connected.", { duration: 5000 });
                setApplied(true);
            } catch (err) {
                console.error("Offline save error", err);
                toast.error("Failed to save application locally.");
            } finally {
                setLoading(false);
            }
            return;
        }

        try {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ schemeId }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error ?? "Failed to apply");
            } else {
                fireConfetti("indian");
                toast.success(`Started tracking "${schemeTitle}"!`);
                setApplied(true);
                router.refresh();
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (applied) {
        return (
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    borderRadius: 8,
                    background: "#f0fdf4",
                    border: "1.5px solid #86efac",
                    color: "#15803d",
                    fontSize: 14,
                    fontWeight: 600,
                }}
            >
                <CheckCircle2 size={16} /> Tracking Application
            </div>
        );
    }

    return (
        <>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {/* Autonomous Agent Button */}
                <button
                    id="autonomous-agent-btn"
                    onClick={() => setIsAgentOpen(true)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 20px",
                        borderRadius: 8,
                        background: "linear-gradient(135deg, #0f2e5a 0%, #1e40af 100%)",
                        color: "#ffffff",
                        fontSize: 13.5,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(15, 46, 90, 0.2)",
                        transition: "all 0.15s ease",
                    }}
                    className="hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Bot size={17} className="text-blue-300" />
                    <span>Apply via Agent</span>
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 800,
                            background: "#10b981",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: 4,
                            marginLeft: 2,
                            letterSpacing: "0.03em",
                        }}
                    >
                        ZERO-TOUCH
                    </span>
                </button>

                {/* Manual Tracking Button */}
                <button
                    id="apply-btn"
                    onClick={handleManualTrack}
                    disabled={loading}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 16px",
                        borderRadius: 8,
                        background: "#f8fafc",
                        color: "#475569",
                        border: "1.5px solid #cbd5e1",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                    className="hover:bg-slate-100"
                >
                    <Plus size={14} />
                    {loading ? "Adding…" : "Track Manually"}
                </button>
            </div>

            {/* Autonomous Registration Modal */}
            <AutonomousAgentModal
                isOpen={isAgentOpen}
                onClose={() => setIsAgentOpen(false)}
                schemeId={schemeId}
                schemeTitle={schemeTitle}
                onSuccessCallback={() => {
                    setApplied(true);
                    router.refresh();
                }}
            />
        </>
    );
}
