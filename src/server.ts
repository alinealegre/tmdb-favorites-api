import "dotenv/config";

import { app } from "./app";
import { config } from "./config/env";
import { prisma } from "./database/prisma";

const server = app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});

async function shutdown(): Promise<void> {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
