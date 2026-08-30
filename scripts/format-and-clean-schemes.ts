import { prisma } from "../src/lib/prisma";
import { embedText, buildSchemeEmbeddingText } from "../src/lib/embeddings";
import { Pool } from "pg";

function cleanHtmlAndEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<div[^>]*>/gi, "")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&copy;/gi, "©")
    .replace(/&reg;/gi, "®")
    .replace(/&trade;/gi, "™");
}

function cleanText(text: string): string {
  if (!text) return "";
  let s = cleanHtmlAndEntities(text);

  // Fix words glued to bullet points (e.g. "Remuneration• A" -> "Remuneration:\n• A")
  s = s.replace(/([^\n•\s])\s*•\s*/g, "$1\n• ");

  // Standardize bullet points
  s = s.replace(/^[ \t]*[-*+]\s+/gm, "• ");
  s = s.replace(/^[ \t]*•\s*•\s*/gm, "• ");

  // Remove empty bullets
  s = s.replace(/^[ \t]*•\s*$/gm, "");

  // Remove dangling empty exclusion / ineligibility headers
  s = s.replace(/\*\*Exclusions\s*\/\s*Ineligibility:\*\*\s*(•|\s)*$/gi, "");
  s = s.replace(/\*\*Exclusions\s*\/\s*Ineligibility:\*\*\s*\n*(?=\n\*\*|$)/gi, "");

  // Remove empty metadata headers
  s = s.replace(/\*\*Nodal Ministry \/ Department:\*\*\s*(undefined|null|\s)*$/gmi, "");
  s = s.replace(/\*\*Implementing Agency:\*\*\s*(undefined|null|\s)*$/gmi, "");
  s = s.replace(/\*\*Jurisdiction Level:\*\*\s*(undefined|null|\s)*$/gmi, "");

  // Clean double brackets / empty parenthesis
  s = s.replace(/\(\s*\)/g, "");
  s = s.replace(/\[\s*\]/g, "");

  // Normalize multiple spaces and newlines
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/^[ \t]+/gm, "");
  s = s.replace(/[ \t]+$/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");

  return s.trim();
}

function cleanTitle(title: string): string {
  if (!title) return "";
  let t = title.trim();
  t = t.replace(/^["'`\u201c\u201d\u2018\u2019]+|["'`\u201c\u201d\u2018\u2019]+$/g, "");
  t = t.replace(/\s+/g, " ");
  return t.trim();
}

function cleanUrl(url: string | null): string | null {
  if (!url) return null;
  let u = url.trim();
  // Strip tracking parameters
  u = u.replace(/(\?|&)(utm_source|utm_medium|utm_campaign|utm_term|utm_content|ref)=[^&#]*/gi, "");
  u = u.replace(/[?&]$/, "");
  return u.trim();
}

async function run() {
  console.log("=================================================================");
  console.log("🧹 STARTING DATABASE REFINEMENT & DATA FORMATTING ACROSS 4,700+ SCHEMES");
  console.log("=================================================================\n");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
    max: 10,
  });

  const schemes = await prisma.scheme.findMany();
  console.log(`📊 Found ${schemes.length} schemes in PostgreSQL to format and organize...\n`);

  let updatedCount = 0;

  for (let i = 0; i < schemes.length; i++) {
    const s = schemes[i];
    const newTitle = cleanTitle(s.title);
    const newDescription = cleanText(s.description);
    const newBenefits = cleanText(s.benefits);
    const newEligibility = cleanText(s.eligibility);
    const newDocuments = cleanText(s.documents);
    const newApplyLink = cleanUrl(s.applyLink);

    const isChanged =
      newTitle !== s.title ||
      newDescription !== s.description ||
      newBenefits !== s.benefits ||
      newEligibility !== s.eligibility ||
      newDocuments !== s.documents ||
      newApplyLink !== s.applyLink;

    if (isChanged) {
      try {
        const updated = await prisma.scheme.update({
          where: { id: s.id },
          data: {
            title: newTitle,
            description: newDescription,
            benefits: newBenefits,
            eligibility: newEligibility,
            documents: newDocuments,
            applyLink: newApplyLink,
          },
        });

        // Regenerate vector embedding for clean text
        const textToEmbed = buildSchemeEmbeddingText(updated);
        const vector = await embedText(textToEmbed);

        if (vector && vector.length > 0) {
          const vectorLiteral = `[${vector.join(",")}]`;
          await pool.query(
            `
              UPDATE "SchemeEmbedding"
              SET vector = $2::vector, "updatedAt" = NOW()
              WHERE "schemeId" = $1
            `,
            [updated.id, vectorLiteral]
          );
        }

        updatedCount++;
      } catch (err: any) {
        console.error(`Error updating scheme ${s.id}:`, err.message);
      }
    }

    if ((i + 1) % 250 === 0 || i === schemes.length - 1) {
      const pct = (((i + 1) / schemes.length) * 100).toFixed(1);
      console.log(`  [${i + 1}/${schemes.length}] (${pct}%) Cleaned & Re-indexed. (Updated: ${updatedCount})`);
    }
  }

  await pool.end();
  await prisma.$disconnect();

  console.log("\n=================================================================");
  console.log(`✨ FORMATTING & CLEANSING COMPLETE! Cleaned and re-indexed ${updatedCount} schemes.`);
  console.log("=================================================================");
}

run().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
