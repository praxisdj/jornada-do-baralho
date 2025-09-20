import { EnvConfigurationError } from "@/lib/utils/errors";
import { assertRedisIsHealthy } from "@infra/scripts/redisHealthcheck";
import { Redis } from "ioredis";
import logger from "@logger";

let connection: Redis | undefined;

try {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new EnvConfigurationError(
      "REDIS_URL environment variable is not set",
    );
  }

  logger.info(`Attempting to connect to Redis at: ${redisUrl}`);

  connection = new Redis(redisUrl, {
    maxRetriesPerRequest: 3, // Limit retries to prevent infinite loop
    enableReadyCheck: false,
    connectTimeout: 5000, // 5 second timeout
    lazyConnect: true, // Don't connect immediately
  });

  // Add error event handler to prevent unhandled error events
  connection.on("error", (error) => {
    logger.error("Redis connection error:", error.message);
  });

  connection.on("connect", () => {
    logger.info("Connected to Redis");
  });

  connection.on("ready", () => {
    logger.info("Redis is ready");
  });

  connection.on("close", () => {
    logger.info("Redis connection closed");
  });

  // Manually connect
  await connection.connect();

  await assertRedisIsHealthy(connection);
  logger.info("Redis health check passed!");
} catch (error) {
  logger.error(
    "Error connecting to Redis:",
    error instanceof Error ? error.message : error,
  );
} finally {
  if (connection) {
    await connection.quit();
  }
}
