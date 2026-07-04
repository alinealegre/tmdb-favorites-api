import express from "express";
import { errorHandler } from "./shared/middlewares/error-handler";
import { healthRouter } from "./modules/health/health.routes";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);

app.use(errorHandler);

export { app };
