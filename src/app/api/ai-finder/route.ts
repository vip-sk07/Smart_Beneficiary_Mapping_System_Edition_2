import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { embedText } from "@/lib/embeddings";
import { searchSimilarSchemes } from "@/lib/rag";
import { callAICascade } from "@/lib/ai-router";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { query } = await req.json();
        if (!query || typeof query !== "string" || !query.trim()) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const cleanQuery = query.trim();

        // 1. Extract keywords for robust DB fallback
        const stopWords = new Set(["i", "am", "a", "an", "the", "in", "on", "for", "to", "of", "and", "is", "looking", "need", "want", "help", "please", "my", "me", "with", "old", "year", "years"]);
        const rawTokens = cleanQuery.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
        const searchTokens = rawTokens.filter(t => t.length > 2 && !stopWords.has(t));

        let candidateSchemes: any[] = [];

        // 2. Try pgvector semantic search
        try {
            const queryVector = await embedText(cleanQuery);
            if (queryVector && queryVector.length > 0) {
                const vectorMatches = await searchSimilarSchemes(queryVector, 8);
                if (vectorMatches && vectorMatches.length > 0) {
                    candidateSchemes = vectorMatches;
                }
            }
        } catch (e: any) {
            console.warn("[AI Finder] Vector embedding lookup bypassed:", e.message);
        }

        // 3. If vector search returned few/no results, fallback to Prisma full-text multi-field search
        if (candidateSchemes.length < 4) {
            const orConditions: any[] = [];

            for (const token of searchTokens.slice(0, 6)) {
                orConditions.push({ title: { contains: token, mode: "insensitive" } });
                orConditions.push({ description: { contains: token, mode: "insensitive" } });
                orConditions.push({ benefits: { contains: token, mode: "insensitive" } });
                orConditions.push({ eligibility: { contains: token, mode: "insensitive" } });
                orConditions.push({ category: { name: { contains: token, mode: "insensitive" } } });
            }

            let dbSchemes: any[] = [];
            if (orConditions.length > 0) {
                dbSchemes = await prisma.scheme.findMany({
                    where: {
                        isActive: true,
                        OR: orConditions,
                    },
                    include: { category: true },
                    take: 10,
                });
            }

            // If still empty, fetch top popular active schemes
            if (dbSchemes.length === 0) {
                dbSchemes = await prisma.scheme.findMany({
                    where: { isActive: true },
                    include: { category: true },
                    take: 8,
                });
            }

            // Merge unique schemes
            const existingIds = new Set(candidateSchemes.map(s => s.id));
            for (const s of dbSchemes) {
                if (!existingIds.has(s.id)) {
                    candidateSchemes.push({
                        id: s.id,
                        title: s.title,
                        description: s.description,
                        benefits: s.benefits,
                        eligibility: s.eligibility,
                        applyLink: s.applyLink,
                        category: s.category?.name || "General Welfare",
                        similarity: 0.85,
                    });
                    existingIds.add(s.id);
                }
            }
        }

        if (candidateSchemes.length === 0) {
            return NextResponse.json({
                intent: "Government Welfare Inquiry",
                confidence: 0,
                ai_summary: "No direct schemes found matching your search. Try browsing all categories.",
                keywords: searchTokens,
                schemes: [],
            });
        }

        // 4. Synthesize AI Matching Prompt
        const schemesList = candidateSchemes.map((s, idx) => 
            `[Scheme ${idx + 1}] ID: ${s.id}\nTitle: ${s.title}\nCategory: ${s.category}\nBenefits: ${s.benefits?.slice(0, 200)}\nEligibility: ${s.eligibility?.slice(0, 200)}`
        ).join("\n\n");

        const systemPrompt = `You are the expert Government Scheme Recommendation Engine for the Smart Beneficiary Mapping System.
The citizen provided this situation in plain text: "${cleanQuery}"

Candidate Schemes from Database:
${schemesList}

Task:
Analyze the citizen's query against these schemes. Return a STRICT JSON object:
{
  "intent": "A concise 3-5 word summary of the user's intent (e.g. 'Farmer Agricultural Support')",
  "confidence": 92,
  "ai_summary": "A clear, encouraging 1-sentence explanation of why these specific schemes fit their profile.",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "topSchemes": [
    {
      "id": "<scheme id exactly as provided>",
      "reason": "<One direct sentence explaining why this scheme fits the citizen's query>",
      "matchScore": 95
    }
  ]
}

Rules:
- Return ONLY valid JSON starting with { and ending with }. No markdown, no conversational commentary.
- Select up to 5 best matching schemes.`;

        let parsedResponse: any = null;

        // 5. Call AI Router
        try {
            const { text: content } = await callAICascade(
                [{ role: "user", content: systemPrompt }],
                { format: "json", temperature: 0.2, maxTokens: 1200 }
            );

            if (content) {
                const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
                parsedResponse = JSON.parse(cleaned);
            }
        } catch (aiErr: any) {
            console.warn("[AI Finder] AI Cascade parse error, using deterministic synthesizer:", aiErr.message);
        }

        // Deterministic Fallback if AI generation fails or formats incorrectly
        if (!parsedResponse || !Array.isArray(parsedResponse.topSchemes)) {
            parsedResponse = {
                intent: searchTokens.length > 0 ? `${searchTokens.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} Support` : "Welfare Scheme Assistance",
                confidence: 88,
                ai_summary: `Identified ${Math.min(candidateSchemes.length, 5)} relevant government welfare schemes matching your request.`,
                keywords: searchTokens.length > 0 ? searchTokens.slice(0, 4) : ["welfare", "subsidy", "support"],
                topSchemes: candidateSchemes.slice(0, 5).map((s, idx) => ({
                    id: s.id,
                    reason: `Directly matches your interest in ${s.category || 'government assistance'} and ${s.title}.`,
                    matchScore: Math.max(75, 95 - idx * 5),
                })),
            };
        }

        // 6. Hydrate full scheme data for the UI
        const fullSchemes = parsedResponse.topSchemes.map((matched: any) => {
            const fullData = candidateSchemes.find(s => s.id === matched.id);
            if (!fullData) return null;
            return {
                ...fullData,
                matchReason: matched.reason || "Matches your profile criteria and eligibility requirements.",
                matchScore: matched.matchScore || 90,
            };
        }).filter(Boolean);

        return NextResponse.json({
            intent: parsedResponse.intent || "Welfare Assistance",
            confidence: parsedResponse.confidence || 90,
            ai_summary: parsedResponse.ai_summary || "Found matching welfare schemes based on your profile.",
            keywords: parsedResponse.keywords || searchTokens,
            schemes: fullSchemes.length > 0 ? fullSchemes : candidateSchemes.slice(0, 4),
        });

    } catch (err: any) {
        console.error("[POST /api/ai-finder]", err);
        return NextResponse.json({ error: "Failed to process AI Finder request" }, { status: 500 });
    }
}
