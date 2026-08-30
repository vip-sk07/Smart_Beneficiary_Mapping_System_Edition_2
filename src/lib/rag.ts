import { Pool } from "pg";

/**
 * Search for schemes similar to the given query vector using
 * pgvector cosine similarity on the SchemeEmbedding table.
 *
 * Uses local pg Pool (works with local Podman PostgreSQL on port 5433).
 * Returns the top `limit` schemes ordered by similarity (closest first).
 */

let pool: Pool | null = null;

function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: false,
            max: 5,
            connectionTimeoutMillis: 10000,
        });
    }
    return pool;
}

export async function searchSimilarSchemes(
    queryVector: number[],
    limit = 5
): Promise<SimilarScheme[]> {
    const db = getPool();

    // No embeddings in DB yet — return empty gracefully
    if (!queryVector || queryVector.length === 0) return [];

    const vectorLiteral = `[${queryVector.join(",")}]`;

    try {
        const result = await db.query(
            `SELECT
                s.id,
                s.title,
                s.description,
                s.benefits,
                s.eligibility,
                s."applyLink",
                c.name AS category,
                1 - (se.vector <=> $1::vector) AS similarity
             FROM "SchemeEmbedding" se
             JOIN "Scheme" s ON s.id = se."schemeId"
             JOIN "Category" c ON c.id = s."categoryId"
             WHERE se.vector IS NOT NULL
               AND s."isActive" = true
             ORDER BY se.vector <=> $1::vector
             LIMIT $2`,
            [vectorLiteral, limit]
        );
        return result.rows as SimilarScheme[];
    } catch (err: any) {
        // If SchemeEmbedding table is empty or vector extension not ready, return empty
        console.warn("[RAG] searchSimilarSchemes failed (embeddings may not exist yet):", err.message);
        return [];
    }
}

export interface SimilarScheme {
    id: string;
    title: string;
    description: string;
    benefits: string;
    eligibility: string;
    applyLink: string | null;
    category: string;
    similarity: number;
}


