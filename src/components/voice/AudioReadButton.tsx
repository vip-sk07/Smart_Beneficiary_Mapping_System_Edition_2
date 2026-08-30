"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";

interface AudioReadButtonProps {
    text: string;
    lang?: string;
    label?: string;
}

export default function AudioReadButton({ text, lang = "en-IN", label }: AudioReadButtonProps) {
    const [speaking, setSpeaking] = useState(false);

    const handleSpeak = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!("speechSynthesis" in window)) {
            toast.error("Audio playback is not supported in this browser.");
            return;
        }

        if (speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }

        window.speechSynthesis.cancel(); // Stop any previous speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.95; // Slightly slower for clear understanding

        utterance.onstart = () => {
            setSpeaking(true);
            toast("🔊 Reading scheme details aloud...", { id: "audio-read" });
        };

        utterance.onend = () => {
            setSpeaking(false);
        };

        utterance.onerror = () => {
            setSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    return (
        <button
            type="button"
            onClick={handleSpeak}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 8px",
                borderRadius: 6,
                background: speaking ? "#dbeafe" : "#f1f5f9",
                color: speaking ? "#1d4ed8" : "#475569",
                border: speaking ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease"
            }}
            title={speaking ? "Stop reading" : "Read aloud (Audio Assistance)"}
        >
            {speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {label && <span>{speaking ? "Stop" : label}</span>}
        </button>
    );
}
