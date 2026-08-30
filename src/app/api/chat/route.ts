import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { embedText } from "@/lib/embeddings";
import { searchSimilarSchemes } from "@/lib/rag";
import { streamOllama, OLLAMA_CHAT_MODEL } from "@/lib/ollama";
import { rateLimitChat } from "@/lib/rateLimit";

const SYSTEM_PROMPT = `You are SBMS Assistant, the AI assistant for the Smart Beneficiary Mapping System (SBMS) — a platform that helps Indian citizens discover and apply for government welfare schemes.

Your role:
- Help citizens understand which government schemes they are eligible for.
- Explain scheme benefits, eligibility criteria, and application processes clearly.
- Be helpful, empathetic, and respectful.
- Always respond in simple, clear language.
- Use the provided scheme context to give accurate, specific answers.

CRITICAL INSTRUCTION FOR SCHEME CARDS:
If you want to recommend a specific scheme from the context provided below, you MUST use the exact following syntax on its own line to render an interactive rich UI card for the user:
[SCHEME_CARD: {scheme.id}]
For example: [SCHEME_CARD: cm1x2y3z...]
Do not make up scheme IDs. Only use the IDs provided in the context below.

CRITICAL INSTRUCTION FOR AUTOMATED BROWSER AGENT:
If the user explicitly asks you to apply for a scheme for them or fill out a form (e.g., "Apply for PM-Kisan for me" or "Fill out the application"), you MUST respond with the following syntax on its own line to launch the Playwright Browser Agent:
[AGENT_RUN: {Scheme Name}]
For example: [AGENT_RUN: PM-Kisan Samman Nidhi]

Guidelines:
- Never make up scheme details.
- Always mention the scheme name when referencing it.
- Encourage users to apply if they seem eligible.`;

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit check - 30 messages per hour per user
    const rateLimitResult = await rateLimitChat(session.user.id);
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: "Chat limit reached. Please try again in an hour." },
            { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfter || 3600) } }
        );
    }

    try {
        const { messages, language } = await req.json();
        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: "Messages are required" }, { status: 400 });
        }

        const latestMessage = messages[messages.length - 1].content;

        const userProfile = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, dob: true, gender: true, income: true, occupation: true, state: true }
        });

        // Calculate age
        let ageStr = "Unknown";
        if (userProfile?.dob) {
            const ageDiff = Date.now() - new Date(userProfile.dob).getTime();
            const ageDate = new Date(ageDiff);
            ageStr = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
        }

        let userInfo = `User Profile: Name: ${userProfile?.name || 'Unknown'}, Age: ${ageStr}, Gender: ${userProfile?.gender || 'Unknown'}, State: ${userProfile?.state || 'Unknown'}`;

        if (userProfile?.income && Number(userProfile.income) > 0) {
            userInfo += `, Annual Income: ₹${userProfile.income}`;
        }
        if (userProfile?.occupation) {
            userInfo += `, Occupation: ${userProfile.occupation}`;
        }

        const profileContext = `--- USER PROFILE CONTEXT ---
${userInfo}
Based on this user's profile, give personalized scheme recommendations.
`;

        // Step 1: Embed the user's latest message with local embeddings
        // We embed the latest message to find context, but the AI gets the full history
        const queryVector = await embedText(latestMessage);

        // Step 2: Search pgvector for top 5 similar schemes
        const topSchemes = await searchSimilarSchemes(queryVector, 5);

        // Step 3: Build RAG context string
        let ragContext = "No relevant government schemes found for this query.";
        if (topSchemes.length > 0) {
            ragContext =
                "--- RELEVANT GOVERNMENT SCHEMES (from knowledge base) ---\n" +
                topSchemes
                    .map(
                        (s, i) =>
                            `Scheme ID: ${s.id}\n` +
                            `Title: **${s.title}** (${s.category ?? "General"})\n` +
                            `Benefits: ${s.benefits}\n` +
                            `Eligibility: ${s.eligibility}\n` +
                            `Apply Link: ${s.applyLink ?? "Visit official portal"}`
                    )
                    .join("\n\n");
        }

        const languageMap: Record<string, string> = { "en": "English", "hi": "Hindi (हिंदी)", "mr": "Marathi (मराठी)" };
        const targetLanguage = languageMap[language || "en"] || "English";

        const dynamicSystemPrompt = `${SYSTEM_PROMPT}\n\nIMPORTANT: You MUST ONLY respond to the user in ${targetLanguage}. Do not use English unless the user requests it. Translate scheme details into ${targetLanguage}.\n\n${profileContext}\n\n${ragContext}`;

        // Step 4: Stream response from local Ollama (llama3)
        const ollamaMessages = [
            { role: "system" as const, content: dynamicSystemPrompt },
            ...messages.map((m: any) => ({
                role: m.role as "user" | "assistant",
                content: typeof m.content === "string" ? m.content : String(m.content || ""),
            })),
        ];

        const sourcesHeader = JSON.stringify(topSchemes.map((s) => ({
            id: s.id,
            title: s.title,
            category: s.category,
            benefits: s.benefits
        })));

        let fullText = "";

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of streamOllama(ollamaMessages, OLLAMA_CHAT_MODEL, 0.7)) {
                        fullText += chunk;
                        controller.enqueue(new TextEncoder().encode(chunk));
                    }
                    controller.close();

                    // Background save to DB after stream completes
                    prisma.chatMessage
                        .createMany({
                            data: [
                                { userId: session.user.id, role: "user", content: latestMessage },
                                { userId: session.user.id, role: "assistant", content: fullText },
                            ],
                        })
                        .catch((err: any) => console.error("[ChatMessage save]", err));
                } catch (err) {
                    controller.error(err);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
                "x-chat-sources": Buffer.from(sourcesHeader).toString("base64"),
            },
        });

    } catch (err) {
        console.error("[POST /api/chat]", err);
        return NextResponse.json(
            { error: "AI service error. Please try again." },
            { status: 500 }
        );
    }
}
