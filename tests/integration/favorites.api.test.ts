jest.mock("../../src/modules/tmdb/tmdb.client", () => ({
  isTmdbServiceUnavailable: jest.requireActual<
    typeof import("../../src/modules/tmdb/tmdb.client")
  >("../../src/modules/tmdb/tmdb.client").isTmdbServiceUnavailable,
  searchMoviesOnTmdb: jest.fn(),
  getMovieDetailsFromTmdb: jest.fn(),
}));

import request from "supertest";
import { app } from "../../src/app";
import { disconnectRedis } from "../../src/modules/cache/redis.client";
import { prisma } from "../../src/database/prisma";
import { getMovieDetailsFromTmdb } from "../../src/modules/tmdb/tmdb.client";

const matrixTmdbResponse = {
  id: 603,
  title: "The Matrix",
  release_date: "1999-03-31",
  poster_path: "/matrix.jpg",
  overview: "A computer hacker learns from mysterious rebels.",
};

describe("favorites API", () => {
  beforeEach(async () => {
    await prisma.favorite.deleteMany();
    jest.mocked(getMovieDetailsFromTmdb).mockResolvedValue(matrixTmdbResponse);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await disconnectRedis();
  });

  it("runs the main favorites flow", async () => {
    const createResponse = await request(app)
      .post("/favorites")
      .send({ tmdbId: 603 });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.tmdbId).toBe(603);
    expect(createResponse.body.title).toBe("The Matrix");

    const duplicateResponse = await request(app)
      .post("/favorites")
      .send({ tmdbId: 603 });

    expect(duplicateResponse.status).toBe(409);

    const rateWithoutWatchedResponse = await request(app)
      .patch("/favorites/603/rating")
      .send({ rating: 9.5 });

    expect(rateWithoutWatchedResponse.status).toBe(422);

    const watchedResponse = await request(app).patch("/favorites/603/watched");

    expect(watchedResponse.status).toBe(200);
    expect(watchedResponse.body.watchedAt).not.toBeNull();

    const rateResponse = await request(app)
      .patch("/favorites/603/rating")
      .send({ rating: 9.5 });

    expect(rateResponse.status).toBe(200);
    expect(rateResponse.body.rating).toBe(9.5);

    const listResponse = await request(app).get("/favorites");

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].tmdbId).toBe(603);

    const deleteResponse = await request(app).delete("/favorites/603");

    expect(deleteResponse.status).toBe(204);

    const deleteAgainResponse = await request(app).delete("/favorites/603");

    expect(deleteAgainResponse.status).toBe(404);
  });
});
