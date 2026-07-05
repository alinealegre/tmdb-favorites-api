import { logger } from "../../shared/logger";
import { getRedisClient } from "./redis.client";

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();

  if (!client) {
    return null;
  }

  try {
    if (client.status !== "ready") {
      await client.connect();
    }

    const value = await client.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    logger.warn({ key, err: error }, "Redis cache get failed");
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  const client = getRedisClient();

  if (!client) {
    return;
  }

  try {
    if (client.status !== "ready") {
      await client.connect();
    }

    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    logger.warn({ key, err: error }, "Redis cache set failed");
  }
}
