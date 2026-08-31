"use client";

import { Eye, Download, FileText, Image as ImageIcon, X } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface DocumentItem {
    id?: string;
    name?: string;
    type?: string;
    fileUrl?: string;
    fileSize?: number | null;
    expiresAt?: string | null;
    createdAt?: string;
}

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    document?: DocumentItem | null;
}

export default function DocumentPreviewModal({
    isOpen,
    onClose,
    fileUrl,
    fileName,
    fileType,
    document: docItem,
}: DocumentPreviewModalProps) {
    const safeUrl = fileUrl || docItem?.fileUrl || "";
    const safeName = fileName || docItem?.name || "Document";
    const safeType = fileType || docItem?.type || "";

    // Safely detect if it's a PDF or image based on data URL or type
    const isPDF =
        safeType === "application/pdf" ||
        safeUrl.startsWith("data:application/pdf") ||
        safeUrl.toLowerCase().endsWith(".pdf");

    const isImage =
        safeType.startsWith("image/") ||
        safeUrl.startsWith("data:image/") ||
        Boolean(safeUrl.match(/\.(jpeg|jpg|png|webp|gif|svg)/i));

    const handleDownload = () => {
        if (!safeUrl) return;
        const link = document.createElement("a");
        link.href = safeUrl;
        link.download = safeName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Eye size={18} />
                    <span>Preview: {safeName}</span>
                </div>
            }
            maxWidth={800}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Preview Area */}
                <div
                    style={{
                        background: "#f9fafb",
                        borderRadius: 12,
                        minHeight: 400,
                        maxHeight: 500,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {isPDF ? (
                        <iframe
                            src={safeUrl}
                            style={{
                                width: "100%",
                                height: 450,
                                border: "none",
                                borderRadius: 8,
                            }}
                            title={safeName}
                        />
                    ) : isImage ? (
                        <img
                            src={safeUrl}
                            alt={safeName}
                            style={{
                                maxWidth: "100%",
                                maxHeight: 450,
                                objectFit: "contain",
                                borderRadius: 8,
                            }}
                        />
                    ) : (
                        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
                            <FileText size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                            <p>Preview not available for this file format</p>
                            <p style={{ fontSize: 12, marginTop: 8 }}>{safeType || "Document"}</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {isPDF ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <FileText size={14} /> PDF Document
                            </span>
                        ) : isImage ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <ImageIcon size={14} /> Image
                            </span>
                        ) : (
                            <span>File Document</span>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            onClick={handleDownload}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 16px",
                                background: "#002147",
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <Download size={14} />
                            Download
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 16px",
                                background: "#f3f4f6",
                                color: "#374151",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            <X size={14} />
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
