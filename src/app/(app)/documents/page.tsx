"use client";

import { useEffect, useState, useRef } from "react";
import { FolderOpen, UploadCloud, Trash2, FileText, AlertTriangle, Image as ImageIcon, ScanText, Sparkles, Eye } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { DocumentsAnimate } from "@/components/ui/PageAnimations";
import DocumentPreviewModal from "@/components/vault/DocumentPreviewModal";
import QRCodeCertificateScanner from "@/components/vault/QRCodeCertificateScanner";

// Helper to get nice icons based on type
const getDocIcon = (type: string) => {
    switch (type) {
        case "photo": return <ImageIcon size={24} className="text-pink-500" />;
        case "aadhaar": return <FileText size={24} className="text-blue-500" />;
        case "income_cert": return <FileText size={24} className="text-green-500" />;
        default: return <FileText size={24} className="text-gray-500" />;
    }
};

const getDocTypeName = (type: string) => {
    switch (type) {
        case "aadhaar": return "Aadhaar Card";
        case "income_cert": return "Income Certificate";
        case "photo": return "Passport Photo";
        case "domicile": return "Domicile Certificate";
        case "caste_cert": return "Caste Certificate";
        case "disability_cert": return "Disability Certificate";
        default: return "Other Document";
    }
};

interface Document {
    id: string;
    name: string;
    type: string;
    fileUrl: string;
    fileSize: number | null;
    expiresAt: string | null;
    createdAt: string;
}

