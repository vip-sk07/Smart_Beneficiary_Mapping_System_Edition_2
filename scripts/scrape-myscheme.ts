import { prisma } from "../src/lib/prisma";
import { embedText, buildSchemeEmbeddingText } from "../src/lib/embeddings";
import { Pool } from "pg";

const API_KEY = "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "x-api-key": API_KEY,
  "Referer": "https://www.myscheme.gov.in/",
  "Origin": "https://www.myscheme.gov.in",
  "Accept": "application/json"
};

// Helper: Convert myScheme Slate / Rich-Text JSON to readable clean text / markdown
function extractText(contentArray: any[]): string {
  if (!contentArray) return "";
  if (typeof contentArray === "string") return contentArray.trim();
  if (!Array.isArray(contentArray)) return "";

  let text = "";
  for (const block of contentArray) {
    if (!block) continue;
    if (block.type === "paragraph") {
      const p = extractText(block.children);
      if (p) text += p + "\n\n";
    } else if (block.type === "list_item") {
      const li = extractText(block.children);
      if (li) text += "• " + li + "\n";
    } else if (block.type === "ol_list" || block.type === "ul_list") {
      text += extractText(block.children) + "\n";
    } else if (block.type === "link") {
      const linkText = extractText(block.children) || block.link || "Link";
      text += `${linkText} (${block.link || ""}) `;
    } else if (block.text) {
      text += block.text;
    } else if (block.children && Array.isArray(block.children)) {
      text += extractText(block.children);
    }
  }
  return text.trim();
}

// Helper: Sleep to avoid WAF rate limits / socket drops
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Safe fetch with retries
async function safeFetchJson(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 404) return null;
      console.warn(`[HTTP ${res.status}] retrying ${url} (attempt ${i + 1}/${retries})...`);
    } catch (e: any) {
      console.warn(`[Network Error] ${e.message}, retrying ${url} (attempt ${i + 1}/${retries})...`);
    }
    await sleep(800 * (i + 1));
  }
  return null;
}

// Find the best official direct URL for a scheme (Not myscheme.gov.in)
function determineOfficialUrl(
  applicationProcess: any[],
  references: any[],
  slug: string
): string {
  const candidateUrls: { mode: string; url: string; priority: number }[] = [];

  // 1. Check Application Process URLs
  if (Array.isArray(applicationProcess)) {
    for (const proc of applicationProcess) {
      let u = (proc?.url || "").trim();
      if (u) {
        if (!u.startsWith("http://") && !u.startsWith("https://")) {
          u = "https://" + u;
        }
        // Higher priority for online government portals (.gov.in, .nic.in, or direct portals)
        let prio = 10;
        if (proc.mode?.toLowerCase() === "online") prio += 5;
        if (u.includes(".gov.in") || u.includes(".nic.in")) prio += 10;
        candidateUrls.push({ mode: proc.mode || "Online", url: u, priority: prio });
      }
    }
  }

  // 2. Check Reference links (Official websites, Guidelines, Portals)
  if (Array.isArray(references)) {
    for (const ref of references) {
      let u = (ref?.url || "").trim();
      const title = (ref?.title || "").toLowerCase();
      if (u) {
        if (!u.startsWith("http://") && !u.startsWith("https://")) {
          u = "https://" + u;
        }
        let prio = 5;
        if (title.includes("official website") || title.includes("portal") || title.includes("apply")) prio += 12;
        if (title.includes("guidelines") || title.includes("scheme")) prio += 6;
        if (u.includes(".gov.in") || u.includes(".nic.in")) prio += 8;
        candidateUrls.push({ mode: ref.title || "Reference", url: u, priority: prio });
      }
    }
  }

  if (candidateUrls.length > 0) {
    candidateUrls.sort((a, b) => b.priority - a.priority);
    return candidateUrls[0].url;
  }

  // Fallback only if no external link exists
  return `https://www.myscheme.gov.in/schemes/${slug}`;
}

