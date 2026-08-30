"use client";

import { useEffect, useState } from "react";
import { getOfflineApplications, removeOfflineApplication, OfflineApplication } from "@/lib/indexedDB";
import { RefreshCcw, WifiOff, CheckCircle2, Trash2, Clock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function OfflineSyncPage() {
    const [offlineApps, setOfflineApps] = useState<OfflineApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingId, setSyncingId] = useState<number | null>(null);

    // Hardcode the fetch of IDB since we don't have user session globally in client unless we fetch.
    // For idb getOfflineApplications needs userId... Or we can just get all applications from local DB.
    // The easiest is just getAll() but we restricted it. Let's just fetch session first or list all.
    useEffect(() => {
        async function fetchApps() {
            try {
                // To display, we can actually just get ALL offline applications locally, 
                // since device is presumed to be the user's personal device.
                const { initDB } = await import("@/lib/indexedDB");
                const db = await initDB();
                const allApps = await db.getAll("offline-applications");
                setOfflineApps(allApps);
            } catch (err) {
                console.error("Failed to load offline apps", err);
            } finally {
                setLoading(false);
            }
        }
        fetchApps();
    }, []);

    const handleSyncApp = async (app: OfflineApplication) => {
        if (!navigator.onLine) {
            toast.error("You are still offline. Please connect to internet to sync.");
            return;
        }

        setSyncingId(app.id!);
        try {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ schemeId: app.schemeId }),
            });

            if (res.ok) {
                await removeOfflineApplication(app.id!);
                setOfflineApps(prev => prev.filter(a => a.id !== app.id));
                toast.success(`Successfully uploaded application for ${app.schemeTitle}`);
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to sync. You may have already applied.");
            }
        } catch (err) {
            toast.error("Network error. Sync failed.");
        } finally {
            setSyncingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to discard this offline application?")) return;
        await removeOfflineApplication(id);
        setOfflineApps(prev => prev.filter(a => a.id !== id));
        toast.success("Discarded offline application.");
    };

    if (loading) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <WifiOff className="w-8 h-8 text-yellow-600" />
                        Pending Applications
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">
                        These applications were saved while you were offline.
                    </p>
                </div>
            </div>

            {offlineApps.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">You are fully synced!</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        There are no offline applications waiting to be synchronized to the cloud.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Header info */}
                    {!navigator.onLine && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 flex items-start gap-2 text-sm">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <p>You are currently <strong>Offline</strong>. Background sync will automatically push these when you regain internet access, or you can manually sync them when your connection is restored.</p>
                        </div>
                    )}
                    {navigator.onLine && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-xl border border-green-200 flex items-start gap-2 text-sm mb-4">
                            <WifiOff size={16} className="mt-0.5 shrink-0" />
                            <p>You are <strong>Online</strong>. Try syncing these queued applications now.</p>
                        </div>
                    )}

                    {offlineApps.map((app) => (
                        <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{app.schemeTitle || "Unknown Scheme"}</h3>
                                <div className="text-sm text-gray-500 flex items-center gap-4">
                                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(app.timestamp).toLocaleString()}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${app.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                        {app.status === 'failed' ? 'Sync Failed' : 'Pending Sync'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <button 
                                    onClick={() => handleDelete(app.id!)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Discard Draft"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleSyncApp(app)}
                                    disabled={syncingId === app.id || !navigator.onLine}
                                    className="btn-primary py-2 px-4 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <RefreshCcw size={16} className={syncingId === app.id ? "animate-spin" : ""} />
                                    {syncingId === app.id ? "Syncing..." : "Sync Now"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
