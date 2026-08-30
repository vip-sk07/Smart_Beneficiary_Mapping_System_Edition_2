// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Mic, Sparkles, MoveUpRight, RefreshCw, ChevronDown, Zap } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

const QUICK_REPLIES = [
    { icon: "🛡️", text: "What schemes am I eligible for?" },
    { icon: "🌾", text: "Find farmer schemes" },
    { icon: "💰", text: "Income support schemes" },
    { icon: "📋", text: "How to apply?" },
];

function AgentActionCard({ schemeName }: { schemeName: string }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleRun = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/agent/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schemeName })
            });
            const data = await res.json();
            setResult(data);
            if (data.success) { toast.success("Agent successfully completed application!"); }
            else { toast.error(data.error || "Agent failed."); }
        } catch (err) {
            setResult({ error: "Failed to connect to agent" });
            toast.error("Failed to connect to agent");
        }
        setLoading(false);
    };

    if (result) {
        return (
            <div style={{ margin: "10px 0", borderRadius: 12, border: result.success ? "1px solid #16a34a" : "1px solid #dc2626", padding: 16, background: result.success ? "#f0fdf4" : "#fef2f2" }}>
                <div style={{ fontWeight: 800, color: result.success ? "#16a34a" : "#dc2626", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    {result.success ? "✅ Application Submitted" : "❌ Automation Failed"}
                </div>
                {result.referenceId && (
                    <div style={{ background: "white", padding: "8px 12px", borderRadius: 8, fontSize: 13, border: "1px solid #bbf7d0", color: "#15803d", fontWeight: 600 }}>
                        Ref ID: {result.referenceId}
                    </div>
                )}
                {result.error && <p style={{ fontSize: 12, color: "#991b1b" }}>{result.error}</p>}
            </div>
        );
    }

    return (
        <div style={{ margin: "10px 0", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(139, 92, 246, 0.2)", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
                    <Bot size={13} /> AI Action Agent
                </span>
                <span style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 9, padding: "2px 6px", borderRadius: 99, fontWeight: 800 }}>EXPERIMENTAL</span>
            </div>
            <div style={{ padding: "14px" }}>
                <p style={{ fontSize: 13, color: "#475569", marginBottom: 12, lineHeight: 1.5 }}>
                    Let the SBMS backend launch a hidden browser to automatically fill out and submit the application for <strong>{schemeName}</strong> using your profile data.
                </p>
                <button 
                    onClick={handleRun}
                    disabled={loading}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: loading ? "#cbd5e1" : "linear-gradient(135deg, #7c3aed, #a855f7)", color: "white", fontSize: 13, fontWeight: 700, padding: "10px 12px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 10px rgba(124, 58, 237, 0.25)" }}
                >
                    {loading ? "Agent is browsing the portal..." : "Run Automated Agent"} 
                    {!loading && <Sparkles size={14} />}
                </button>
            </div>
        </div>
    );
}

