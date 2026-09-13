import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = "postgresql://neondb_owner:npg_QhbpFA3r0uTk@ep-winter-meadow-a19fcj8w-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const pool = new Pool({ connectionString });
  const email = "karanraj2006rk@gmail.com";
  const hashedPassword = await bcrypt.hash("Admin@1234", 12);

  await pool.query(`
    UPDATE "User" 
    SET role = 'ADMIN', password = $1, name = 'Karan Raj T'
    WHERE email = $2;
  `, [hashedPassword, email]);

  const check = await pool.query('SELECT id, name, email, role, (password IS NOT NULL) as has_password FROM "User" WHERE email = $1', [email]);
  console.log("✅ Verified Admin User in Neon Database:", check.rows[0]);

  await pool.end();
}

main().catch(console.error);
