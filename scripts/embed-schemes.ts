/**
 * scripts/embed-schemes.ts
 *
 * One-time (and re-runnable) script to embed all active schemes
 * into the SchemeEmbedding table using Google text-embedding-004.
 *
 * Run with: npx tsx scripts/embed-schemes.ts
 */

import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { embedText, buildSchemeEmbeddingText } from "../src/lib/embeddings";
import { neon } from "@neondatabase/serverless";

async function main() {
    console.log("🚀 Starting scheme embedding process...\n");

    const schemes = await prisma.scheme.findMany({
        where: { isActive: true },
        select: {
            id: true,
            title: true,
            description: true,
            benefits: true,
            eligibility: true,
        },
    });

    console.log(`📋 Found ${schemes.length} active schemes to embed.\n`);

    const sql = neon(process.env.DATABASE_URL!);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < schemes.length; i++) {
        const scheme = schemes[i];

        try {
            const text = buildSchemeEmbeddingText(scheme);
            const vector = await embedText(text);
            const vectorLiteral = `[${vector.join(",")}]`;

            // Upsert into SchemeEmbedding using raw SQL (pgvector type)
            await sql`
        INSERT INTO "SchemeEmbedding" (id, "schemeId", vector, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          ${scheme.id},
          ${vectorLiteral}::vector,
          NOW(),
          NOW()
        )
        ON CONFLICT ("schemeId") DO UPDATE
          SET vector = EXCLUDED.vector,
              "updatedAt" = NOW()
      `;

            successCount++;
            console.log(`  ✅ [${i + 1}/${schemes.length}] Embedded: ${scheme.title}`);

            // Small delay to avoid hitting Gemini rate limits
            if (i < schemes.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 200));
            }
        } catch (err) {
            failCount++;
            console.error(`  ❌ [${i + 1}/${schemes.length}] Failed: ${scheme.title}`, err);
        }
    }

    console.log(`\n✨ Done! ${successCount} embedded, ${failCount} failed.`);
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
