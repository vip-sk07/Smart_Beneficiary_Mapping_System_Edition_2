if (typeof process !== "undefined" && process.env.NEXT_RUNTIME !== "edge") {
  try {
    require("dotenv").config();
  } catch {}
}

import { PrismaClient } from "@prisma/client";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function createPrismaClient() {
  // Edge runtime (e.g. Next.js Middleware) - Return a lightweight mock to prevent initialization error
  if (process.env.NEXT_RUNTIME === "edge") {
    return new Proxy({}, {
      get(target, prop) {
        if (prop === "$on" || prop === "$use" || prop === "$disconnect" || prop === "$connect") {
          return () => Promise.resolve();
        }
        return {};
      }
    }) as unknown as PrismaClient;
  }

  // Node.js runtime (API routes, server actions, CLI seed scripts)
  // If DATABASE_URL is localhost (local dev tunnel) or missing, use the cloud Neon DB directly
  const CLOUD_DB = "postgresql://neondb_owner:npg_QhbpFA3r0uTk@ep-winter-meadow-a19fcj8w-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
  const rawUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  const connectionString = (rawUrl.includes("localhost") || rawUrl.includes("127.0.0.1") || !rawUrl) ? CLOUD_DB : rawUrl;

  if (!rawUrl || rawUrl.includes("localhost")) {
    console.log("⚡ Prisma: Using cloud Neon DB (local tunnel not available)");
  }

  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
