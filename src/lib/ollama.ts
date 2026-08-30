/**
 * Local Ollama LLM Provider
 * Supports: chat (streaming + non-streaming), structured JSON output, vision (qwen2.5vl)
 * Default host: http://localhost:11434
 */

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

// Model roles — set via .env or use these smart defaults
export const OLLAMA_CHAT_MODEL =
  process.env.OLLAMA_CHAT_MODEL || "llama3:latest";        // Best for natural conversation
export const OLLAMA_FINDER_MODEL =
  process.env.OLLAMA_FINDER_MODEL || "qwen2.5-coder:7b";  // Best for strict JSON output
export const OLLAMA_VISION_MODEL =
  process.env.OLLAMA_VISION_MODEL || "qwen2.5vl:3b";      // For document OCR / image analysis

/**
 * Non-streaming Ollama chat call.
 * Pass format="json" to get structured JSON responses (uses Ollama's native JSON mode).
 */
export async function callOllama(
  messages: OllamaMessage[],
  model: string = OLLAMA_CHAT_MODEL,
  options: { format?: "json"; temperature?: number; num_predict?: number } = {}
): Promise<string> {
  try {
    const body: Record<string, any> = {
      model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        ...(options.num_predict && { num_predict: options.num_predict }),
      },
    };

    if (options.format === "json") {
      body.format = "json";
    }

    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.message?.content || "No response received from local Ollama model.";
  } catch (error: any) {
    console.error("[Ollama] callOllama error:", error.message);
    throw new Error(
      `Local Ollama service unreachable at ${OLLAMA_HOST}. Make sure Ollama is running: ollama serve`
    );
  }
}

/**
 * Streaming Ollama chat — yields text chunks as an AsyncGenerator.
 * Used for the real-time streaming chat UI.
 */
export async function* streamOllama(
  messages: OllamaMessage[],
  model: string = OLLAMA_CHAT_MODEL,
  temperature: number = 0.7
): AsyncGenerator<string> {
  const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: { temperature },
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Ollama stream error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value, { stream: true }).split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const chunk = parsed.message?.content;
        if (chunk) yield chunk;
        if (parsed.done) return;
      } catch {
        // ignore parse errors on partial chunk boundaries
      }
    }
  }
}

/**
 * Vision call using qwen2.5vl — send an image + prompt, get structured text back.
 * base64Images: pure base64 strings (no "data:image/..." prefix).
 */
export async function callOllamaVision(
  prompt: string,
  base64Images: string[],
  model: string = OLLAMA_VISION_MODEL
): Promise<string> {
  const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt, images: base64Images }],
      stream: false,
      options: { temperature: 0.1 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama vision returned ${response.status}`);
  }

  const data = await response.json();
  return data.message?.content || "";
}