function parseMessageContent(content: string, sources: any[]) {
    if (!content) return null;
    const parts = content.split(/(\[SCHEME_CARD:[^\]]+\]|\[AGENT_RUN:[^\]]+\])/g);
    return parts.map((part, index) => {
        const schemeMatch = part.match(/\[SCHEME_CARD:\s*([^\]]+)\]/);
        if (schemeMatch) {
            const schemeId = schemeMatch[1].trim();
            const source = sources.find(s => s.id === schemeId);
            if (!source) return null;
            return (
                <div key={index} style={{ margin: "10px 0", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(99,102,241,0.15)", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                    <div style={{ background: "linear-gradient(135deg, #4338ca, #6366f1)", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.06em" }}>{source.category ?? "Scheme"}</span>
                        <Sparkles size={11} color="rgba(255,255,255,0.7)" />
                    </div>
                    <div style={{ padding: "12px" }}>
                        <h4 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 4, lineHeight: 1.3 }}>{source.title}</h4>
                        <p style={{ fontSize: 11.5, color: "#64748b", marginBottom: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{source.benefits}</p>
                        <Link href={`/schemes/${schemeId}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "linear-gradient(135deg, #4338ca, #6366f1)", color: "white", fontSize: 12, fontWeight: 700, padding: "7px 12px", borderRadius: 10, textDecoration: "none", boxShadow: "0 4px 10px rgba(99,102,241,0.25)" }}>
                            View &amp; Apply <MoveUpRight size={12} />
                        </Link>
                    </div>
                </div>
            );
        }

        const agentMatch = part.match(/\[AGENT_RUN:\s*([^\]]+)\]/);
        if (agentMatch) {
            const schemeName = agentMatch[1].trim();
            return <AgentActionCard key={index} schemeName={schemeName} />;
        }

        return <span key={index} style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{part}</span>;
    });
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [sources, setSources] = useState<any[]>([]);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener("open-chat", handleOpenChat);
        return () => window.removeEventListener("open-chat", handleOpenChat);
    }, []);

    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen, isLoading]);

    useEffect(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SR) {
            recognitionRef.current = new SR();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (event: any) => {
                let final = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) final += event.results[i][0].transcript;
                }
                if (final) { setInput(p => p ? p + " " + final : final); setIsListening(false); }
            };
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    // Auto resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + "px";
        }
    }, [input]);

    const toggleListening = () => {
        if (!recognitionRef.current) { toast.error("Voice not supported."); return; }
        if (isListening) recognitionRef.current.stop();
        else { recognitionRef.current.start(); setIsListening(true); }
    };

    const clearChat = () => {
        setMessages([]);
        setSources([]);
    };

    async function sendMessage(text: string) {
        if (!text.trim() || isLoading) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: text };
        const allMessages = [...messages, userMsg];
        setMessages(allMessages);
        setInput("");
        setIsLoading(true);
        const assistantId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

        try {
            abortRef.current = new AbortController();
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })), language: "en" }),
                signal: abortRef.current.signal,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error ?? "Failed to get response");
                setMessages(prev => prev.filter(m => m.id !== assistantId));
                return;
            }
            const sourcesHeader = res.headers.get("x-chat-sources");
            if (sourcesHeader) {
                try { setSources(prev => [...prev, ...JSON.parse(atob(sourcesHeader))]); } catch {}
            }
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) return;
            let assembled = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                assembled += decoder.decode(value, { stream: true });
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assembled } : m));
            }
        } catch (err: any) {
            if (err.name !== "AbortError") {
                toast.error("Connection error. Please try again.");
                setMessages(prev => prev.filter(m => m.id !== assistantId));
            }
        } finally {
            setIsLoading(false);
        }
    }

    const chatWidth = isExpanded ? 520 : 380;

    return (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="chat-panel"
                        initial={{ opacity: 0, scale: 0.92, y: 24, originX: 1, originY: 1 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 24 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        style={{
                            width: chatWidth,
                            maxWidth: "calc(100vw - 48px)",
                            marginBottom: 16,
                            borderRadius: 24,
                            overflow: "hidden",
                            boxShadow: "0 32px 72px rgba(15,23,42,0.22), 0 0 0 1px rgba(99,102,241,0.12)",
                            display: "flex",
                            flexDirection: "column",
                            height: isExpanded ? "min(700px, calc(100vh - 120px))" : "min(580px, calc(100vh - 120px))",
                            background: "#fafbff",
                        }}
                    >
                        {/* ── Header ── */}
                        <div style={{
                            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
                            padding: "16px 18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexShrink: 0,
                            position: "relative",
                            overflow: "hidden",
                        }}>
                            {/* Background decoration */}
                            <div style={{ position: "absolute", top: -20, right: 60, width: 80, height: 80, borderRadius: "50%", background: "rgba(129,140,248,0.15)", pointerEvents: "none" }} />

                            <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
                                {/* Animated bot icon */}
                                <div style={{ position: "relative" }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
                                        <Bot size={22} color="white" />
                                    </div>
                                    {/* Online pulse  */}
                                    <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "#34d399", border: "2px solid #1e1b4b" }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: "white", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 6 }}>
                                        SBMS Assistant
                                        <span style={{ fontSize: 9, fontWeight: 800, background: "rgba(52,211,153,0.2)", color: "#34d399", padding: "2px 6px", borderRadius: 99, border: "1px solid rgba(52,211,153,0.3)", letterSpacing: "0.05em" }}>LOCAL AI</span>
                                    </div>
                                    <div style={{ fontSize: 11.5, color: "rgba(165,180,252,0.8)", display: "flex", alignItems: "center", gap: 5 }}>
                                        <Zap size={11} color="#34d399" />
                                        Personalized Government Assistant · Online
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 4, position: "relative" }}>
                                {/* Clear chat */}
                                {messages.length > 0 && (
                                    <button onClick={clearChat} title="Clear chat" style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", transition: "all 0.15s" }}>
                                        <RefreshCw size={14} />
                                    </button>
                                )}
                                {/* Expand / collapse */}
                                <button onClick={() => setIsExpanded(e => !e)} title={isExpanded ? "Compact" : "Expand"} style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", transition: "all 0.15s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                                    <ChevronDown size={16} />
                                </button>
                                {/* Close */}
                                <button onClick={() => setIsOpen(false)} style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", transition: "all 0.15s" }}>
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* ── Messages ── */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
                            {/* Welcome card */}
                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    {/* Welcome card */}
                                    <div style={{ background: "white", borderRadius: 18, border: "1px solid #e8edf5", padding: "18px", marginBottom: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                                        <div style={{ fontSize: 22, marginBottom: 8 }}>👋</div>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.01em" }}>Hi! I'm the SBMS Assistant</div>
                                        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, fontWeight: 400 }}>
                                            I already know your profile (age, income, location) and can instantly check which government schemes you qualify for.
                                        </div>
                                        <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(99,102,241,0.06)", borderRadius: 12, border: "1px solid rgba(99,102,241,0.1)" }}>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: "#4338ca" }}>Try asking: </span>
                                            <span style={{ fontSize: 12, color: "#64748b" }}>"What schemes am I eligible for?"</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Messages */}
                            {messages.map((m, idx) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.22 }}
                                    style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
                                >
                                    {/* Bot avatar on left for assistant */}
                                    {m.role === "assistant" && (
                                        <div style={{ width: 28, height: 28, borderRadius: 10, background: "linear-gradient(135deg, #4338ca, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8, marginTop: 2, boxShadow: "0 2px 8px rgba(99,102,241,0.25)" }}>
                                            <Bot size={14} color="white" />
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: "80%",
                                        padding: m.role === "user" ? "10px 14px" : "12px 14px",
                                        borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                        fontSize: 13.5,
                                        fontWeight: m.role === "user" ? 600 : 400,
                                        lineHeight: 1.6,
                                        background: m.role === "user"
                                            ? "linear-gradient(135deg, #4338ca, #6366f1)"
                                            : "white",
                                        color: m.role === "user" ? "white" : "#1e293b",
                                        border: m.role === "user" ? "none" : "1px solid #e8edf5",
                                        boxShadow: m.role === "user"
                                            ? "0 4px 14px rgba(99,102,241,0.3)"
                                            : "0 2px 8px rgba(0,0,0,0.05)",
                                    }}>
                                        {m.role === "user"
                                            ? m.content
                                            : m.content
                                                ? parseMessageContent(m.content, sources)
                                                : <span style={{ color: "#94a3b8", fontSize: 12, fontStyle: "italic" }}>Thinking...</span>
                                        }
                                    </div>
                                </motion.div>
                            ))}

                            {/* Animated typing dots */}
                            {isLoading && messages.at(-1)?.content === "" && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 10, background: "linear-gradient(135deg, #4338ca, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(99,102,241,0.25)" }}>
                                        <Bot size={14} color="white" />
                                    </div>
                                    <div style={{ background: "white", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", border: "1px solid #e8edf5", display: "flex", gap: 5, alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                                        {[0, 1, 2].map(i => (
                                            <motion.div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1" }}
                                                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                                                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* ── Input Area ── */}
                        <div style={{ padding: "12px 14px 16px", background: "white", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
                            {/* Quick replies — only shown early in conversation */}
                            {!isLoading && messages.length < 2 && (
                                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
                                    {QUICK_REPLIES.map(qr => (
                                        <button key={qr.text} onClick={() => sendMessage(qr.text)}
                                            style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 99, fontSize: 12, fontWeight: 600, color: "#334155", cursor: "pointer", transition: "all 0.15s ease", fontFamily: "Sora, sans-serif", whiteSpace: "nowrap" }}>
                                            {qr.icon} {qr.text}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div style={{
                                display: "flex", alignItems: "flex-end", gap: 8,
                                background: "#f8fafc",
                                border: "2px solid #e2e8f0",
                                borderRadius: 16, padding: "8px 8px 8px 14px",
                                transition: "border-color 0.2s, box-shadow 0.2s",
                            }}
                                onFocusCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#6366f1"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)"; }}
                                onBlurCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
                                {isListening ? (
                                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 42 }}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <motion.div key={i} style={{ width: 4, background: "#ef4444", borderRadius: 99 }}
                                                animate={{ height: ["8px", "24px", "8px"] }}
                                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }} />
                                        ))}
                                        <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700, marginLeft: 8 }}>Listening...</span>
                                    </div>
                                ) : (
                                    <textarea
                                        ref={textareaRef}
                                        style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 13.5, fontFamily: "Sora, sans-serif", color: "#0f172a", lineHeight: 1.5, minHeight: 36, maxHeight: 100, padding: "4px 0" }}
                                        placeholder="Ask about government schemes..."
                                        value={input}
                                        rows={1}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                                    />
                                )}

                                {/* Mic */}
                                <button onClick={toggleListening}
                                    style={{ width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: isListening ? "#fef2f2" : "#f1f5f9", color: isListening ? "#ef4444" : "#94a3b8", flexShrink: 0, transition: "all 0.15s" }}>
                                    <Mic size={16} />
                                </button>

                                {/* Send */}
                                <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}
                                    style={{ width: 36, height: 36, borderRadius: 10, border: "none", cursor: !input.trim() || isLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: !input.trim() || isLoading ? "#e2e8f0" : "linear-gradient(135deg, #4338ca, #6366f1)", color: !input.trim() || isLoading ? "#94a3b8" : "white", flexShrink: 0, transition: "all 0.15s", boxShadow: !input.trim() || isLoading ? "none" : "0 4px 10px rgba(99,102,241,0.3)" }}>
                                    <Send size={15} />
                                </button>
                            </div>
                            <p style={{ fontSize: 10.5, color: "#94a3b8", textAlign: "center", marginTop: 6, fontWeight: 500 }}>
                                Local AI (Ollama) · Government data from official sources
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Floating Bubble ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        key="chat-fab"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: 60, height: 60,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #1e1b4b, #4338ca, #6366f1)",
                            border: "none", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white",
                            boxShadow: "0 8px 28px rgba(67,56,202,0.45), 0 0 0 1px rgba(99,102,241,0.3)",
                            position: "relative",
                        }}
                    >
                        {/* Outer animated ring */}
                        <motion.div
                            style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.4)" }}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <Bot size={28} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Close button when open */}
            {isOpen && (
                <motion.button
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                    onClick={() => setIsOpen(false)}
                    style={{ width: 52, height: 52, borderRadius: "50%", background: "#0f172a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.7)", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}
                >
                    <X size={22} />
                </motion.button>
            )}
        </div>
    );
}
