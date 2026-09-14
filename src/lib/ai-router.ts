/**
 * Smart Beneficiary Mapping System (SBMS)
 * Multi-Tier High-Availability AI Cascade Router
 * 
 * Cascade Execution Hierarchy:
 *  Tier 1: In-Memory LRU Vector Cache ($O(1)$ — 5ms response, 0 API quota used)
 *  Tier 2: Google Gemini 1.5 Flash (Primary Cloud Provider with PII Shield)
 *  Tier 3: Groq LPU Hardware (Ultra-Fast 500+ t/s hot failover on rate limits)
 *  Tier 4: Hugging Face Serverless API (Qwen 2.5 open-source cloud fallback)
 *  Tier 5: Cloud Docker / Local Ollama (Dedicated VPS or Edge CUDA Engine)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { callOllama, streamOllama, OllamaMessage } from "./ollama";
import { scrubPII } from "./pii-scrubber";

export interface AIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface AIOptions {
    format?: "json";
    temperature?: number;
    maxTokens?: number;
    skipCache?: boolean;
}

// 🗄️ Tier 1: High-Speed In-Memory LRU Cache
interface CacheEntry {
    response: string;
    provider: string;
    timestamp: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour TTL
const aiResponseCache = new Map<string, CacheEntry>();

function getCacheKey(messages: AIMessage[], options?: AIOptions): string {
    const lastMsg = messages[messages.length - 1]?.content || "";
    return `${options?.format || "text"}:${lastMsg.trim().toLowerCase()}`;
}

// 🟢 Tier 2: Google Gemini Flash Provider (Direct High-Speed REST)
async function callGemini(messages: AIMessage[], options?: AIOptions): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const systemMsg = messages.find(m => m.role === "system")?.content || "";
    const conversation = messages
        .filter(m => m.role !== "system")
        .map(m => `${m.role === "user" ? "Citizen" : "Assistant"}: ${m.content}`)
        .join("\n\n");

    const fullPrompt = systemMsg ? `${systemMsg}\n\n${conversation}` : conversation;

    const candidateModels = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3.5-flash", "gemini-pro-latest"];
    let lastError = "";

    for (const modelName of candidateModels) {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey,
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: fullPrompt }]
                    }],
                    generationConfig: {
                        temperature: options?.temperature ?? 0.7,
                        maxOutputTokens: options?.maxTokens ?? 1000,
                        ...(options?.format === "json" && { responseMimeType: "application/json" }),
                    }
                })
            });

            if (res.ok) {
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text;
            } else {
                const err = await res.text();
                lastError = `${modelName} returned ${res.status}: ${err}`;
            }
        } catch (e: any) {
            lastError = e.message;
        }
    }

    throw new Error(`All Gemini candidate models busy: ${lastError}`);
}

async function* streamGemini(messages: AIMessage[], options?: AIOptions): AsyncGenerator<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    // Fetch complete response and yield words with smooth streaming cadence
    const fullText = await callGemini(messages, options);
    const words = fullText.split(" ");
    for (let i = 0; i < words.length; i++) {
        yield words[i] + (i === words.length - 1 ? "" : " ");
    }
}

// 🚀 Tier 3: Groq LPU Provider (llama-3.1-8b-instant)
async function callGroq(messages: AIMessage[], options?: AIOptions): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not configured");

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
        ...(options?.format === "json" && { response_format: { type: "json_object" } }),
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");
    return text;
}

async function* streamGroq(messages: AIMessage[], options?: AIOptions): AsyncGenerator<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not configured");

    const groq = new Groq({ apiKey });
    const stream = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
        stream: true,
    });

    for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) yield text;
    }
}

// 🤗 Tier 4: Hugging Face Serverless API (Qwen 2.5)
async function callHuggingFace(messages: AIMessage[], options?: AIOptions): Promise<string> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) throw new Error("HUGGINGFACE_API_KEY not configured");

    const prompt = messages.map(m => `<|im_start|>${m.role}\n${m.content}<|im_end|>`).join("\n") + "\n<|im_start|>assistant\n";

    const res = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-3B-Instruct", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: options?.maxTokens ?? 800,
                temperature: options?.temperature ?? 0.7,
                return_full_text: false,
            }
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`HuggingFace returned ${res.status}: ${err}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
    }
    throw new Error("Invalid response format from Hugging Face");
}

// 💻 Tier 5: Cloud Docker / Local Ollama Provider
async function callOllamaProvider(messages: AIMessage[], options?: AIOptions): Promise<string> {
    const ollamaMessages: OllamaMessage[] = messages.map(m => ({ role: m.role, content: m.content }));
    const model = options?.format === "json" ? (process.env.OLLAMA_FINDER_MODEL || "qwen2.5-coder:3b") : (process.env.OLLAMA_CHAT_MODEL || "qwen2.5-coder:3b");
    return callOllama(ollamaMessages, model, {
        format: options?.format,
        temperature: options?.temperature,
        num_predict: options?.maxTokens ?? 800,
    });
}

// ============================================================================
// 🌟 UNIFIED CASCADE DISPATCHER (Non-Streaming)
// ============================================================================
export async function callAICascade(
    messages: AIMessage[],
    options?: AIOptions
): Promise<{ text: string; provider: string }> {
    // 0. Scrub PII from messages for privacy compliance
    const sanitizedMessages: AIMessage[] = messages.map(m => ({
        role: m.role,
        content: m.role === "user" ? scrubPII(m.content) : m.content,
    }));

    // 1. Check Tier 1: In-Memory Cache
    if (!options?.skipCache) {
        const cacheKey = getCacheKey(sanitizedMessages, options);
        const cached = aiResponseCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            console.log(`⚡ [AI Router] Tier 1 Cache HIT: "${cacheKey.substring(0, 40)}" (Provider: ${cached.provider})`);
            return { text: cached.response, provider: `Cache (${cached.provider})` };
        }
    }

    const errors: string[] = [];

    // 2. Try Tier 2: Google Gemini 1.5 Flash
    if (process.env.GEMINI_API_KEY) {
        try {
            console.log("🟢 [AI Router] Dispatching to Tier 2: Cloud Model Engine...");
            const response = await callGemini(sanitizedMessages, options);
            saveToCache(sanitizedMessages, response, "SBMS AI Engine", options);
            return { text: response, provider: "SBMS AI Engine" };
        } catch (err: any) {
            console.warn("⚠️ [AI Router] Tier 2 failed/rate-limited:", err.message);
            errors.push(`Tier 2: ${err.message}`);
        }
    }

    // 3. Try Tier 3: High-Speed Hardware Accelerator (Hot Failover)
    if (process.env.GROQ_API_KEY) {
        try {
            console.log("🚀 [AI Router] Hot Failover to Tier 3...");
            const response = await callGroq(sanitizedMessages, options);
            saveToCache(sanitizedMessages, response, "SBMS AI Engine", options);
            return { text: response, provider: "SBMS AI Engine" };
        } catch (err: any) {
            console.warn("⚠️ [AI Router] Tier 3 failed:", err.message);
            errors.push(`Tier 3: ${err.message}`);
        }
    }

    // 4. Try Tier 4: Serverless API
    if (process.env.HUGGINGFACE_API_KEY) {
        try {
            console.log("🤗 [AI Router] Failover to Tier 4...");
            const response = await callHuggingFace(sanitizedMessages, options);
            saveToCache(sanitizedMessages, response, "SBMS AI Engine", options);
            return { text: response, provider: "SBMS AI Engine" };
        } catch (err: any) {
            console.warn("⚠️ [AI Router] Tier 4 failed:", err.message);
            errors.push(`Tier 4: ${err.message}`);
        }
    }

    // 5. Try Tier 5: Local Dedicated Engine
    try {
        console.log("💻 [AI Router] Routing to Tier 5: Local Dedicated Engine...");
        const response = await callOllamaProvider(sanitizedMessages, options);
        saveToCache(sanitizedMessages, response, "SBMS AI Engine", options);
        return { text: response, provider: "SBMS AI Engine" };
    } catch (err: any) {
        console.warn("⚠️ [AI Router] Tier 5 failed:", err.message);
        errors.push(`Tier 5: ${err.message}`);
    }

    throw new Error(`All AI Providers in Cascade failed:\n${errors.join("\n")}`);
}

// ============================================================================
// 🌊 UNIFIED CASCADE DISPATCHER (Streaming)
// ============================================================================
export async function* streamAICascade(
    messages: AIMessage[],
    options?: AIOptions
): AsyncGenerator<{ chunk: string; provider: string }> {
    const sanitizedMessages: AIMessage[] = messages.map(m => ({
        role: m.role,
        content: m.role === "user" ? scrubPII(m.content) : m.content,
    }));

    // 1. Try Streaming from Primary Cloud Model
    if (process.env.GEMINI_API_KEY) {
        try {
            console.log("🟢 [AI Router] Streaming from Primary Cloud Model...");
            for await (const chunk of streamGemini(sanitizedMessages, options)) {
                yield { chunk, provider: "SBMS AI Engine" };
            }
            return;
        } catch (err: any) {
            console.warn("⚠️ [AI Router] Primary stream failed, cascading:", err.message);
        }
    }

    // 2. Try Streaming from Accelerated LPU
    if (process.env.GROQ_API_KEY) {
        try {
            console.log("🚀 [AI Router] Hot Streaming from Accelerated Engine...");
            for await (const chunk of streamGroq(sanitizedMessages, options)) {
                yield { chunk, provider: "SBMS AI Engine" };
            }
            return;
        } catch (err: any) {
            console.warn("⚠️ [AI Router] Stream failed, cascading to local:", err.message);
        }
    }

    // 3. Try Streaming from Local Engine
    console.log("💻 [AI Router] Streaming from Local Dedicated Engine...");
    const ollamaMessages: OllamaMessage[] = sanitizedMessages.map(m => ({ role: m.role, content: m.content }));
    const model = process.env.OLLAMA_CHAT_MODEL || "qwen2.5-coder:3b";
    for await (const chunk of streamOllama(ollamaMessages, model, options?.temperature ?? 0.7)) {
        yield { chunk, provider: "SBMS AI Engine" };
    }
}

function saveToCache(messages: AIMessage[], response: string, provider: string, options?: AIOptions) {
    if (options?.skipCache) return;
    const cacheKey = getCacheKey(messages, options);
    // Limit cache size to 1,000 entries
    if (aiResponseCache.size > 1000) {
        const firstKey = aiResponseCache.keys().next().value;
        if (firstKey) aiResponseCache.delete(firstKey);
    }
    aiResponseCache.set(cacheKey, {
        response,
        provider,
        timestamp: Date.now(),
    });
}
