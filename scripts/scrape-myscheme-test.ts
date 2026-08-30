import { prisma } from "../src/lib/prisma";

async function run() {
  const categoryName = "Business & Entrepreneurship";
  console.log("Upserting category:", categoryName);
  try {
    const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName, description: `${categoryName} welfare schemes` },
      });
      console.log("Success", category);
  } catch (e) {
      console.error(e);
  }
  process.exit(0);
}
run();
