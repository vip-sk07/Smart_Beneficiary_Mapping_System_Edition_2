import { GoogleGenerativeAI } from "@google/generative-ai";
import { getLocalEmbedding } from "./local-embeddings";

/**
 * Embed a text string using Google gemini-embedding-001 or open-source local embeddings.
 * Automatically falls back to local @xenova/transformers if GEMINI_API_KEY is not set.
 */
export async function embedText(text: string): Promise<number[]> {
    if (!process.env.GEMINI_API_KEY) {
        console.log("ℹ️ GEMINI_API_KEY not set. Using free local @xenova/transformers embeddings...");
        return getLocalEmbedding(text);
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (e: any) {
        console.warn("⚠️ Gemini API embedding failed. Falling back to local open-source embeddings:", e.message);
        return getLocalEmbedding(text);
    }
}

/**
 * Build a combined text string from a scheme for embedding.
 */
export function buildSchemeEmbeddingText(scheme: {
    title: string;
    description: string;
    benefits: string;
    eligibility: string;
}): string {
    return [
        `Scheme: ${scheme.title}`,
        `Description: ${scheme.description}`,
        `Benefits: ${scheme.benefits}`,
        `Eligibility: ${scheme.eligibility}`,
    ].join("\n");
}
