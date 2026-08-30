"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, FileText, CheckCircle, Megaphone, Trash2, CheckCircle2, AlertTriangle, MessageSquare, MessageCircleWarning } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Notification = {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    link?: string;
    createdAt: string;
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllAsRead = async () => {
        try {
            if (unreadCount === 0) return;
            await fetch("/api/notifications", { method: "PATCH" });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success("All notifications marked as read");
        } catch (err) {
            toast.error("Failed to mark notifications as read");
        }
    };

    const handleNotificationClick = async (n: Notification) => {
        if (!n.isRead) {
            try {
                await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
                setNotifications(notifications.map(x => x.id === n.id ? { ...x, isRead: true } : x));
            } catch (err) {
                console.error("Failed to mark as read", err);
            }
        }
        if (n.link) {
            router.push(n.link);
            setIsOpen(false);
        }
    };

    const deleteNotification = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await fetch(`/api/notifications/${id}`, { method: "DELETE" });
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            toast.error("Failed to delete notification");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "application_update":
                return <FileText className="w-5 h-5 text-green-600" />;
            case "grievance_update":
                return <MessageSquare className="w-5 h-5 text-blue-600" />;
            case "announcement":
                return <Megaphone className="w-5 h-5 text-orange-500" />;
            case "document_expiry":
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 bottom-12 mb-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto bg-white">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                                <Bell className="w-8 h-8 text-gray-300" />
                                <p>You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-3 relative flex gap-3 cursor-pointer transition-colors ${n.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'} group`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-6">
                                            <p className={`text-sm tracking-tight ${n.isRead ? 'text-gray-700 font-medium' : 'text-gray-900 font-semibold'}`}>
                                                {n.title}
                                            </p>
                                            <p className={`text-xs mt-0.5 line-clamp-2 ${n.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                                                {formatTime(n.createdAt)}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <div className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full" />
                                        )}
                                        <button
                                            onClick={(e) => deleteNotification(e, n.id)}
                                            className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete notification"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="bg-gray-50 border-t border-gray-100 text-center text-xs p-2 text-gray-500 font-medium flex-shrink-0">
                            Showing latest {notifications.length} notifications
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