export default function DocumentVaultPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // OCR Extract states
    const [extractingId, setExtractingId] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<any | null>(null);
    const [parseModalOpen, setParseModalOpen] = useState(false);

    // Preview modal states
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

    // Form states
    const [docType, setDocType] = useState("aadhaar");
    const [docName, setDocName] = useState("");
    const [docExpiresAt, setDocExpiresAt] = useState("");
    const [fileBase64, setFileBase64] = useState<string | null>(null);
    const [fileSizeStr, setFileSizeStr] = useState("");
    const [rawFileSize, setRawFileSize] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = async () => {
        try {
            const res = await fetch("/api/documents");
            if (res.ok) {
                const data = await res.json();
                if (data.documents) {
                    setDocuments(data.documents);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size must be under 2MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setFileBase64(event.target?.result as string);
            setFileSizeStr((file.size / 1024).toFixed(0) + " KB");
            setRawFileSize(file.size);
            if (!docName) {
                setDocName(file.name.split('.')[0]); // Default name to filename without extension
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!fileBase64 || !docType || !docName) {
            toast.error("Please fill all required fields and select a file");
            return;
        }

        setUploading(true);
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: docType,
                    name: docName,
                    fileUrl: fileBase64,
                    fileSize: rawFileSize,
                    expiresAt: docExpiresAt || null
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Document uploaded successfully");
                setUploadModalOpen(false);
                resetForm();
                fetchDocuments();
            } else {
                toast.error(data.error || "Failed to upload document");
            }
        } catch (err) {
            toast.error("Network error while uploading");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete '${name}'?`)) return;

        try {
            const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Document deleted");
                setDocuments(docs => docs.filter(d => d.id !== id));
            } else {
                toast.error("Failed to delete document");
            }
        } catch (err) {
            toast.error("Error deleting document");
        }
    };

    const handleExtract = async (id: string) => {
        setExtractingId(id);
        const loadingToast = toast.loading("AI is analyzing document...");
        try {
            const res = await fetch(`/api/documents/${id}/parse`, { method: "POST" });
            const data = await res.json();
            toast.dismiss(loadingToast);

            if (res.ok && data.extractedData) {
                setExtractedData(data.extractedData);
                setParseModalOpen(true);
            } else {
                toast.error(data.error || "Failed to extract data. Ensure it is a clear image.");
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Network error analyzing document");
        } finally {
            setExtractingId(null);
        }
    };

    const handleUpdateProfileWithExtracted = async () => {
        if (!extractedData) return;
        try {
            const loadingToast = toast.loading("Updating profile...");
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(extractedData),
            });
            toast.dismiss(loadingToast);
            if (res.ok) {
                toast.success("Profile fully updated with extracted document data!");
                setParseModalOpen(false);
                setExtractedData(null);
            } else {
                toast.error("Failed to update profile");
            }
        } catch (err) {
            toast.error("Network error updating profile");
        }
    };

    const resetForm = () => {
        setDocType("aadhaar");
        setDocName("");
        setDocExpiresAt("");
        setFileBase64(null);
        setFileSizeStr("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Helper to check expiry
    const isExpiringSoon = (dateString: string | null) => {
        if (!dateString) return false;
        const expiryDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(expiryDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && expiryDate.getTime() > today.getTime();
    };

    const isExpired = (dateString: string | null) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20 animate-pulse">
                <FolderOpen className="w-10 h-10 text-blue-300 mr-3" />
                <span className="text-gray-500 font-medium">Opening Vault...</span>
            </div>
        );
    }

    return (
        <DocumentsAnimate>
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FolderOpen className="w-8 h-8 text-blue-600" />
                            Document Vault
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm md:text-base">
                            Store your documents securely — upload once, use everywhere.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={() => { resetForm(); setUploadModalOpen(true); }}
                            className="btn-primary flex items-center gap-2 whitespace-nowrap"
                            disabled={documents.length >= 10}
                        >
                            <UploadCloud size={18} /> Upload Document
                        </button>
                        <span className="text-xs font-medium text-gray-500">
                            {documents.length}/10 documents uploaded
                        </span>
                    </div>
                </div>

                {/* Cryptographic QR Code Certificate Scanner */}
                <QRCodeCertificateScanner
                    onVerifiedData={(verified) => {
                        setDocType(verified.type);
                        setDocName(`${getDocTypeName(verified.type)} (QR Verified)`);
                        setUploadModalOpen(true);
                    }}
                />

                {documents.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UploadCloud size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Your vault is empty</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            Upload commonly used documents like Aadhaar or Income Certificate to quickly attach them to scheme applications later.
                        </p>
                        <button onClick={() => setUploadModalOpen(true)} className="btn-primary mx-auto">
                            <UploadCloud size={16} className="mr-2" /> Upload First Document
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {documents.map(doc => {
                            const expired = isExpired(doc.expiresAt);
                            const expiringSoon = isExpiringSoon(doc.expiresAt);

                            return (
                                <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col relative group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-3 bg-gray-50 rounded-lg shrink-0">
                                            {getDocIcon(doc.type)}
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    setPreviewDoc(doc);
                                                    setPreviewModalOpen(true);
                                                }}
                                                className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50"
                                                title="Preview document"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleExtract(doc.id)}
                                                disabled={extractingId === doc.id}
                                                className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50 disabled:opacity-50"
                                                title="Auto-Extract Data with AI"
                                            >
                                                <ScanText size={16} className={extractingId === doc.id ? "animate-pulse" : ""} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id, doc.name)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                                title="Delete document"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 truncate mb-1" title={doc.name}>{doc.name}</h3>
                                    <div className="text-xs text-blue-600 font-medium bg-blue-50 inline-block px-2 py-1 rounded w-fit mb-3">
                                        {getDocTypeName(doc.type)}
                                    </div>

                                    <div className="mt-auto space-y-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                                        <div className="flex justify-between">
                                            <span>Uploaded:</span>
                                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {doc.expiresAt && (
                                            <div className={`flex justify-between font-medium ${expired ? 'text-red-600' : expiringSoon ? 'text-orange-500' : 'text-gray-500'}`}>
                                                <span className="flex items-center gap-1">
                                                    {expired || expiringSoon ? <AlertTriangle size={12} /> : null}
                                                    Expires:
                                                </span>
                                                <span>{new Date(doc.expiresAt).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <Modal
                    isOpen={uploadModalOpen}
                    onClose={() => !uploading && setUploadModalOpen(false)}
                    title="Upload Document"
                >
                    <div className="space-y-4 mt-2">
                        <div className="input-group">
                            <label className="label">Document Type</label>
                            <select className="input" value={docType} onChange={e => setDocType(e.target.value)} disabled={uploading}>
                                <option value="aadhaar">Aadhaar Card</option>
                                <option value="income_cert">Income Certificate</option>
                                <option value="photo">Passport Photo</option>
                                <option value="domicile">Domicile Certificate</option>
                                <option value="caste_cert">Caste Certificate</option>
                                <option value="disability_cert">Disability Certificate</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="label">Custom Name</label>
                            <input className="input" value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g., My Aadhaar Card" disabled={uploading} />
                        </div>

                        <div className="input-group">
                            <label className="label">File (Max 2MB)</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="input p-2"
                                accept="image/*,application/pdf"
                                onChange={handleFileSelect}
                                disabled={uploading}
                            />
                            {fileSizeStr && <p className="text-xs text-gray-500 mt-1">Size: {fileSizeStr}</p>}
                        </div>

                        <div className="input-group">
                            <label className="label">Expiry Date (Optional)</label>
                            <input type="date" className="input" value={docExpiresAt} onChange={e => setDocExpiresAt(e.target.value)} disabled={uploading} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button className="btn-secondary" onClick={() => setUploadModalOpen(false)} disabled={uploading}>Cancel</button>
                            <button className="btn-primary" onClick={handleUpload} disabled={uploading || !fileBase64}>
                                {uploading ? "Uploading..." : "Save to Vault"}
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* AI Extraction Modal */}
                <Modal
                    isOpen={parseModalOpen}
                    onClose={() => setParseModalOpen(false)}
                    title={
                        <div className="flex items-center gap-2 text-blue-600">
                            <Sparkles size={20} /> AI Extraction Results
                        </div>
                    }
                >
                    <div className="space-y-4 mt-2">
                        <p className="text-sm text-gray-600">
                            Our Vision AI analyzed your document and safely identified the following verified details:
                        </p>

                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-2 relative">
                            {extractedData && Object.entries(extractedData).map(([key, val]) => (
                                val && (
                                    <div key={key} className="flex justify-between items-center text-sm border-b border-blue-100/50 pb-2 last:border-0 last:pb-0">
                                        <span className="font-semibold text-gray-700 capitalize">{key}:</span>
                                        <span className="text-gray-900 font-mono bg-white px-2 py-0.5 rounded shadow-sm">
                                            {String(val)}
                                        </span>
                                    </div>
                                )
                            ))}
                        </div>

                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs leading-5">
                            <AlertTriangle size={14} className="inline mr-1 mb-0.5" />
                            Would you like to automatically sync these extracted values into your SBMS Personal Profile?
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button className="btn-secondary text-sm" onClick={() => setParseModalOpen(false)}>Discard</button>
                            <button className="btn-primary text-sm flex items-center gap-2" onClick={handleUpdateProfileWithExtracted}>
                                <UploadCloud size={16} /> Update My Profile
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                isOpen={previewModalOpen}
                onClose={() => {
                    setPreviewModalOpen(false);
                    setPreviewDoc(null);
                }}
                fileUrl={previewDoc?.fileUrl || ""}
                fileName={previewDoc?.name || ""}
                fileType={previewDoc?.type || ""}
            />
        </DocumentsAnimate>
    );
}
