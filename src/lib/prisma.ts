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
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment.");
  }

  // If local PostgreSQL
  if (connectionString.includes("localhost") || connectionString.includes("127.0.0.1")) {
    const { PrismaPg } = require("@prisma/adapter-pg");
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  // If cloud Neon PostgreSQL
  const { PrismaNeon } = require("@prisma/adapter-neon");
  const { Pool, neonConfig } = require("@neondatabase/serverless");
  const ws = require("ws");
  neonConfig.webSocketConstructor = ws;
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
