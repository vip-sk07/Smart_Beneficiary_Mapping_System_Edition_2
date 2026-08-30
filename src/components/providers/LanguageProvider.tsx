"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "hi" | "mr";

interface Translations {
    [key: string]: {
        en: string;
        hi: string;
        mr: string;
    };
}

const translations: Translations = {
    "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड", mr: "डॅशबोर्ड" },
    "nav.schemes": { en: "Browse Schemes", hi: "योजनाएं खोजें", mr: "योजना शोधा" },
    "nav.eligibility": { en: "My Eligibility", hi: "मेरी पात्रता", mr: "माझी पात्रता" },
    "nav.applications": { en: "My Applications", hi: "मेरे आवेदन", mr: "माझे अर्ज" },
    "nav.documents": { en: "Document Vault", hi: "दस्तावेज़ वॉल्ट", mr: "दस्तऐवज वॉल्ट" },
    "nav.grievances": { en: "My Grievances", hi: "मेरी शिकायतें", mr: "माझ्या तक्रारी" },
    "nav.chat": { en: "AI Assistant", hi: "एआई सहायक", mr: "एआय सहाय्यक" },
    "nav.announcements": { en: "Announcements", hi: "घोषणाएं", mr: "घोषणा" },
    "nav.profile": { en: "Edit Profile", hi: "प्रोफ़ाइल संपादित करें", mr: "प्रोफाइल संपादित करा" },
    
    // Quick add for chatbot
    "chat.placeholder": { en: "Ask SBMS Assistant about government schemes...", hi: "SBMS असिस्टेंट से सरकारी योजनाओं के बारे में पूछें...", mr: "SBMS असिस्टंटला सरकारी योजनांबद्दल विचारा..." },
    "chat.listening": { en: "Listening...", hi: "सुन रहा हूँ...", mr: "ऐकत आहे..." },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    const t = (key: string, fallback?: string): string => {
        const entry = translations[key];
        if (entry) return entry[language];
        return fallback || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
