import { Prisma } from "@/generated/prisma/client";

export async function withSerializableRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3
) {
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;

    try {
      return await operation();
    } catch (error) {
      const isTransientConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";

      if (!isTransientConflict || attempt === maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error("Serializable transaction retry limit reached.");
}
