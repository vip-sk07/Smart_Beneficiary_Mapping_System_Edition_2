import { prisma } from "@/lib/prisma";
import { checkSchemeEligibility, getSchemeDocumentRequirements } from "@/lib/eligibility";

export interface ConversationResponse {
    replyText: string;
    quickButtons?: string[];
    actionType?: "INITIAL_ALERT" | "SCHEME_MENU" | "SCHEME_DETAIL" | "AI_CONVERSATION";
}

export async function processIncomingWhatsAppMessage(
    userMessage: string,
    userId?: string
): Promise<ConversationResponse> {
    const rawInput = userMessage.trim();
    const upperInput = rawInput.toUpperCase();

    // 1. Fetch user and their documents if userId is available
    let user: any = null;
    if (userId) {
        user = await prisma.user.findUnique({
            where: { id: userId },
            include: { documents: true }
        });
    }

    if (!user) {
        user = await prisma.user.findFirst({
            where: { role: "USER" },
            include: { documents: true }
        });
    }

    if (!user) {
        user = {
            id: "guest-user",
            name: "Citizen",
            state: "Tamil Nadu",
            gender: "MALE",
            dob: new Date("2002-05-15"),
            income: 120000,
            occupation: "Student",
            documents: []
        };
    }

    // 2. Fetch all active schemes for complete matching
    const schemes = await prisma.scheme.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: { category: true }
    });

    // Compute eligible schemes
    const fullyEligible: any[] = [];
    const docsPending: any[] = [];

    for (const s of schemes) {
        const res = checkSchemeEligibility(user, s);
        if (res.status === "eligible") {
            fullyEligible.push({
                ...s,
                matchReason: res.reason,
                missingDocs: res.missingDocs || [],
                status: res.status,
                matchScore: res.matchScore
            });
        } else if (res.status === "docs_pending") {
            docsPending.push({
                ...s,
                matchReason: res.reason,
                missingDocs: res.missingDocs || [],
                status: res.status,
                matchScore: res.matchScore
            });
        }
    }

    const combinedList = [...fullyEligible, ...docsPending];
    const topFive = (fullyEligible.length >= 5 ? fullyEligible : (combinedList.length > 0 ? combinedList : schemes)).slice(0, 5);

    // ─── STATE 1: INITIAL / GREETING ────────────────────────────
    if (upperInput === "HI" || upperInput === "START" || upperInput === "NAMASTE" || upperInput === "ALERT") {
        const userName = user?.name ? user.name.split(" ")[0] : "Citizen";
        const docCount = user?.documents?.length || 0;

        return {
            replyText: `🇮🇳 *SMART BENEFICIARY MAPPING SYSTEM (Govt of India)*\n━━━━━━━━━━━━━━━━━━━━\n🙏 *Namaste ${userName}!*\n\n✅ Your *Document Vault* has been analyzed (${docCount} certificate${docCount === 1 ? "" : "s"} verified).\n🎉 Based on your demographic profile & proofs, you qualify for *${fullyEligible.length > 0 ? fullyEligible.length : combinedList.length} Government Schemes* (${docsPending.length} with documents pending).\n\n💬 *Reply with SHOW to view your top matching schemes.*`,
            quickButtons: ["SHOW", "🔍 Search Scheme", "📞 Helpline"],
            actionType: "INITIAL_ALERT"
        };
    }

    // ─── STATE 2: STEP 2 - USER SAYS "SHOW" / "LIST" ───────────
    if (upperInput === "SHOW" || upperInput === "LIST" || upperInput === "SCHEMES" || upperInput.includes("SHOW MY SCHEMES") || upperInput.includes("MY SCHEMES") || upperInput.includes("SHOW SCHEMES")) {
        const totalCount = fullyEligible.length > 0 ? fullyEligible.length : combinedList.length;
        let menuText = `📋 *Your Top Eligible Welfare Schemes (Top 5 of ${totalCount}):*\n━━━━━━━━━━━━━━━━━━━━\n`;

        topFive.forEach((s, idx) => {
            const numberIcons = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
            const icon = numberIcons[idx] || `${idx + 1}.`;
            const shortBenefit = s.benefits ? s.benefits.slice(0, 65).replace(/\*\*/g, "").replace(/\n/g, " ") : "Direct Government Benefit";
            const isFullyReady = s.status === "eligible";
            const docBadge = isFullyReady ? "✅ _Ready to Apply_" : `⚠️ _${(s.missingDocs || []).length} Doc(s) Pending_`;
            menuText += `${icon} *${s.title}*\n   • Aid: ${shortBenefit}…\n   • Status: ${docBadge}\n\n`;
        });

        menuText += `━━━━━━━━━━━━━━━━━━━━\n📊 *Summary:* *${fullyEligible.length}* Verified Ready | *${docsPending.length}* Missing Documents\n🔗 *Full Portal:* https://smart-beneficiary-mapping-system.vercel.app/eligibility\n\n💬 *Reply with 1, 2, 3, 4, 5 or scheme name for full details & application link.*`;

        return {
            replyText: menuText,
            quickButtons: ["1", "2", "3", "4", "5"],
            actionType: "SCHEME_MENU"
        };
    }

    // ─── STATE 3: STEP 3 - USER ASKS FOR A NUMBER (1, 2, 3, 4, 5) ──
    const emojiNumberMap: Record<string, number> = { "1️⃣": 1, "2️⃣": 2, "3️⃣": 3, "4️⃣": 4, "5️⃣": 5, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 };
    let requestedIndex: number | undefined = emojiNumberMap[rawInput];
    if (!requestedIndex) {
        const numMatch = rawInput.match(/(?:scheme\s*|option\s*|#\s*)?(\d+)/i);
        if (numMatch) {
            requestedIndex = parseInt(numMatch[1], 10);
        }
    }

    if (requestedIndex && requestedIndex >= 1 && requestedIndex <= topFive.length) {
        const selectedScheme = topFive[requestedIndex - 1];
        return buildSchemeDetailResponse(selectedScheme, user);
    }

    // Check if user typed a specific scheme title keyword
    const matchedByTitle = topFive.find(s => s.title.toLowerCase().includes(rawInput.toLowerCase()));
    if (matchedByTitle) {
        return buildSchemeDetailResponse(matchedByTitle, user);
    }

    // ─── GENERAL KEYWORD / AI SEARCH FALLBACK ───────────────────
    const searchMatch = schemes.filter(s =>
        s.title.toLowerCase().includes(rawInput.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(rawInput.toLowerCase()))
    );

    if (searchMatch.length > 0) {
        const best = searchMatch[0];
        const link = best.applyLink || `https://smart-beneficiary-mapping-system.vercel.app/schemes/${best.id}`;
        return {
            replyText: `🔍 *Found matching scheme for "${rawInput}":*\n\n📌 *${best.title}*\n${best.description?.slice(0, 150)}…\n\n🔗 *Official Portal:* ${link}\n\n_Reply with *SHOW* to see all your pre-qualified schemes._`,
            quickButtons: ["SHOW", "1", "2"],
            actionType: "SCHEME_DETAIL"
        };
    }

    return {
        replyText: `🤖 *SBMS Assistant:* I received "${rawInput}".\n\n• Type *SHOW* to view your verified eligible schemes.\n• Type *1, 2, 3* to view details of a specific scheme.\n• Type any keyword (e.g. *Farmer*, *Scholarship*, *Women Loan*) to search across 4,725 government programs.`,
        quickButtons: ["SHOW", "1", "2"],
        actionType: "AI_CONVERSATION"
    };
}

function buildSchemeDetailResponse(scheme: any, user: any): ConversationResponse {
    const reqs = getSchemeDocumentRequirements(scheme).filter(r => r.needed);
    const userDocs = user?.documents || [];
    const checkDoc = (docKey: string) => userDocs.some((d: any) => d.type === docKey);

    let text = `🎓 *${scheme.title}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🏛️ *Category:* ${scheme.category?.name || "Central / State Welfare"}\n\n`;
    text += `💰 *Benefits & Financial Aid:*\n${scheme.benefits ? scheme.benefits.slice(0, 220).replace(/\*\*/g, "").replace(/\n+/g, " ") : "Direct DBT grant transferred to bank account."}\n\n`;

    if (reqs.length > 0) {
        text += `📄 *Required Documents & Vault Status:*\n`;
        reqs.forEach(r => {
            const has = checkDoc(r.key);
            text += `${has ? "✅" : "❌"} ${r.label}: ${has ? "Ready in Vault" : "Missing / Upload Required"}\n`;
        });
        text += `\n`;
    }

    const portalLink = scheme.applyLink || `https://smart-beneficiary-mapping-system.vercel.app/schemes/${scheme.id}`;
    text += `🔗 *Official Application Portal:*\n👉 ${portalLink}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💡 _Upload missing documents to your SBMS Document Vault (https://smart-beneficiary-mapping-system.vercel.app/documents) to complete zero-touch application!_`;

    return {
        replyText: text,
        quickButtons: ["SHOW", "Apply on Portal", "Back to Menu"],
        actionType: "SCHEME_DETAIL"
    };
}
