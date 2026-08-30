import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        // DIRECT_URL is the non-pooled connection — required for Prisma CLI (db push, migrate)
        // DATABASE_URL (pooled) is used at runtime via PrismaNeon adapter in src/lib/prisma.ts
        url: process.env.DIRECT_URL!,
    },
});
