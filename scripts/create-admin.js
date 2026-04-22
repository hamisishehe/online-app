/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { randomBytes, scryptSync } = require("crypto");

const KEY_LENGTH = 64;

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULLNAME || "Admin";
  const phoneNumber = process.env.ADMIN_PHONE || "0000000000";

  if (!email || !password) {
    console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in env.");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("User already exists:", email);
    return;
  }

  await prisma.user.create({
    data: {
      fullName,
      email,
      phoneNumber,
      passwordHash: hashPassword(password),
      role: "ADMIN",
    },
  });

  console.log("Admin created:", email);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
