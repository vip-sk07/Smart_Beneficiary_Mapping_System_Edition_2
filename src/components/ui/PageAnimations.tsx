"use client";
/**
 * PageAnimations — unique motion variants for each page.
 * Import the desired wrapper and use it at the top of each page.
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";

// ── Dashboard: items slide in from bottom with spring ──────────────
export function DashboardAnimate({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

// ── Schemes: swipe in from right (like flipping pages) ─────────────
export function SchemesAnimate({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
        >
            {children}
        </motion.div>
    );
}

// ── AI Finder: scale up with a soft glow feel ─────────────────────
export function AIFinderAnimate({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
            {children}
        </motion.div>
    );
}

// ── Eligibility: slide from left ───────────────────────────────────
export function EligibilityAnimate({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
        >
            {children}
        </motion.div>
    );
}

// ── Applications: staggered fade-in from below ─────────────────────
export function ApplicationsAnimate({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

// ── Profile: smooth cross-fade ─────────────────────────────────────
export function ProfileAnimate({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55 }}
        >
            {children}
        </motion.div>
    );
}

// ── Grievances: slide + blur in ────────────────────────────────────
export function GrievancesAnimate({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(6px)", y: 16 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

// ── Documents: flip-in from top ────────────────────────────────────
export function DocumentsAnimate({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, rotateX: 8, y: -12 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: 800 }}
        >
            {children}
        </motion.div>
    );
}

// ── Announcements: newspaper-style swipe down ─────────────────────
export function AnnouncementsAnimate({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        >
            {children}
        </motion.div>
    );
}

// ── Generic fallback ───────────────────────────────────────────────
export function PageAnimate({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {children}
        </motion.div>
    );
}
