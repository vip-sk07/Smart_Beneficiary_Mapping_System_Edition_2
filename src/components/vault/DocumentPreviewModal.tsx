"use client";

import { Eye, Download, FileText, Image, X } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileName: string;
    fileType: string;
}

export default function DocumentPreviewModal({
    isOpen,
    onClose,
    fileUrl,
    fileName,
    fileType,
}: DocumentPreviewModalProps) {
    // Detect if it's a PDF or image based on data URL or type
    const isPDF = fileType === "application/pdf" || fileUrl.startsWith("data:application/pdf");
    const isImage = fileType.startsWith("image/") || fileUrl.startsWith("data:image/");

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName;
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
                    <span>Preview: {fileName}</span>
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
                            src={fileUrl}
                            style={{
                                width: "100%",
                                height: 450,
                                border: "none",
                                borderRadius: 8,
                            }}
                            title={fileName}
                        />
                    ) : isImage ? (
                        <img
                            src={fileUrl}
                            alt={fileName}
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
                            <p>Preview not available for this file type</p>
                            <p style={{ fontSize: 12, marginTop: 8 }}>{fileType || "Unknown type"}</p>
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
                                <Image size={14} /> Image
                            </span>
                        ) : (
                            <span>Unsupported format</span>
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
                                background: "#4338ca",
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
