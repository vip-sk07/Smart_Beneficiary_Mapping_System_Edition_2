"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";

import { saveOfflineApplication } from "@/lib/indexedDB";
import { fireConfetti } from "@/components/ui/ConfettiEffect";

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

    async function handleApply() {
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
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    const registration = await navigator.serviceWorker.ready;
                    await (registration as any).sync.register('sync-applications');
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
        <button
            id="apply-btn"
            onClick={handleApply}
            disabled={loading}
            className="btn-primary"
            style={{ padding: "11px 24px" }}
        >
            {loading ? "Adding…" : "Track this Scheme"}
        </button>
    );
}
