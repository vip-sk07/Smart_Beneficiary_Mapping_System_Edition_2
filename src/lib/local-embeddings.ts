/**
 * Free Open-Source Local Embeddings Engine
 * Uses @xenova/transformers running HuggingFace models locally in Node.js (ONNX runtime).
 * No API keys or remote server dependencies required.
 */

let featureExtractor: any = null;

export async function getLocalEmbedding(text: string): Promise<number[]> {
  try {
    if (!featureExtractor) {
      // Lazy load @xenova/transformers pipeline
      const { pipeline } = await import("@xenova/transformers");
      featureExtractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }

    const output = await featureExtractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Local embedding generation error:", error);
    // Fallback: simple deterministic hash vector if runtime unavailable
    return createSimpleHashVector(text, 384);
  }
}

/**
 * Fallback deterministic vector generator for lightweight testing when ONNX runtime isn't warm.
 */
function createSimpleHashVector(text: string, dimensions: number = 384): number[] {
  const vector = new Array(dimensions).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    vector[i % dimensions] += charCode / 255.0;
  }
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((val) => val / norm);
}
