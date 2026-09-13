"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    children: React.ReactNode;
    maxWidth?: number;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 520 }: ModalProps) {
    const [mounted, setMounted] = useState(false);
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
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
            <div
                className="modal-box"
                style={{
                    maxWidth,
                    maxHeight: "88vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "18px 24px 16px",
                        borderBottom: "1px solid #f1f5f9",
                        flexShrink: 0,
                    }}
                >
                    <h2 id="modal-title" style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>
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
                            background: "#f1f5f9",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            color: "#64748b",
                            transition: "background 0.15s",
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
                {/* Body */}
                <div style={{ padding: "20px 24px 24px", overflowY: "auto", flexGrow: 1 }}>{children}</div>
            </div>
        </div>,
        document.body
    );
}
