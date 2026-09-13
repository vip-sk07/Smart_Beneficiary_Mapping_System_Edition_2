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
    console.warn("⚠️ DATABASE_URL is not set in environment. Running with fallback client.");
    return new Proxy({}, {
      get(target, prop) {
        if (prop === "$on" || prop === "$use" || prop === "$disconnect" || prop === "$connect") {
          return () => Promise.resolve();
        }
        return new Proxy({}, {
          get() {
            return () => Promise.resolve(null);
          }
        });
      }
    }) as unknown as PrismaClient;
  }

  const { PrismaPg } = require("@prisma/adapter-pg");
  const { Pool } = require("pg");

  const isCloud = !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1");
  const pool = new Pool({
    connectionString,
    ssl: isCloud ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
