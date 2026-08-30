"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    Shield,
    LayoutDashboard,
    Search,
    FileText,
    Bot,
    User,
    BarChart3,
    Users,
    Settings,
    LogOut,
    AlertCircle,
    Megaphone,
    ShieldCheck,
    FolderOpen,
    Globe,
    WifiOff,
    Sparkles,
    ChevronRight,
    MapPin,
    MessageSquare,
} from "lucide-react";
import NotificationBell from "@/components/ui/NotificationBell";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
    userRole?: string;
    userName?: string;
    userEmail?: string;
    userImage?: string;
    onClose?: () => void;
}

const userNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "#818cf8" },
    { href: "/schemes", label: "Browse Schemes", icon: Search, color: "#34d399" },
    { href: "/ai-finder", label: "AI Finder", icon: Sparkles, color: "#f472b6", isNew: true },
    { href: "/eligibility", label: "My Eligibility", icon: ShieldCheck, color: "#60a5fa" },
    { href: "/applications", label: "My Applications", icon: FileText, color: "#fb923c" },
    { href: "/documents", label: "Document Vault", icon: FolderOpen, color: "#a78bfa" },
    { href: "/centers", label: "Find CSC Centers", icon: MapPin, color: "#38bdf8" },
    { href: "/whatsapp-bot", label: "WhatsApp Gateway", icon: MessageSquare, color: "#22c55e", isNew: true },
    { href: "/grievances", label: "My Grievances", icon: AlertCircle, color: "#f87171" },
    { href: "/chat", label: "AI Assistant", icon: Bot, color: "#2dd4bf" },
    { href: "/announcements", label: "Announcements", icon: Megaphone, color: "#fbbf24" },
    { href: "/profile", label: "Edit Profile", icon: User, color: "#94a3b8" },
];

const adminNavItems = [
    { href: "/admin/stats", label: "Platform Stats", icon: BarChart3, color: "#818cf8" },
    { href: "/admin/users", label: "Manage Users", icon: Users, color: "#34d399" },
    { href: "/admin/schemes", label: "Manage Schemes", icon: Settings, color: "#60a5fa" },
    { href: "/admin/applications", label: "Manage Applications", icon: FileText, color: "#a855f7" },
    { href: "/admin/grievances", label: "Manage Grievances", icon: AlertCircle, color: "#f87171" },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone, color: "#fbbf24" },
];

