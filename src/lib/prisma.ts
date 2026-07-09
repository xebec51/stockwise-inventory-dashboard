import { PrismaClient } from "@/generated/prisma/client";

export type StockWisePrismaClient = InstanceType<typeof PrismaClient>;
export type StockWisePrismaClientOptions =
  ConstructorParameters<typeof PrismaClient>[0];

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: InstanceType<typeof PrismaClient>;
};

export function createPrismaClient(options: StockWisePrismaClientOptions) {
  return new PrismaClient(options);
}

export function getPrismaClient(options: StockWisePrismaClientOptions) {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient(options);
  }

  return globalForPrisma.prisma;
}

export function resetPrismaClient() {
  globalForPrisma.prisma = undefined;
}
