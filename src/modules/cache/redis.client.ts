import Redis from "ioredis";
import { config } from "../../config/env";
import { logger } from "../../shared/logger";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!config.redisUrl) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(config.redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    redisClient.on("error", (error) => {
      logger.warn({ err: error }, "Redis client error");
    });
  }

  return redisClient;
}

export async function pingRedis(): Promise<boolean> {
  const client = getRedisClient();

  if (!client) {
    return false;
  }

  try {
    if (client.status !== "ready") {
      await client.connect();
    }

    const response = await client.ping();
    return response === "PONG";
  } catch {
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient) {
    return;
  }

  await redisClient.quit();
  redisClient = null;
}
