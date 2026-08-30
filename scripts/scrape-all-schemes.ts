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

// Helper: Convert Slate / Rich-Text JSON to clean, human-readable plain text
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
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function safeFetchJson(url: string, retries = 5): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.ok) return await res.json();
      if (res.status === 429) {
        console.warn(`[Rate Limit 429] Backing off 12s before retrying ${url}...`);
        await sleep(12000);
        continue;
      }
      if (res.status === 404) return null;
    } catch (e: any) {
      // Network disconnect / timeout
    }
    await sleep(1500 * (i + 1));
  }
  return null;
}

// Find genuine direct official portal URL
function determineOfficialUrl(
  applicationProcess: any[],
  references: any[],
  slug: string
): string {
  const candidateUrls: { url: string; priority: number }[] = [];

  if (Array.isArray(applicationProcess)) {
    for (const proc of applicationProcess) {
      let u = (proc?.url || "").trim();
      if (u) {
        if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
        let prio = 10;
        if (proc.mode?.toLowerCase() === "online") prio += 5;
        if (u.includes(".gov.in") || u.includes(".nic.in")) prio += 10;
        candidateUrls.push({ url: u, priority: prio });
      }
    }
  }

  if (Array.isArray(references)) {
    for (const ref of references) {
      let u = (ref?.url || "").trim();
      const title = (ref?.title || "").toLowerCase();
      if (u) {
        if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
        let prio = 5;
        if (title.includes("official website") || title.includes("portal") || title.includes("apply")) prio += 12;
        if (title.includes("guidelines") || title.includes("scheme")) prio += 6;
        if (u.includes(".gov.in") || u.includes(".nic.in")) prio += 8;
        candidateUrls.push({ url: u, priority: prio });
      }
    }
  }

  if (candidateUrls.length > 0) {
    candidateUrls.sort((a, b) => b.priority - a.priority);
    return candidateUrls[0].url;
  }

  return `https://www.myscheme.gov.in/schemes/${slug}`;
}

