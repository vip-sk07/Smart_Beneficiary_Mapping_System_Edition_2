"use client";

import { useMemo } from "react";

interface PasswordStrengthProps {
    password: string;
}

/**
 * Calculate password strength score (0-4)
 * - Length ≥ 8 (+1), ≥ 12 (+1)
 * - Contains uppercase (+1)
 * - Contains number (+1)
 * - Contains special char !@#$%^&* (+1)
 */
function calculateStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;

    if (!password) {
        return { score: 0, label: "", color: "#e5e7eb" };
    }

    // Length checks
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character type checks
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    // Cap at 4
    score = Math.min(score, 4);

    const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#15803d"];

    return {
        score,
        label: labels[score - 1] || "",
        color: colors[score - 1] || "#e5e7eb",
    };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
    const { score, label, color } = useMemo(() => calculateStrength(password), [password]);

    if (!password) {
        return null;
    }

    return (
        <div style={{ marginTop: 8 }}>
            {/* Strength bars */}
            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: level <= score ? color : "#e5e7eb",
                            transition: "background-color 0.3s ease",
                        }}
                    />
                ))}
            </div>

            {/* Strength label */}
            <div
                style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: color,
                    transition: "color 0.3s ease",
                }}
            >
                {label && `Password strength: ${label}`}
            </div>

            {/* Requirements hint */}
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                {score < 4 && (
                    <span>
                        {password.length < 8 && "Use 8+ characters. "}
                        {!/[A-Z]/.test(password) && "Add uppercase. "}
                        {!/[0-9]/.test(password) && "Add numbers. "}
                        {!/[!@#$%^&*]/.test(password) && "Add special chars (!@#$%^&*)."}
                    </span>
                )}
            </div>
        </div>
    );
}
