"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    maxWidth?: number;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 520 }: ModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape" && isOpen) onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            ref={backdropRef}
            className="modal-backdrop"
            onClick={(e) => {
                if (e.target === backdropRef.current) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="modal-box" style={{ maxWidth }}>
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 24px 16px",
                        borderBottom: "1px solid #f3f4f6",
                    }}
                >
                    <h2 id="modal-title" style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
                        {title}
                    </h2>
                    <button
                        id="modal-close-btn"
                        onClick={onClose}
                        aria-label="Close modal"
                        style={{
                            width: 32,
                            height: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f9fafb",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            color: "#6b7280",
                            transition: "background 0.15s",
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
                {/* Body */}
                <div style={{ padding: "20px 24px 24px" }}>{children}</div>
            </div>
        </div>
    );
}
