import { Router } from "express";
import { config } from "../../config/env";
import { prisma } from "../../database/prisma";
import { pingRedis } from "../cache/redis.client";

const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  let database: "connected" | "disconnected" = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "connected";
  } catch {
    // keep disconnected
  }

  let redis: "connected" | "disconnected" | "not_configured" = "not_configured";

  if (config.redisUrl) {
    const isRedisAvailable = await pingRedis();
    redis = isRedisAvailable ? "connected" : "disconnected";
  }

  const isHealthy =
    database === "connected" &&
    (redis === "connected" || redis === "not_configured");
  const status = isHealthy ? "ok" : "degraded";

  res.status(status === "ok" ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database,
      redis,
    },
  });
});

export { healthRouter };
