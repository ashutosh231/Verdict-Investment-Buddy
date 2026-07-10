import { prisma } from "./prisma.js";

/**
 * Connect to MySQL via Prisma.
 * A single client is reused across the process lifetime.
 */
export async function connectDB() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL");
  }

  await prisma.$connect();
  console.log("MySQL connected");
  return prisma;
}

export async function disconnectDB() {
  await prisma.$disconnect();
}
