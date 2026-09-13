import { Pool } from "pg";

/**
 * Search for schemes similar to the given query vector using
 * pgvector cosine similarity on the SchemeEmbedding table.
 *
 * Supports both local PostgreSQL and Neon Cloud (with SSL).
 * Returns the top `limit` schemes ordered by similarity (closest first).
 */

let pool: Pool | null = null;

function getPool(): Pool {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL || "";
        const isCloud = !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1");

        pool = new Pool({
            connectionString,
            ssl: isCloud ? { rejectUnauthorized: false } : false,
            max: 5,
            connectionTimeoutMillis: 8000,
        });
    }
    return pool;
}

export async function searchSimilarSchemes(
    queryVector: number[],
    limit = 8
): Promise<SimilarScheme[]> {
    if (!queryVector || queryVector.length === 0) return [];

    const db = getPool();
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
        console.warn("[RAG] Vector similarity search fallback:", err.message);
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
