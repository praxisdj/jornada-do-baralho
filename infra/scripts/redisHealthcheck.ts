import logger from "@logger";
import { Redis } from "ioredis";

export async function assertRedisIsHealthy(redis: Redis): Promise<void> {
  try {
    const pong = await redis.ping();
    if (pong !== "PONG") {
      throw new Error("Unexpected PING response: " + pong);
    }
    logger.info("[healthcheck] Redis connection OK");
  } catch (error) {
    logger.error("[healthcheck] Redis connection failed:", error);
    throw new Error("Redis connection failed");
  }
}
