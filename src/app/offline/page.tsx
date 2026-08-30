"use client";

import { WifiOff, Shield } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-20 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <WifiOff size={32} />
            </div>
            
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                You are offline
            </h1>
            
            <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                It looks like you've lost your internet connection. 
                Don't worry, your progress is saved safely.
                Please check your connection and try again.
            </p>
            
            <button 
                onClick={() => window.location.reload()} 
                className="btn-primary mb-6"
            >
                Try Again
            </button>

            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                <Shield size={16} /> Return to Home
            </Link>
        </div>
    );
}
