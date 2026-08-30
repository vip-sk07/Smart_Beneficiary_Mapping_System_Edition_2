"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Volume2, Globe } from "lucide-react";
import toast from "react-hot-toast";

interface VoiceInputButtonProps {
    onTranscript: (text: string) => void;
    placeholder?: string;
    lang?: string;
}

export default function VoiceInputButton({ onTranscript, placeholder = "Listening...", lang = "en-IN" }: VoiceInputButtonProps) {
    const [isListening, setIsListening] = useState(false);
    const [selectedLang, setSelectedLang] = useState(lang);
    const [recognition, setRecognition] = useState<any>(null);
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setSupported(true);
            const reco = new SpeechRecognition();
            reco.continuous = false;
            reco.interimResults = true;
            reco.lang = selectedLang;

            reco.onstart = () => {
                setIsListening(true);
                toast.success(`Voice active: Speak in ${getLangLabel(selectedLang)}`, { id: "voice-toast" });
            };

            reco.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript;
                if (event.results[current].isFinal) {
                    onTranscript(transcript);
                    setIsListening(false);
                }
            };

            reco.onerror = (event: any) => {
                console.error("Speech Recognition Error", event.error);
                setIsListening(false);
                if (event.error === "not-allowed") {
                    toast.error("Microphone access denied. Please allow microphone permissions.");
                } else {
                    toast.error("Voice input error. Please try again.");
                }
            };

            reco.onend = () => {
                setIsListening(false);
            };

            setRecognition(reco);
        } else {
            setSupported(false);
        }
    }, [selectedLang]);

    const getLangLabel = (code: string) => {
        switch (code) {
            case "ta-IN": return "Tamil (தமிழ்)";
            case "hi-IN": return "Hindi (हिन्दी)";
            case "te-IN": return "Telugu (తెలుగు)";
            default: return "English";
        }
    };

    const toggleListening = () => {
        if (!supported) {
            toast.error("Voice recognition is not supported in this browser. Please use Google Chrome or Edge.");
            return;
        }

        if (isListening) {
            recognition?.stop();
            setIsListening(false);
        } else {
            try {
                recognition.lang = selectedLang;
                recognition?.start();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {/* Language Selector Dropdown */}
            <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 6px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    color: "#0f2e5a",
                    cursor: "pointer",
                    outline: "none"
                }}
                title="Select Voice Language"
            >
                <option value="en-IN">EN (English)</option>
                <option value="ta-IN">TA (தமிழ்)</option>
                <option value="hi-IN">HI (हिन्दी)</option>
                <option value="te-IN">TE (తెలుగు)</option>
            </select>

            {/* Mic Toggle Button */}
            <button
                type="button"
                onClick={toggleListening}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: isListening ? "2px solid #ef4444" : "1px solid #cbd5e1",
                    background: isListening ? "#fee2e2" : "#f1f5f9",
                    color: isListening ? "#ef4444" : "#475569",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    animation: isListening ? "pulse-mic 1.5s infinite" : "none"
                }}
                title={isListening ? "Listening... Click to stop" : "Click to speak in your language"}
            >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <style>{`
                @keyframes pulse-mic {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    50% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.2); }
                }
            `}</style>
        </div>
    );
}
