import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { logger } from "../logger";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  logger.error({ err }, "Unhandled error");

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      statusCode: 500,
    },
  });
}
