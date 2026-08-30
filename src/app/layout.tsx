import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const sora = Sora({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    display: "swap",
    variable: "--font-sora",
});

export const metadata: Metadata = {
    title: {
        default: "Smart Beneficiary Mapping System",
        template: "%s | SBMS",
    },
    description:
        "Connect Indian citizens to government welfare schemes using AI. Find schemes you qualify for, apply online, track your applications, and get help from SBMS Assistant.",
    keywords: [
        "government schemes",
        "welfare",
        "India",
        "beneficiary",
        "AI assistant",
        "PM-KISAN",
        "Ayushman Bharat",
    ],
    authors: [{ name: "SBMS Team" }],
    robots: "index, follow",
    manifest: "/manifest.json",
};

export const viewport = {
    themeColor: "#1a38f5",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={sora.variable}>
            <body className={sora.className}>
                <Providers>
                    {/* ── Page navigation progress bar — shows on every route change ── */}
                    <NextTopLoader
                        color="#4338ca"
                        initialPosition={0.08}
                        crawlSpeed={200}
                        height={3}
                        crawl={true}
                        showSpinner={false}
                        easing="ease"
                        speed={200}
                        shadow="0 0 10px #4338ca, 0 0 6px #6366f1"
                        zIndex={9999}
                    />
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                fontFamily: "Sora, sans-serif",
                                fontSize: "14px",
                                borderRadius: "10px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                            },
                            success: {
                                iconTheme: { primary: "#138808", secondary: "white" },
                            },
                            error: {
                                iconTheme: { primary: "#dc2626", secondary: "white" },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}
