/**
 * Prisma seed script — populates Categories, Schemes, and an Admin user sequentially.
 * Run with: npx tsx prisma/seed.ts
 */

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function main() {
  console.log("🌱 Seeding database sequentially...");

  // ─── Admin User First ───────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@sbms.gov.in";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@1234";

  const hashed = await bcrypt.hash(adminPassword, 12);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashed, role: "ADMIN" },
    create: {
      name: "Platform Admin",
      email: adminEmail,
      password: hashed,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Admin user created/verified: ${adminUser.email}`);

  // ─── Categories ─────────────────────────────────────────────
  const categoryDefs = [
    { name: "Agriculture", icon: "🌾", color: "#138808", description: "Schemes for farmers and agricultural workers" },
    { name: "Education", icon: "📚", color: "#1a38f5", description: "Scholarships and educational support schemes" },
    { name: "Health", icon: "🏥", color: "#dc2626", description: "Healthcare and medical insurance schemes" },
    { name: "Housing", icon: "🏠", color: "#7c3aed", description: "Housing and shelter schemes" },
    { name: "Women & Child", icon: "👩‍👧", color: "#db2777", description: "Welfare schemes for women and children" },
    { name: "Employment", icon: "💼", color: "#ff9933", description: "Employment and skill development schemes" },
    { name: "Social Security", icon: "🛡️", color: "#0891b2", description: "Pension and social security schemes" },
    { name: "Financial Inclusion", icon: "🏦", color: "#059669", description: "Banking and financial inclusion schemes" },
  ];

  const catMap: Record<string, string> = {};
  for (const catData of categoryDefs) {
    const cat = await prisma.category.upsert({
      where: { name: catData.name },
      update: {},
      create: catData,
    });
    catMap[cat.name] = cat.id;
  }
  console.log(`✅ ${Object.keys(catMap).length} categories seeded`);

  // ─── Sample Announcement ────────────────────────────────────
  await prisma.announcement.upsert({
    where: { id: "welcome-announcement" },
    update: {},
    create: {
      id: "welcome-announcement",
      title: "Welcome to Smart Beneficiary Mapping System",
      content: "We have launched SBMS to help every eligible Indian citizen discover and apply for government welfare schemes. Use BenefitBot AI to find the right schemes for you!",
      pinned: true,
      isActive: true,
    },
  });
  console.log("✅ Welcome announcement seeded");

  console.log("\n🎉 Database seeded successfully!");
  console.log(`\n📝 Admin credentials:\n   Email: ${adminEmail}\n   Password: ${adminPassword}\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
