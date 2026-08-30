"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

/* ─── Hero: Light Government Parallax Section ─── */
export function AnimatedHeroSection({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <motion.section
            ref={ref}
            style={{
                padding: "60px 24px 70px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(180deg, #ffffff 0%, #f0f6ff 100%)",
                borderBottom: "1px solid #e2e8f0"
            }}
        >
            {/* Soft decorative background glow */}
            <motion.div style={{ y, position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
                <div
                    style={{
                        position: "absolute",
                        top: "-20%",
                        left: "15%",
                        width: "70%",
                        height: "80%",
                        background: "radial-gradient(ellipse, rgba(15, 46, 90, 0.05) 0%, transparent 70%)",
                        filter: "blur(60px)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "10%",
                        right: "5%",
                        width: "30%",
                        height: "50%",
                        background: "radial-gradient(ellipse, rgba(255, 153, 51, 0.06) 0%, transparent 60%)",
                        filter: "blur(50px)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "0%",
                        left: "5%",
                        width: "35%",
                        height: "50%",
                        background: "radial-gradient(ellipse, rgba(19, 136, 8, 0.05) 0%, transparent 60%)",
                        filter: "blur(50px)",
                    }}
                />
            </motion.div>

            {/* Page-entry stagger */}
            <motion.div
                style={{ position: "relative", zIndex: 1, opacity, maxWidth: 1100, margin: "0 auto" }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                {children}
            </motion.div>
        </motion.section>
    );
}

/* ─── Feature Cards: Crisp White Card with Government Border ─── */
export function AnimatedFeatureCard({ children, index }: { children: React.ReactNode; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.1, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(15, 46, 90, 0.08)", borderColor: "#93c5fd" }}
            style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 24,
                boxShadow: "0 2px 6px rgba(0, 33, 71, 0.04)",
                cursor: "default",
                transition: "all 0.2s ease",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {children}
        </motion.div>
    );
}

/* ─── Section wrapper: fade in from below on scroll ─── */
export function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

/* ─── Stat number: count-up animation on scroll  ─── */
export function AnimatedStat({ value, label }: { value: string; label: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ textAlign: "center" }}
        >
            <div
                style={{ fontSize: 36, fontWeight: 800, color: "#0f2e5a", lineHeight: 1.1, letterSpacing: "-0.03em" }}
            >
                {value}
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, fontWeight: 600 }}>{label}</div>
        </motion.div>
    );
}

/* ─── CTA Button: Official Button ─── */
export function AnimatedCTAButton({ children, href }: { children: React.ReactNode; href: string }) {
    return (
        <motion.a
            href={href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(15, 46, 90, 0.25)" }}
            whileTap={{ scale: 0.98 }}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#0f2e5a",
                color: "white",
                fontWeight: 700,
                fontSize: 15,
                padding: "12px 28px",
                borderRadius: 8,
                textDecoration: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(15, 46, 90, 0.15)",
                fontFamily: "Sora, sans-serif",
            }}
        >
            {children}
        </motion.a>
    );
}
