import prisma from "@lib/prisma";
import logger from "@logger";

/**
 * Checks if the Prisma connection to the database is working.
 * Throws an error if it fails.
 */
export async function assertDatabaseIsHealthy(): Promise<void> {
  try {
    const result = await prisma.$executeRaw`SELECT COUNT(*) FROM "User"`;
    logger.info(`[healthcheck] Prisma connection OK (result: ${result})`);
  } catch (error) {
    logger.error("[healthcheck] Prisma connection failed:", error);
    throw new Error("Database connection failed");
  } finally {
    await prisma.$disconnect();
  }
}
