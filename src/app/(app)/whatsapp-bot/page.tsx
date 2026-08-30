"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, CheckCheck, Smartphone, Bot, RotateCcw, ExternalLink, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface WhatsAppMessage {
    id: string;
    text: string;
    sender: "user" | "bot";
    time: string;
    quickButtons?: string[];
    actionType?: string;
}

export default function WhatsAppBotPage() {
    const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const startConversation = async () => {
        setTyping(true);
        try {
            const res = await fetch("/api/webhook/whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "ALERT" })
            });
            const data = await res.json();
            setMessages([
                {
                    id: "msg-initial",
                    text: data.replyText,
                    sender: "bot",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    quickButtons: data.quickButtons,
                    actionType: data.actionType
                }
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setTyping(false);
        }
    };

    useEffect(() => {
        startConversation();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    const handleSend = async (textToSend: string) => {
        const text = textToSend.trim();
        if (!text) return;

        const userMsg: WhatsAppMessage = {
            id: "usr-" + Date.now(),
            text,
            sender: "user",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setTyping(true);

        try {
            const res = await fetch("/api/webhook/whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();

            const botMsg: WhatsAppMessage = {
                id: "bot-" + Date.now(),
                text: data.replyText || "Received.",
                sender: "bot",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                quickButtons: data.quickButtons,
                actionType: data.actionType
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            toast.error("Error communicating with WhatsApp bot.");
        } finally {
            setTyping(false);
        }
    };

    return (
        <div style={{ maxWidth: 850, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34, 197, 94, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Smartphone size={20} color="#16a34a" />
                        </div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f2e5a", margin: 0 }}>
                            Automated WhatsApp Welfare Gateway
                        </h1>
                    </div>
                    <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
                        Interactive 3-step conversational state machine: <strong>Alert ➔ SHOW ➔ Scheme Details & Official Portal Link</strong>.
                    </p>
                </div>

                <button
                    onClick={startConversation}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "#f1f5f9",
                        color: "#0f2e5a",
                        border: "1px solid #cbd5e1",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer"
                    }}
                >
                    <RotateCcw size={14} /> Restart Flow
                </button>
            </div>

            {/* Phone Container */}
            <div style={{
                background: "#ffffff",
                borderRadius: 24,
                border: "2px solid #cbd5e1",
                boxShadow: "0 16px 40px rgba(0,0,0,0.1)",
                overflow: "hidden",
                maxWidth: 460,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                height: 620
            }}>
                {/* WhatsApp Top Header Bar */}
                <div style={{
                    background: "#075e54",
                    padding: "12px 16px",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#128c7e", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                        <Bot size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                            SBMS Welfare Helpline
                            <span style={{ fontSize: 10, background: "#25d366", color: "white", padding: "1px 5px", borderRadius: 4 }}>OFFICIAL</span>
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.85 }}>
                            {typing ? "typing..." : "Verified Government Assistant"}
                        </div>
                    </div>
                </div>

                {/* Messages Chat Area */}
                <div style={{
                    flex: 1,
                    background: "#efeae2",
                    padding: "16px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                }}>
                    {messages.map(m => (
                        <div
                            key={m.id}
                            style={{
                                alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                                maxWidth: "88%",
                                display: "flex",
                                flexDirection: "column",
                                gap: 6
                            }}
                        >
                            <div style={{
                                background: m.sender === "user" ? "#d9fdd3" : "#ffffff",
                                padding: "10px 14px",
                                borderRadius: m.sender === "user" ? "10px 0 10px 10px" : "0 10px 10px 10px",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                                fontSize: 13,
                                color: "#111b21",
                                lineHeight: 1.5,
                                whiteSpace: "pre-wrap"
                            }}>
                                {m.text}
                                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, marginTop: 4, fontSize: 10, color: "#667781" }}>
                                    <span>{m.time}</span>
                                    {m.sender === "user" && <CheckCheck size={13} color="#53bdeb" />}
                                </div>
                            </div>

                            {/* Quick Action Button Pills */}
                            {m.quickButtons && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                    {m.quickButtons.map((btn, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(btn)}
                                            style={{
                                                fontSize: 11.5,
                                                fontWeight: 700,
                                                padding: "6px 12px",
                                                borderRadius: 99,
                                                background: "#ffffff",
                                                border: "1px solid #25d366",
                                                color: "#075e54",
                                                cursor: "pointer",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                                transition: "all 0.15s ease"
                                            }}
                                            className="hover:bg-green-50"
                                        >
                                            {btn}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {typing && (
                        <div style={{ alignSelf: "flex-start", background: "white", padding: "8px 14px", borderRadius: "0 10px 10px 10px", fontSize: 12, color: "#667781" }}>
                            Searching 4,725 government schemes...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Area */}
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                    style={{
                        background: "#f0f2f5",
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                    }}
                >
                    <input
                        type="text"
                        placeholder="Reply 'SHOW' or type a number (1, 2, 3)..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        style={{
                            flex: 1,
                            padding: "9px 14px",
                            borderRadius: 20,
                            border: "none",
                            background: "white",
                            fontSize: 13,
                            outline: "none"
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: input.trim() ? "#075e54" : "#aebac1",
                            color: "white",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: input.trim() ? "pointer" : "default"
                        }}
                    >
                        <Send size={15} />
                    </button>
                </form>
            </div>
        </div>
    );
}
