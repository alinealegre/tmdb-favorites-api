import "dotenv/config";

import { app } from "./app";
import { config } from "./config/env";
import { disconnectRedis } from "./modules/cache/redis.client";
import { prisma } from "./database/prisma";
import { logger } from "./shared/logger";

const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, "Server started");
});

async function shutdown(): Promise<void> {
  logger.info("Shutting down");
  await prisma.$disconnect();
  await disconnectRedis();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
