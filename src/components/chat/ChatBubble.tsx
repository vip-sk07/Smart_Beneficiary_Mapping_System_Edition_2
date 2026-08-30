import { Bot } from "lucide-react";

interface ChatBubbleProps {
    role: "user" | "assistant";
    content: string;
    timestamp?: Date;
}

export default function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
    const isUser = role === "user";

    const timeStr = timestamp
        ? new Intl.DateTimeFormat("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }).format(timestamp)
        : null;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                flexDirection: isUser ? "row-reverse" : "row",
            }}
        >
            {/* Avatar */}
            {!isUser && (
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #1a38f5, #4f6ef7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(26,56,245,0.25)",
                    }}
                >
                    <Bot size={16} color="white" />
                </div>
            )}

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    gap: 4,
                    maxWidth: "75%",
                }}
            >
                <div className={isUser ? "chat-bubble-user" : "chat-bubble-bot"}>
                    {/* Render content with line breaks */}
                    {content.split("\n").map((line, i) => (
                        <span key={i}>
                            {line}
                            {i < content.split("\n").length - 1 && <br />}
                        </span>
                    ))}
                </div>
                {timeStr && (
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{timeStr}</span>
                )}
            </div>
        </div>
    );
}
