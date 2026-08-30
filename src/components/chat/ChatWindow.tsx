"use client";

import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp?: Date;
}

interface ChatWindowProps {
    messages: Message[];
    isTyping: boolean;
}

export default function ChatWindow({ messages, isTyping }: ChatWindowProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    return (
        <div
            style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minHeight: 0,
            }}
        >
            {messages.map((msg, i) => (
                <ChatBubble
                    key={i}
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.timestamp}
                />
            ))}
            {isTyping && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
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
                            fontSize: 14,
                        }}
                    >
                        🤖
                    </div>
                    <TypingIndicator />
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
}
