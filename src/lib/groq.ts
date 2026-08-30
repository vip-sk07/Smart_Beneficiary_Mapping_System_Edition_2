import Groq from "groq-sdk";
import { callOllama } from "./ollama";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PRIMARY_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

const SYSTEM_PROMPT = `You are SBMS Assistant, the AI assistant for the Smart Beneficiary Mapping System (SBMS) — a platform that helps Indian citizens discover and apply for government welfare schemes.

Your role:
- Help citizens understand which government schemes they are eligible for
- Explain scheme benefits, eligibility criteria, and application processes clearly
- Be helpful, empathetic, and respectful — many users may be from rural areas or have limited literacy
- Always respond in simple, clear English (or match the user's language if possible)
- Use the provided scheme context to give accurate, specific answers
- If no relevant scheme is found in the context, acknowledge it and suggest the user browse all schemes

Guidelines:
- Never make up scheme details — only use information from the context provided
- Always mention the scheme name when referencing it
- Keep responses concise but complete
- Encourage users to apply if they seem eligible`;

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

/**
 * Get a chat response from Groq with RAG context injected as a string.
 * Automatically falls back to a smaller model on rate limit errors.
 */
export async function getChatResponse(
    userMessage: string,
    ragContext: string,
    history: ChatMessage[],
    language: string = "en",
    userProfile?: any
): Promise<string> {
    const contextBlock =
        ragContext.trim().length > 0
            ? ragContext
            : "No relevant government schemes found for this query.";

    const languageMap: Record<string, string> = {
        "en": "English",
        "hi": "Hindi (हिंदी)",
        "mr": "Marathi (मराठी)"
    };
    const targetLanguage = languageMap[language] || "English";

    let userInfoSection = "";
    if (userProfile) {
        let ageStr = "Unknown";
        if (userProfile.dob) {
            const ageDiff = Date.now() - new Date(userProfile.dob).getTime();
            const ageDate = new Date(ageDiff);
            ageStr = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
        }
        
        let userInfoParts = [
            `Name: ${userProfile.name || 'Unknown'}`,
            `Age: ${ageStr}`,
            `Gender: ${userProfile.gender || 'Unknown'}`,
            `State: ${userProfile.state || 'Unknown'}`
        ];
        
        if (userProfile.income && Number(userProfile.income) > 0) {
            userInfoParts.push(`Annual Income: ₹${userProfile.income}`);
        }
        if (userProfile.occupation) {
            userInfoParts.push(`Occupation: ${userProfile.occupation}`);
        }
        
        userInfoSection = `\n--- USER PROFILE ---\n${userInfoParts.join(", ")}\nBased on this user's profile, give personalized scheme recommendations.\n`;
    }

    const systemMessage = `${SYSTEM_PROMPT}

IMPORTANT: You MUST ONLY respond to the user in ${targetLanguage}. Do not use English unless the user explicitly asks for it or the target language is English. Make sure all scheme details are translated into ${targetLanguage}.
${userInfoSection}
--- RELEVANT GOVERNMENT SCHEMES (from knowledge base) ---
${contextBlock}
--- END OF CONTEXT ---`;

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
        ...history.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        })),
        { role: "user", content: userMessage },
    ];

    async function callGroq(model: string): Promise<string> {
        if (!process.env.GROQ_API_KEY) {
            console.log("ℹ️ GROQ_API_KEY not set. Falling back to local open-source Ollama...");
            return callOllama([
                { role: "system", content: systemMessage },
                ...messages.map((m) => ({
                    role: m.role as "user" | "assistant",
                    content: typeof m.content === "string" ? m.content : String(m.content || "")
                })),
            ]);
        }

        const res = await groq.chat.completions.create({
            model,
            messages: [{ role: "system", content: systemMessage }, ...messages],
            temperature: 0.7,
            max_tokens: 1024,
        });
        return (
            res.choices[0]?.message?.content ??
            "I'm sorry, I couldn't generate a response. Please try again."
        );
    }

    try {
        return await callGroq(PRIMARY_MODEL);
    } catch (err: unknown) {
        const isRateLimit =
            err instanceof Error &&
            (err.message.includes("rate_limit") || err.message.includes("429"));

        if (isRateLimit) {
            console.warn(
                `[groq] Rate limit on ${PRIMARY_MODEL}, falling back to ${FALLBACK_MODEL}`
            );
            return await callGroq(FALLBACK_MODEL);
        }
        
        console.warn("⚠️ Groq API failed. Falling back to local open-source Ollama:", (err as Error).message);
        return callOllama([
            { role: "system", content: systemMessage },
            ...messages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: typeof m.content === "string" ? m.content : String(m.content || "")
            })),
        ]);
    }
}
