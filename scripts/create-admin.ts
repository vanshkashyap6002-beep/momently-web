/**
 * Bootstraps the single initial Admin Panel account.
 *
 * Safe to run any number of times: it checks for an existing user with
 * this email first and does nothing if found — it will never create a
 * duplicate admin, and never touches an existing account's password or
 * role if one already exists under this email.
 *
 * Run with: npm run admin:bootstrap  (wraps `tsx scripts/create-admin.ts`)
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@momently.com";
const ADMIN_PASSWORD = "Admin@123456";
const ADMIN_NAME = "Momently Admin";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    console.log(`Admin account already exists (${ADMIN_EMAIL}) — no action taken.`);
    return;
  }

  // Same bcrypt implementation already used everywhere else in the app
  // (lib/auth.ts, app/api/auth/signup/route.ts) — 10 salt rounds.
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await prisma.user.create({
    data: {
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`Created initial admin account: ${ADMIN_EMAIL}`);
  console.log("Log in at /admin-panel and change this password immediately.");
}

main()
  .catch((err) => {
    console.error("Failed to bootstrap admin account:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
