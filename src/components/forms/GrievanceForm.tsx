"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

interface GrievanceFormProps {
    onSuccess: () => void;
}

export default function GrievanceForm({ onSuccess }: GrievanceFormProps) {
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!subject.trim()) { toast.error("Please enter a subject"); return; }
        if (description.trim().length < 20) {
            toast.error("Please describe your grievance in at least 20 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/grievances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, description }),
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error ?? "Failed to submit grievance");
            } else {
                toast.success("Grievance submitted successfully!");
                setSubject("");
                setDescription("");
                onSuccess();
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 14px",
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#92400e",
                }}
            >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                    Please be specific and factual. Grievances are reviewed by administrators
                    within 3–5 working days.
                </span>
            </div>

            <div className="input-group">
                <label className="label" htmlFor="grievance-subject">
                    Subject *
                </label>
                <input
                    id="grievance-subject"
                    type="text"
                    className="input"
                    placeholder="e.g. Application status not updated since 30 days"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={120}
                />
                <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    {subject.length}/120
                </span>
            </div>

            <div className="input-group">
                <label className="label" htmlFor="grievance-description">
                    Description *
                </label>
                <textarea
                    id="grievance-description"
                    className="input"
                    placeholder="Describe your issue in detail — what happened, when, and what outcome you expect..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    style={{ resize: "vertical" }}
                />
                <span style={{ fontSize: 11, color: description.length < 20 ? "#dc2626" : "#9ca3af", marginTop: 2 }}>
                    {description.length} characters (minimum 20)
                </span>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button
                    id="grievance-submit-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary"
                >
                    {loading ? "Submitting…" : "Submit Grievance"}
                </button>
            </div>
        </div>
    );
}
