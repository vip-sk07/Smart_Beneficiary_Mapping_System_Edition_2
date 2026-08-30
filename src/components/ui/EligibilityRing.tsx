"use client";

import { motion } from "framer-motion";

interface EligibilityRingProps {
    percentage: number;
    color?: string;
    size?: number;
    showLabel?: boolean;
    label?: string;
}

export default function EligibilityRing({
    percentage,
    color,
    size = 80,
    showLabel = true,
    label = "Match",
}: EligibilityRingProps) {
    // Determine color based on percentage if not provided
    const getColor = () => {
        if (color) return color;
        if (percentage >= 80) return "#22c55e"; // green
        if (percentage >= 50) return "#f97316"; // orange
        return "#ef4444"; // red
    };

    const ringColor = getColor();
    const strokeWidth = size / 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div
            style={{
                width: size,
                height: size,
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <svg
                width={size}
                height={size}
                style={{ transform: "rotate(-90deg)", position: "absolute" }}
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{
                        filter: `drop-shadow(0 0 4px ${ringColor}40)`,
                    }}
                />
            </svg>
            {showLabel && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                        style={{
                            fontSize: size / 4,
                            fontWeight: 700,
                            color: ringColor,
                            lineHeight: 1,
                        }}
                    >
                        {percentage}%
                    </motion.span>
                    {size >= 60 && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.3 }}
                            style={{
                                fontSize: size / 8,
                                color: "#9ca3af",
                                fontWeight: 500,
                            }}
                        >
                            {label}
                        </motion.span>
                    )}
                </div>
            )}
        </div>
    );
}
