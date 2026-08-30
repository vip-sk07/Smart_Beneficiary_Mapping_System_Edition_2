import { Pool } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import "dotenv/config";

async function main() {
    console.log("🚀 Pushing schema via Neon serverless adapter...");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

    const schemaPath = path.join(process.cwd(), "schema_utf8.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    try {
        const statements = schemaSql
            .split(/;\s*$/m)
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Drop existing schema completely to avoid "type already exists" from partial pushes
        console.log("Wiping existing partial schema...");
        await pool.query("DROP SCHEMA IF EXISTS public CASCADE;");
        await pool.query("CREATE SCHEMA public;");
        await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');

        console.log(`Executing ${statements.length} SQL statements...`);

        for (const stmt of statements) {
            // Ignore the CreateSchema statement since we just did it
            if (stmt.includes("CREATE SCHEMA")) continue;

            await pool.query(stmt);
            process.stdout.write(".");
        }

        console.log("\n✅ Schema successfully pushed via websocket!");
    } catch (err) {
        console.error("\n❌ Failed to push schema:", err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
