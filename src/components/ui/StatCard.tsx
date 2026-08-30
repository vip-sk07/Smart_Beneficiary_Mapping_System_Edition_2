"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    index?: number;
}

function useCountUp(target: number, duration = 1.2, delay = 0) {
    const [count, setCount] = useState(0);
    const rafRef = useRef<number>(0);
    const startRef = useRef<number | null>(null);

    useEffect(() => {
        startRef.current = null;
        const run = (ts: number) => {
            if (startRef.current === null) startRef.current = ts;
            const elapsed = ts - startRef.current;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(ease * target));
            if (progress < 1) rafRef.current = requestAnimationFrame(run);
        };
        const timeout = setTimeout(() => { rafRef.current = requestAnimationFrame(run); }, delay * 1000);
        return () => { clearTimeout(timeout); cancelAnimationFrame(rafRef.current); };
    }, [target, duration, delay]);

    return count;
}

export default function StatCard({ title, value, icon, color, bg, index = 0 }: StatCardProps) {
    const numericValue = typeof value === "number" ? value : parseInt(String(value), 10);
    const isNumber = !isNaN(numericValue);
    const displayCount = useCountUp(isNumber ? numericValue : 0, 1.2, index * 0.1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
            whileHover={{ y: -3, boxShadow: "0 16px 32px rgba(0,0,0,0.1)" }}
            className="stat-card"
            style={{ position: "relative", overflow: "hidden" }}
        >
            {/* Corner decoration */}
            <div style={{
                position: "absolute", top: 0, right: 0,
                width: 80, height: 80, borderRadius: "0 18px 0 100%",
                background: `${color}0a`,
                pointerEvents: "none",
            }} />

            {/* Icon */}
            <div className="stat-icon" style={{ background: bg, color }}>
                {icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                    {title}
                </div>
                <div style={{ fontSize: 30, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {isNumber ? displayCount.toLocaleString("en-IN") : value}
                </div>
            </div>

            {/* Left accent bar */}
            <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, borderRadius: "0 3px 3px 0", background: color, opacity: 0.6 }} />
        </motion.div>
    );
}