export default function Sidebar({
    userRole,
    userName,
    userEmail,
    userImage,
    onClose,
}: SidebarProps) {
    const pathname = usePathname();
    const { language, setLanguage, t } = useLanguage();
    const [hasUnread, setHasUnread] = useState(false);
    const [offlineCount, setOfflineCount] = useState(0);

    useEffect(() => {
        fetch("/api/announcements/unread")
            .then(res => res.json())
            .then(data => setHasUnread(data.hasUnread))
            .catch(() => {});

        import("@/lib/indexedDB")
            .then(({ initDB }) => initDB())
            .then(db => db.getAll("offline-applications"))
            .then(apps => setOfflineCount(apps.length))
            .catch(() => {});
    }, [pathname]);

    const isActive = (href: string) =>
        href === "/dashboard" ? pathname === href : pathname.startsWith(href);

    const isAdmin = userRole === "ADMIN";
    // Admin users: only show Announcements and Edit Profile from user nav
    // Everything else is covered by the dedicated admin panel
    const ADMIN_ALLOWED = ["/announcements", "/profile", "/ai-finder", "/chat", "/schemes"];
    const visibleUserNavItems = isAdmin
        ? userNavItems.filter(item => ADMIN_ALLOWED.includes(item.href))
        : userNavItems;

    return (
        <aside className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
            {/* Flag stripe */}
            <div className="flag-stripe" />

            {/* Logo */}
            <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{
                        width: 40, height: 40,
                        background: "linear-gradient(135deg, #6366f1, #818cf8)",
                        borderRadius: 12,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
                    }}>
                        <Shield size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: "white", lineHeight: 1.2, letterSpacing: "-0.01em" }}>Smart Beneficiary</div>
                        <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>Mapping System</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ padding: "12px 10px 0", flex: 1, overflowY: "auto" }}>
                <div className="section-label" style={{ paddingLeft: 6, marginBottom: 8 }}>{isAdmin ? "My Account" : "Navigation"}</div>

                {visibleUserNavItems.map(({ href, label, icon: Icon, color, isNew }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={(e) => {
                                if (href === "/chat") {
                                    e.preventDefault();
                                    window.dispatchEvent(new Event('open-chat'));
                                }
                                onClose?.();
                            }}
                            className={`nav-item ${active ? "active" : ""}`}
                            style={{ marginBottom: 2 }}
                        >
                            {/* Icon wrapper with subtle colored background when active */}
                            <div style={{
                                width: 30, height: 30, borderRadius: 8,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                                background: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                                color: active ? "white" : color,
                                transition: "all 0.15s ease",
                            }}>
                                <Icon size={15} />
                            </div>

                            <span style={{ flex: 1, fontSize: 13.5 }}>
                                {t(`nav.${href.substring(1)}`, label)}
                            </span>

                            {/* Badges & indicators */}
                            {href === "/announcements" && hasUnread && (
                                <div style={{
                                    width: 7, height: 7, background: "#f87171",
                                    borderRadius: "50%",
                                    boxShadow: "0 0 0 2px rgba(248,113,113,0.3)",
                                }} />
                            )}
                            {isNew && !active && (
                                <span style={{
                                    fontSize: 9, fontWeight: 800,
                                    background: "linear-gradient(135deg, #f472b6, #c084fc)",
                                    color: "white",
                                    padding: "2px 6px",
                                    borderRadius: 99,
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                }}>NEW</span>
                            )}
                            {active && <ChevronRight size={13} style={{ opacity: 0.7 }} />}
                        </Link>
                    );
                })}

                {/* Offline sync — hidden for admins */}
                {!isAdmin && offlineCount > 0 && (
                    <Link href="/offline-sync" onClick={onClose}
                        className={`nav-item ${isActive("/offline-sync") ? "active" : ""}`}
                        style={{ marginBottom: 2 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}>
                            <WifiOff size={15} />
                        </div>
                        <span style={{ flex: 1, fontSize: 13.5 }}>Pending Sync</span>
                        <div style={{ padding: "2px 7px", fontSize: 10, fontWeight: 800, background: "rgba(251,191,36,0.2)", color: "#fbbf24", borderRadius: 99, border: "1px solid rgba(251,191,36,0.3)" }}>
                            {offlineCount}
                        </div>
                    </Link>
                )}

                {/* Admin */}
                {userRole === "ADMIN" && (
                    <>
                        <div className="section-label" style={{ paddingLeft: 6, marginTop: 16, marginBottom: 8 }}>Admin Panel</div>
                        {adminNavItems.map(({ href, label, icon: Icon, color }) => (
                            <Link key={href} href={href} onClick={onClose}
                                className={`nav-item ${isActive(href) ? "active" : ""}`}
                                style={{ marginBottom: 2 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: isActive(href) ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)", color: isActive(href) ? "white" : color, transition: "all 0.15s ease" }}>
                                    <Icon size={15} />
                                </div>
                                <span style={{ fontSize: 13.5 }}>{label}</span>
                            </Link>
                        ))}
                    </>
                )}
            </nav>

            {/* Footer */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "12px 10px" }}>
                {/* Language */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "0 4px" }}>
                    <Globe size={13} color="rgba(255,255,255,0.3)" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        style={{
                            fontSize: 12, fontWeight: 600,
                            color: "rgba(255,255,255,0.5)",
                            background: "transparent", border: "none", outline: "none",
                            cursor: "pointer", width: "100%",
                        }}
                    >
                        <option value="en" style={{ color: "#111" }}>English</option>
                        <option value="hi" style={{ color: "#111" }}>हिंदी (Hindi)</option>
                        <option value="mr" style={{ color: "#111" }}>मराठी (Marathi)</option>
                    </select>
                </div>

                {/* Account label */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "0 4px" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Account</span>
                    <NotificationBell />
                </div>

                {/* User info */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 10px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    marginBottom: 8,
                }}>
                    {userImage ? (
                        <img src={userImage} alt={userName ?? "User"} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(99,102,241,0.4)" }} />
                    ) : (
                        <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: "linear-gradient(135deg, #6366f1, #818cf8)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: 800, fontSize: 13, flexShrink: 0,
                            boxShadow: "0 0 0 2px rgba(99,102,241,0.4)",
                        }}>
                            {userName?.[0]?.toUpperCase() ?? "U"}
                        </div>
                    )}
                    <div style={{ overflow: "hidden", flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {userName ?? "User"}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {userEmail}
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <button
                    id="sidebar-logout-btn"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="nav-item"
                    style={{ width: "100%", color: "rgba(248,113,113,0.8)", fontSize: 13 }}
                >
                    <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(248,113,113,0.1)" }}>
                        <LogOut size={14} />
                    </div>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
