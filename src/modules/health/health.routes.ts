import { Router } from "express";
import { prisma } from "../../database/prisma";

const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  let database: "connected" | "disconnected" = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "connected";
  } catch {
    // keep disconnected
  }

  const status = database === "connected" ? "ok" : "degraded";

  res.status(status === "ok" ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database,
      redis: "not_configured",
    },
  });
});

export { healthRouter };
