import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

type GlobalForPrisma = {
  prisma?: PrismaClient;
};

let prismaClient: PrismaClient | undefined;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  if (prismaClient) return prismaClient;

  const globalForPrisma = globalThis as GlobalForPrisma;

  if (process.env.NODE_ENV === "production") {
    prismaClient = createPrismaClient();
    return prismaClient;
  }

  globalForPrisma.prisma ??= createPrismaClient();
  prismaClient = globalForPrisma.prisma;
  return prismaClient;
}

export function isMissingDatabaseUrlError(error: unknown): error is Error {
  return error instanceof Error && error.message === "DATABASE_URL is not set";
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    return Reflect.get(client as object, prop, client);
  },
});

export { prisma };
