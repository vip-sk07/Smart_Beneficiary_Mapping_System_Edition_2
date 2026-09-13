import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = "postgresql://neondb_owner:npg_QhbpFA3r0uTk@ep-winter-meadow-a19fcj8w-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function testPrisma() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const count = await prisma.user.count();
  console.log("Prisma user count:", count);
  const admin = await prisma.user.findUnique({ where: { email: "karanraj2006rk@gmail.com" } });
  console.log("Prisma admin query:", admin);
  
  await prisma.$disconnect();
  await pool.end();
}

testPrisma().catch(console.error);
