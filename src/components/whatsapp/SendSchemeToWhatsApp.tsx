"use client";

import { useState } from "react";
import { MessageSquare, Send, CheckCircle2, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface SendSchemeToWhatsAppProps {
    schemeTitle?: string;
    schemeBenefit?: string;
    applyLink?: string;
    allEligibleSchemes?: Array<{ title: string; reason?: string; id: string }>;
    userPhone?: string;
    buttonLabel?: string;
    variant?: "compact" | "banner" | "icon";
}

export default function SendSchemeToWhatsApp({
    schemeTitle,
    schemeBenefit,
    applyLink,
    allEligibleSchemes,
    userPhone = "",
    buttonLabel = "Send to WhatsApp",
    variant = "compact",
}: SendSchemeToWhatsAppProps) {
    const [loading, setLoading] = useState(false);

    const handleSend = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);

        try {
            // 1. Fetch user phone if not provided
            let phone = userPhone;
            if (!phone) {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    phone = data.user?.phone || "";
                }
            }

            // Clean phone number (strip spaces, dashes)
            let cleanPhone = phone.replace(/\D/g, "");
            if (cleanPhone.length === 10) {
                cleanPhone = "91" + cleanPhone; // Add India country code if 10 digits
            }

            // 2. Format Message
            let messageText = "";

            if (allEligibleSchemes && allEligibleSchemes.length > 0) {
                // Bulk Eligibility Report Package
                messageText = `🇮🇳 *SMART BENEFICIARY MAPPING SYSTEM (SBMS)*\n`;
                messageText += `━━━━━━━━━━━━━━━━━━━━\n`;
                messageText += `📋 *Your Verified Welfare Schemes Report*\n\n`;
                messageText += `Based on your profile and uploaded Document Vault certificates, you are eligible for *${allEligibleSchemes.length} Government Schemes*:\n\n`;

                allEligibleSchemes.slice(0, 5).forEach((s, idx) => {
                    messageText += `*${idx + 1}. ${s.title}*\n`;
                    if (s.reason) messageText += `   • Status: ${s.reason}\n`;
                    messageText += `   • View: http://localhost:3001/schemes/${s.id}\n\n`;
                });

                if (allEligibleSchemes.length > 5) {
                    messageText += `_...and ${allEligibleSchemes.length - 5} more schemes verified on your portal._\n\n`;
                }

                messageText += `━━━━━━━━━━━━━━━━━━━━\n`;
                messageText += `🔗 *Access Full Dashboard:* http://localhost:3001/eligibility\n`;
                messageText += `_Government of India Welfare Mapping Initiative_`;
            } else if (schemeTitle) {
                // Single Scheme Alert
                messageText = `🇮🇳 *GOVERNMENT SCHEME ALERT | SBMS*\n`;
                messageText += `━━━━━━━━━━━━━━━━━━━━\n`;
                messageText += `📌 *Scheme:* ${schemeTitle}\n\n`;
                if (schemeBenefit) {
                    messageText += `💰 *Benefits & Aid:* ${schemeBenefit}\n\n`;
                }
                messageText += `📄 *Status:* Verified based on your Document Vault.\n`;
                if (applyLink) {
                    messageText += `🔗 *Direct Official Portal:* ${applyLink}\n`;
                }
                messageText += `━━━━━━━━━━━━━━━━━━━━\n`;
                messageText += `_Sent via Smart Beneficiary Mapping System_`;
            }

            const encodedMessage = encodeURIComponent(messageText);

            // Construct WhatsApp URL
            let whatsappUrl = "";
            if (cleanPhone && cleanPhone.length >= 10) {
                whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
            } else {
                // If no phone registered, open WhatsApp share dialog
                whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
            }

            // Open WhatsApp in new tab / mobile app
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");
            toast.success("Opening WhatsApp with your scheme details!", { id: "wa-toast" });
        } catch (err) {
            console.error("WhatsApp Send Error", err);
            toast.error("Failed to generate WhatsApp notification.");
        } finally {
            setLoading(false);
        }
    };

    if (variant === "banner") {
        return (
            <button
                type="button"
                onClick={handleSend}
                disabled={loading}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #128c7e 0%, #25d366 100%)",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(37, 211, 102, 0.35)",
                    transition: "transform 0.15s ease",
                }}
                className="hover:scale-105"
                title="Send full eligibility report to your registered phone on WhatsApp"
            >
                <MessageSquare size={16} />
                <span>{buttonLabel}</span>
            </button>
        );
    }

    if (variant === "icon") {
        return (
            <button
                type="button"
                onClick={handleSend}
                disabled={loading}
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: "#dcfce7",
                    color: "#15803d",
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                }}
                className="hover:bg-green-200"
                title="Send to WhatsApp"
            >
                <MessageSquare size={14} />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 6,
                background: "#dcfce7",
                color: "#15803d",
                border: "1px solid #bbf7d0",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
            }}
            className="hover:bg-green-200"
            title="Send this scheme to your phone via WhatsApp"
        >
            <MessageSquare size={13} />
            <span>{buttonLabel}</span>
        </button>
    );
}
