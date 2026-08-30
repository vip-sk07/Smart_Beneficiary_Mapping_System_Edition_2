"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /chat is handled by the floating ChatWidget (global AI assistant).
 * The sidebar intercepts clicks and dispatches 'open-chat' event.
 * If a user lands here directly (bookmark / URL bar), redirect them
 * to the dashboard and open the chat widget via the event.
 */
export default function ChatPage() {
    const router = useRouter();

    useEffect(() => {
        // Fire the open-chat event so ChatWidget opens automatically
        window.dispatchEvent(new Event("open-chat"));
        // Then redirect to dashboard so there's no blank page
        router.replace("/dashboard");
    }, [router]);

    return (
        <div style={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
        }}>
            <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid #e2e8f0",
                borderTopColor: "#4338ca",
                animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>
                Opening AI Assistant…
            </p>
        </div>
    );
}
