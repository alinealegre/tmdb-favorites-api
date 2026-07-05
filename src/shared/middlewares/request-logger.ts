import pinoHttp from "pino-http";
import { logger } from "../logger";

export const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === "/health",
  },
});
