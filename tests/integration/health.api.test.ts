import request from "supertest";
import { app } from "../../src/app";
import { disconnectRedis } from "../../src/modules/cache/redis.client";
import { prisma } from "../../src/database/prisma";

describe("GET /health", () => {
  afterAll(async () => {
    await prisma.$disconnect();
    await disconnectRedis();
  });

  it("returns 200 with database connected", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.services.database).toBe("connected");
  });
});