async function scrapeAllSchemes() {
  console.log("=================================================================");
  console.log("🇮🇳 RESUMING FULL INGESTION: 4,772 GOVERNMENT SCHEMES");
  console.log("=================================================================\n");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    max: 8,
  });

  const PAGE_SIZE = 50;
  let totalSchemes = 4772;

  // Load existing titles to skip already synced ones
  const existingSchemes = await prisma.scheme.findMany({ select: { title: true } });
  const existingTitles = new Set(existingSchemes.map((s) => s.title));
  console.log(`📊 Currently in database: ${existingTitles.size} schemes with full vectors`);

  // Cache existing categories
  const categoryCache = new Map<string, string>();
  const existingCategories = await prisma.category.findMany();
  existingCategories.forEach((c) => categoryCache.set(c.name, c.id));

  let from = 0;
  let totalProcessed = existingTitles.size;

  while (from < totalSchemes) {
    const pageNum = Math.floor(from / PAGE_SIZE) + 1;
    const searchUrl = `https://api.myscheme.gov.in/search/v6/schemes?lang=en&q=%5B%5D&keyword=&sort=&from=${from}&size=${PAGE_SIZE}`;
    const searchData = await safeFetchJson(searchUrl);

    if (!searchData?.data?.hits?.items) {
      console.warn(`⚠️ Failed to load search page at from=${from}. Retrying after 5s...`);
      await sleep(5000);
      continue;
    }

    const items = searchData.data.hits.items;
    const pageTotal = searchData.data.hits.page?.total;
    if (pageTotal) totalSchemes = pageTotal;

    if (items.length === 0) {
      console.log("🏁 Reached end of index.");
      break;
    }

    for (const item of items) {
      const slug = item.fields?.slug;
      if (!slug) continue;

      const schemeName = (item.fields?.schemeName || "").trim();
      if (existingTitles.has(schemeName)) {
        // Already synced
        continue;
      }

      const rawCategory = item.fields?.schemeCategory?.[0] || "General Welfare";
      const categoryName = typeof rawCategory === "object" ? rawCategory.label || "General Welfare" : rawCategory;

      try {
        await sleep(350); // Polite interval

        // 1. Fetch Detail
        const detailUrl = `https://api.myscheme.gov.in/schemes/v6/public/schemes?slug=${slug}&lang=en`;
        const detailData = await safeFetchJson(detailUrl);
        if (!detailData?.data?.en) continue;

        const enData = detailData.data.en;
        const basic = enData.basicDetails || {};
        const content = enData.schemeContent || {};
        const eligibilityObj = enData.eligibilityCriteria || {};
        const appProcess = enData.applicationProcess || [];
        const references = content.references || [];
        const schemeId = detailData.data._id;

        // 2. Fetch Documents Required
        let docsText = "";
        if (schemeId) {
          await sleep(150);
          const docsUrl = `https://api.myscheme.gov.in/schemes/v6/public/schemes/${schemeId}/documents?lang=en`;
          const docsData = await safeFetchJson(docsUrl);
          const docsArray = docsData?.data?.en?.documents_required || [];
          docsText = extractText(docsArray);
        }

        // 3. Clean Fields
        const title = (basic.schemeName || schemeName).trim();
        const nodalMinistry = basic.nodalMinistryName?.label || basic.nodalMinistryName || item.fields.nodalMinistryName || "";
        const implementingAgency = basic.implementingAgency || "";
        const level = basic.level?.label || basic.level || item.fields.level || "Central";
        const briefDesc = content.briefDescription || item.fields.briefDescription || "";
        const detailedDesc = extractText(content.detailedDescription) || extractText(content.detailedDescription_md) || "";

        let fullDescription = briefDesc;
        if (detailedDesc && detailedDesc !== briefDesc) {
          fullDescription += "\n\n" + detailedDesc;
        }
        if (nodalMinistry) fullDescription += `\n\n**Nodal Ministry / Department:** ${nodalMinistry}`;
        if (implementingAgency) fullDescription += `\n**Implementing Agency:** ${implementingAgency}`;
        if (level) fullDescription += `\n**Jurisdiction Level:** ${level}`;

        const benefitsText = extractText(content.benefits) || extractText(content.benefits_md) || "Financial and social welfare assistance as per government guidelines.";

        let eligibilityText = extractText(eligibilityObj.criteria) || extractText(eligibilityObj.eligibilityCriteria_md) || "All eligible Indian citizens as per scheme guidelines.";
        const exclusionsText = extractText(content.exclusions) || extractText(content.exclusions_md);
        if (exclusionsText) eligibilityText += `\n\n**Exclusions / Ineligibility:**\n${exclusionsText}`;

        const cleanDocuments = docsText || "Standard identity proof (Aadhaar Card), proof of residence, and income certificate.";
        const officialApplyLink = determineOfficialUrl(appProcess, references, slug);

        // 4. Resolve Category
        let catId = categoryCache.get(categoryName);
        if (!catId) {
          const newCat = await prisma.category.upsert({
            where: { name: categoryName },
            update: {},
            create: { name: categoryName, description: `${categoryName} welfare schemes` },
          });
          catId = newCat.id;
          categoryCache.set(categoryName, catId);
        }

        // 5. Upsert Scheme
        const scheme = await prisma.scheme.upsert({
          where: { title },
          update: {
            description: fullDescription,
            benefits: benefitsText,
            eligibility: eligibilityText,
            documents: cleanDocuments,
            applyLink: officialApplyLink,
            categoryId: catId,
            isActive: true,
          },
          create: {
            title,
            description: fullDescription,
            benefits: benefitsText,
            eligibility: eligibilityText,
            documents: cleanDocuments,
            applyLink: officialApplyLink,
            categoryId: catId,
            isActive: true,
          },
        });

        // 6. Local Vector Embedding
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
        }

        existingTitles.add(title);
        totalProcessed++;
        if (totalProcessed % 25 === 0) {
          const pct = ((totalProcessed / totalSchemes) * 100).toFixed(1);
          console.log(`  [${totalProcessed}/${totalSchemes}] (${pct}%) ✅ Synced: "${title.slice(0, 45)}..." -> ${officialApplyLink}`);
        }
      } catch (err: any) {
        console.error(`  ❌ Error on ${slug}:`, err.message);
      }
    }

    from += PAGE_SIZE;
  }

  await pool.end();
  await prisma.$disconnect();

  console.log(`\n🎉 Ingestion complete! Total schemes in database: ${totalProcessed}`);
}

scrapeAllSchemes().catch((e) => {
  console.error("Scraper encountered fatal error:", e);
  process.exit(1);
});