async function scrapeMyScheme() {
  console.log("🚀 Starting comprehensive extraction of real scheme data from official sources...");

  const searchUrl = "https://api.myscheme.gov.in/search/v6/schemes?lang=en&q=%5B%5D&keyword=&sort=&from=0&size=40";
  const searchData = await safeFetchJson(searchUrl);
  const items = searchData?.data?.hits?.items || [];
  console.log(`📋 Found ${items.length} schemes to extract in full detail...\n`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    max: 5,
  });

  let successCount = 0;

  for (const item of items) {
    const slug = item.fields.slug;
    const rawCategory = item.fields.schemeCategory?.[0] || "General Welfare";
    const categoryName = typeof rawCategory === "object" ? rawCategory.label || "General Welfare" : rawCategory;

    console.log(`📡 Fetching comprehensive data for: "${item.fields.schemeName}" (${slug})...`);
    await sleep(400);

    try {
      // 1. Fetch Main Scheme Details
      const detailUrl = `https://api.myscheme.gov.in/schemes/v6/public/schemes?slug=${slug}&lang=en`;
      const detailData = await safeFetchJson(detailUrl);
      if (!detailData?.data?.en) {
        console.warn(`  ⚠️ Could not get detail payload for ${slug}`);
        continue;
      }

      const enData = detailData.data.en;
      const basic = enData.basicDetails || {};
      const content = enData.schemeContent || {};
      const eligibilityObj = enData.eligibilityCriteria || {};
      const appProcess = enData.applicationProcess || [];
      const references = content.references || [];
      const schemeId = detailData.data._id;

      // 2. Fetch Documents Required
      await sleep(200);
      const docsUrl = `https://api.myscheme.gov.in/schemes/v6/public/schemes/${schemeId}/documents?lang=en`;
      const docsData = await safeFetchJson(docsUrl);
      const docsArray = docsData?.data?.en?.documents_required || [];
      const docsText = extractText(docsArray);

      // 3. Fetch FAQs
      await sleep(200);
      const faqsUrl = `https://api.myscheme.gov.in/schemes/v6/public/schemes/${schemeId}/faqs?lang=en`;
      const faqsData = await safeFetchJson(faqsUrl);
      const faqsArray = faqsData?.data?.en?.faqs || [];
      let faqsText = "";
      if (faqsArray.length > 0) {
        faqsText = "\n\n### Frequently Asked Questions:\n" + faqsArray.map((faq: any) => {
          const q = faq.question || "";
          const a = extractText(faq.answer || []);
          return `Q: ${q}\nA: ${a}`;
        }).join("\n\n");
      }

      // 4. Construct Full Rich Descriptions
      const title = basic.schemeName || item.fields.schemeName;
      const nodalMinistry = basic.nodalMinistryName?.label || basic.nodalMinistryName || item.fields.nodalMinistryName || "";
      const implementingAgency = basic.implementingAgency || "";
      const level = basic.level?.label || basic.level || item.fields.level || "Central";
      const briefDesc = content.briefDescription || item.fields.briefDescription || "";
      const detailedDesc = extractText(content.detailedDescription) || extractText(content.detailedDescription_md) || "";

      let fullDescription = briefDesc;
      if (detailedDesc && detailedDesc !== briefDesc) {
        fullDescription += "\n\n" + detailedDesc;
      }
      if (nodalMinistry) {
        fullDescription += `\n\n**Nodal Ministry / Department:** ${nodalMinistry}`;
      }
      if (implementingAgency) {
        fullDescription += `\n**Implementing Agency:** ${implementingAgency}`;
      }
      if (level) {
        fullDescription += `\n**Jurisdiction Level:** ${level}`;
      }

      // 5. Construct Full Benefits
      const benefitsText = extractText(content.benefits) || extractText(content.benefits_md) || "Financial and social welfare assistance as per government guidelines.";
      
      // 6. Construct Full Eligibility Criteria & Exclusions
      let eligibilityText = extractText(eligibilityObj.criteria) || extractText(eligibilityObj.eligibilityCriteria_md) || "All eligible Indian citizens as per scheme guidelines.";
      const exclusionsText = extractText(content.exclusions) || extractText(content.exclusions_md);
      if (exclusionsText) {
        eligibilityText += `\n\n**Exclusions / Ineligibility:**\n${exclusionsText}`;
      }

      // 7. Construct Application Process Steps
      let processStepsText = "";
      if (Array.isArray(appProcess) && appProcess.length > 0) {
        processStepsText = "\n\n### How to Apply:\n" + appProcess.map((proc: any) => {
          const mode = proc.mode || "General";
          const url = proc.url ? ` (Portal: ${proc.url})` : "";
          const steps = extractText(proc.process);
          return `**Mode: ${mode}${url}**\n${steps}`;
        }).join("\n\n");
      }

      // 8. Clean Required Documents only (no FAQs or unnecessary text appended)
      const cleanDocuments = docsText || "Standard identity proof (Aadhaar Card), proof of residence, and income certificate.";

      // 9. Determine REAL Official Direct Link (not myscheme.gov.in)
      const officialApplyLink = determineOfficialUrl(appProcess, references, slug);

      // 10. Upsert Category
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName, description: `${categoryName} welfare schemes` },
      });

      // 11. Upsert Scheme into PostgreSQL
      const scheme = await prisma.scheme.upsert({
        where: { title },
        update: {
          description: fullDescription,
          benefits: benefitsText,
          eligibility: eligibilityText,
          documents: cleanDocuments,
          applyLink: officialApplyLink,
          categoryId: category.id,
          isActive: true,
        },
        create: {
          title,
          description: fullDescription,
          benefits: benefitsText,
          eligibility: eligibilityText,
          documents: cleanDocuments,
          applyLink: officialApplyLink,
          categoryId: category.id,
          isActive: true,
        },
      });

      console.log(`  ✅ Synced: "${scheme.title}"`);
      console.log(`     🔗 Direct Portal Link: ${officialApplyLink}`);

      // 12. Local Vector Embedding
      const textToEmbed = buildSchemeEmbeddingText(scheme);
      const vector = await embedText(textToEmbed);

      if (vector && vector.length > 0) {
        const vectorLiteral = `[${vector.join(",")}]`;
        await pool.query(
          `
            INSERT INTO "SchemeEmbedding" (id, "schemeId", vector, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), $1, $2::vector, NOW(), NOW())
            ON CONFLICT ("schemeId") DO UPDATE SET vector = EXCLUDED.vector, "updatedAt" = NOW()
          `,
          [scheme.id, vectorLiteral]
        );
        console.log(`     🧠 Vector embedding generated & stored in pgvector`);
      }

      successCount++;
    } catch (e: any) {
      console.error(`  ❌ Error processing ${slug}:`, e.message);
    }
  }

  await pool.end();
  await prisma.$disconnect();

  console.log(`\n🎉 Scraping and Synchronization complete! Successfully populated ${successCount} schemes with real official portals & full data.`);
}

scrapeMyScheme().catch((e) => {
  console.error("Fatal scraper error:", e);
  process.exit(1);
});
