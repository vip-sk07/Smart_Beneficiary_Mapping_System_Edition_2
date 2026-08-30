/**
 * Free Open-Source Document OCR Parsing Engine
 * Uses Tesseract.js running locally in Node.js/Browser to parse text from uploaded certificates.
 * No external API keys or cloud vision costs required.
 */

import { createWorker } from "tesseract.js";

export interface ParsedCertificateData {
  rawText: string;
  extractedIncome?: number;
  extractedCertificateNo?: string;
  extractedDate?: string;
}

export async function parseDocumentBuffer(imageBuffer: Buffer): Promise<ParsedCertificateData> {
  let worker: any = null;
  try {
    worker = await createWorker("eng");
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();

    // Extract income amount using regex heuristics (e.g., Rs. 50,000, ₹ 1,20,000, Income: 80000)
    let extractedIncome: number | undefined = undefined;
    const incomeMatches = text.match(/(?:income|amount|rs\.?|₹)\s*[:=]?\s*([0-9,]+)/i);
    if (incomeMatches && incomeMatches[1]) {
      const cleanIncomeStr = incomeMatches[1].replace(/,/g, "");
      const parsedVal = parseInt(cleanIncomeStr, 10);
      if (!isNaN(parsedVal) && parsedVal > 0) {
        extractedIncome = parsedVal;
      }
    }

    // Extract certificate number heuristics
    let extractedCertificateNo: string | undefined = undefined;
    const certNoMatch = text.match(/(?:cert(?:ificate)?\s*(?:no|num|id)|ref\s*no)\s*[:=]?\s*([a-z0-9/-]+)/i);
    if (certNoMatch && certNoMatch[1]) {
      extractedCertificateNo = String(certNoMatch[1]);
    }

    return {
      rawText: text,
      extractedIncome,
      extractedCertificateNo,
    };
  } catch (error: any) {
    console.error("Local Tesseract OCR processing failed:", error.message);
    if (worker) {
      await worker.terminate().catch(() => {});
    }
    return { rawText: "" };
  }
}
