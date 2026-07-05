import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./openapi.spec";

export function setupSwagger(app: Express): void {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.get("/docs.json", (_req: Request, res: Response) => {
    res.json(openApiSpec);
  });
}
