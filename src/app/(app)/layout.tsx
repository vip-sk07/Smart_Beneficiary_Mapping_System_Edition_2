"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import ChatWidget from "@/components/chat/ChatWidget";
import PageTransition from "@/components/ui/PageTransition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "Sora, sans-serif", gap: 16 }}>
                <div style={{ width: 56, height: 56, position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#4338ca", animation: "spin 0.8s linear infinite" }} />
                    <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "linear-gradient(135deg, #4338ca, #6366f1)", opacity: 0.15 }} />
                </div>
                <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Loading your dashboard...</p>
            </div>
        );
    }

    if (!session) return null;

    return (
        <LanguageProvider>
        <div className="app-shell">
            {/* Mobile Header */}
            <div className="md:hidden">
                <MobileHeader
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                />
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(10,15,30,0.5)",
                        zIndex: 49,
                        backdropFilter: "blur(2px)",
                    }}
                />
            )}

            {/* Sidebar */}
            <div className={sidebarOpen ? "open" : ""}>
                <Sidebar
                    userRole={session.user?.role}
                    userName={session.user?.name ?? undefined}
                    userEmail={session.user?.email ?? undefined}
                    userImage={session.user?.image ?? undefined}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>

            {/* Main Content */}
            <main className="main-content pt-16 md:pt-0">
                <PageTransition>{children}</PageTransition>
            </main>

            {/* Global AI Chat Assistant */}
            <ChatWidget />
        </div>
        </LanguageProvider>
    );
}
