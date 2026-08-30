import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { embedText } from "@/lib/embeddings";
import { searchSimilarSchemes } from "@/lib/rag";
import { callOllama, OLLAMA_FINDER_MODEL } from "@/lib/ollama";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { query } = await req.json();
        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const { rateLimitAIFinder } = require("@/lib/rateLimit");
        const rateLimitResult = await rateLimitAIFinder(session.user.id);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "AI Finder limit reached. Please try again in an hour." },
                { status: 429 }
            );
        }

        // 1. Embed query
        const queryVector = await embedText(query);

        // 2. Search pgvector for top 8 passing schemes
        const topSchemes = await searchSimilarSchemes(queryVector, 8);

        if (topSchemes.length === 0) {
            return NextResponse.json({
                intent: "General Inquiry",
                confidence: 0,
                ai_summary: "I could not find any specific schemes matching your description.",
                keywords: [],
                topSchemes: []
            });
        }

        // 3. Prepare prompt
        const schemesList = topSchemes.map(s => 
            `ID: ${s.id} | Name: ${s.title} | Category: ${s.category}\nBenefits: ${s.benefits}\nEligibility: ${s.eligibility}`
        ).join("\n\n");

        const systemPrompt = `You are an expert AI scheme analyzer for the Indian Government's Smart Beneficiary Mapping System.
The user has described their situation in plain language.
I have retrieved a list of potentially matching schemes below.

Your job is to analyze their situation against these schemes and return a STRICT JSON object representing your findings.

JSON SCHEMA:
{
  "intent": "A short 3-5 word description of what the user needs (e.g. 'Farmer Crop Loan Support')",
  "confidence": <number between 0 and 100 representing how well the schemes match the query>,
  "ai_summary": "A single, clear sentence explaining why the returned schemes match their situation.",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "topSchemes": [
    {
      "id": "<scheme id exactly as provided>",
      "reason": "<One sentence explaining specifically why they should apply to this scheme based on their situation>",
      "matchScore": <number between 0 and 100>
    }
  ]
}

- Return ONLY the raw JSON. No markdown backticks, no explanatory text, just the JSON string starting with { and ending with }.
- The topSchemes array should only include the schemes that actually make sense for the user, up to a maximum of 5.

user situation: '${query}'

Available Schemes:
${schemesList}`;

        // 4. Send to local Ollama (qwen2.5-coder:7b is excellent at structured JSON)
        const content = await callOllama(
            [{ role: "user", content: systemPrompt }],
            OLLAMA_FINDER_MODEL,
            { format: "json", temperature: 0.1, num_predict: 1500 }
        );

        if (!content) {
            throw new Error("No response from Ollama");
        }

        let parsedResponse;
        try {
            // Strip any accidental markdown fences just in case
            const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            parsedResponse = JSON.parse(cleaned);
        } catch (e) {
            console.error("Failed to parse JSON from Ollama:", content);
            throw new Error("Invalid JSON response from AI");
        }

        // 5. Hydrate the returned schemes with full data for the UI
        const fullSchemes = parsedResponse.topSchemes.map((matchedScheme: any) => {
            const fullData = topSchemes.find(s => s.id === matchedScheme.id);
            if (!fullData) return null;
            return {
                ...fullData,
                matchReason: matchedScheme.reason,
                matchScore: matchedScheme.matchScore
            };
        }).filter(Boolean); // remove nulls 

        return NextResponse.json({
            ...parsedResponse,
            schemes: fullSchemes
        });

    } catch (err) {
        console.error("[POST /api/ai-finder]", err);
        return NextResponse.json({ error: "Failed to process AI Finder request" }, { status: 500 });
    }
}
