import prisma from "@/lib/prisma";
import logger from "@logger";
import { assertDatabaseIsHealthy } from "@infra/scripts/postgresHealthcheck";
import { EnvConfigurationError } from "@/lib/utils/errors";

try {
  if (!process.env.DATABASE_URL) {
    throw new EnvConfigurationError(
      "DATABASE_URL environment variable is not set",
    );
  }

  if (!process.env.NODE_ENV) {
    throw new EnvConfigurationError("NODE_ENV environment variable is not set");
  }

  logger.info(`Testing Prisma connection on host: ${process.env.NODE_ENV}`);
  logger.info(`Using host: ${process.env.DATABASE_URL}`);

  await assertDatabaseIsHealthy();
} catch (error) {
  logger.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
  logger.info("Disconnected from Prisma.");
}

logger.info("Test completed.");
