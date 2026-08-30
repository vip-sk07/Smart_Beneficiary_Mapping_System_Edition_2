import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: 'rkgaming23072006@gmail.com' }
  });
  
  if (users.length > 0) {
    const user = users[0];
    console.log("User:", user.email);
    console.log("Has password:", !!user.password);
    
    // Test the password
    const passwordMatch = user.password ? await bcrypt.compare('karan2006', user.password) : false;
    console.log("Password matches 'karan2006':", passwordMatch);

    // Provide the user with a reset just in case
    if (!passwordMatch && user.password) {
        const hash = await bcrypt.hash('karan2006', 10);
        await prisma.user.update({
             where: { id: user.id },
             data: { password: hash }
        });
        console.log("Updated user password to 'karan2006'");
    }
  } else {
    console.log("User not found.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
