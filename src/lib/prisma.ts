import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

export type StockWisePrismaClient = InstanceType<typeof PrismaClient>;
type StockWisePrismaClientOptions = ConstructorParameters<typeof PrismaClient>[0];

const globalForPrisma = globalThis as typeof globalThis & {
  prismaAdapter?: PrismaPg;
  prisma?: InstanceType<typeof PrismaClient>;
};

export function createPrismaClient(options: StockWisePrismaClientOptions) {
  return new PrismaClient(options);
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return databaseUrl;
}

function getPrismaAdapter() {
  if (!globalForPrisma.prismaAdapter) {
    globalForPrisma.prismaAdapter = new PrismaPg(getDatabaseUrl());
  }

  return globalForPrisma.prismaAdapter;
}

export function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient({
      adapter: getPrismaAdapter(),
    });
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();

export function resetPrismaClient() {
  globalForPrisma.prisma?.$disconnect().catch(() => {
    // Ignore disconnect errors during local reset operations.
  });
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaAdapter = undefined;
}
