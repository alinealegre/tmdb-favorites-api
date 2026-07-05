import { Favorite, Prisma } from "@prisma/client";
import {
  ExternalServiceError,
  NotFoundError,
} from "../../src/shared/errors/app-error";

jest.mock("../../src/modules/favorites/favorites.repository");
jest.mock("../../src/modules/tmdb/tmdb.service");

import * as favoritesRepository from "../../src/modules/favorites/favorites.repository";
import { getMovieDetails } from "../../src/modules/tmdb/tmdb.service";
import {
  addFavorite,
  listFavorites,
  rateFavorite,
  removeFavorite,
} from "../../src/modules/favorites/favorites.service";

const mockedRepository = jest.mocked(favoritesRepository);
const mockedGetMovieDetails = jest.mocked(getMovieDetails);

function buildFavorite(overrides: Partial<Favorite> = {}): Favorite {
  return {
    id: "fav-1",
    tmdbId: 603,
    title: "The Matrix",
    releaseYear: 1999,
    posterPath: "/matrix.jpg",
    overview: "A hacker discovers the truth.",
    watchedAt: null,
    rating: null,
    createdAt: new Date("2026-07-01T00:00:00.000Z"),
    updatedAt: new Date("2026-07-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("favorites.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addFavorite", () => {
    it("throws ConflictError when the movie is already in favorites", async () => {
      mockedRepository.findFavoriteByTmdbId.mockResolvedValue(buildFavorite());

      await expect(addFavorite(603)).rejects.toMatchObject({
        statusCode: 409,
        code: "CONFLICT",
      });

      expect(mockedGetMovieDetails).not.toHaveBeenCalled();
      expect(mockedRepository.createFavorite).not.toHaveBeenCalled();
    });

    it("creates a favorite when the movie is not in favorites", async () => {
      mockedRepository.findFavoriteByTmdbId.mockResolvedValue(null);
      mockedGetMovieDetails.mockResolvedValue({
        tmdbId: 603,
        title: "The Matrix",
        releaseYear: 1999,
        posterPath: "/matrix.jpg",
        overview: "A hacker discovers the truth.",
      });
      mockedRepository.createFavorite.mockResolvedValue(buildFavorite());

      const result = await addFavorite(603);

      expect(result.tmdbId).toBe(603);
      expect(mockedRepository.createFavorite).toHaveBeenCalledWith({
        tmdbId: 603,
        title: "The Matrix",
        releaseYear: 1999,
        posterPath: "/matrix.jpg",
        overview: "A hacker discovers the truth.",
      });
    });
  });

  describe("removeFavorite", () => {
    it("throws NotFoundError when the favorite does not exist", async () => {
      mockedRepository.deleteFavoriteByTmdbId.mockResolvedValue(false);

      await expect(removeFavorite(603)).rejects.toMatchObject({
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Favorite not found",
      });
    });
  });

  describe("rateFavorite", () => {
    it("throws ValidationError when the movie has not been watched", async () => {
      mockedRepository.findFavoriteByTmdbId.mockResolvedValue(buildFavorite());

      await expect(rateFavorite(603, 9.5)).rejects.toMatchObject({
        statusCode: 422,
        code: "VALIDATION_ERROR",
        message: "Movie must be marked as watched before rating",
      });

      expect(mockedRepository.updateFavoriteRating).not.toHaveBeenCalled();
    });

    it("updates the rating when the movie has been watched", async () => {
      mockedRepository.findFavoriteByTmdbId.mockResolvedValue(
        buildFavorite({ watchedAt: new Date("2026-07-05T00:00:00.000Z") }),
      );
      mockedRepository.updateFavoriteRating.mockResolvedValue(
        buildFavorite({
          watchedAt: new Date("2026-07-05T00:00:00.000Z"),
          rating: new Prisma.Decimal(9.5),
        }),
      );

      const result = await rateFavorite(603, 9.5);

      expect(result.rating).toBe(9.5);
      expect(mockedRepository.updateFavoriteRating).toHaveBeenCalledWith(
        603,
        9.5,
      );
    });
  });

  describe("listFavorites", () => {
    it("returns degraded=true when TMDB is unavailable and short-circuits remaining items", async () => {
      const favorites = [
        buildFavorite({ id: "fav-1", tmdbId: 603, title: "The Matrix" }),
        buildFavorite({ id: "fav-2", tmdbId: 27205, title: "Inception" }),
        buildFavorite({ id: "fav-3", tmdbId: 155, title: "The Dark Knight" }),
      ];

      mockedRepository.findAllFavorites.mockResolvedValue(favorites);
      mockedGetMovieDetails
        .mockResolvedValueOnce({
          tmdbId: 603,
          title: "The Matrix (TMDB)",
          releaseYear: 1999,
          posterPath: "/matrix-tmdb.jpg",
          overview: "Updated overview.",
        })
        .mockRejectedValueOnce(
          new ExternalServiceError(
            503,
            "TMDB is temporarily unavailable",
            "TMDB_UNAVAILABLE",
          ),
        );

      const result = await listFavorites();

      expect(result.degraded).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        tmdbId: 603,
        title: "The Matrix (TMDB)",
        enriched: true,
      });
      expect(result.data[1]).toMatchObject({
        tmdbId: 27205,
        title: "Inception",
        enriched: false,
      });
      expect(result.data[2]).toMatchObject({
        tmdbId: 155,
        title: "The Dark Knight",
        enriched: false,
      });
      expect(mockedGetMovieDetails).toHaveBeenCalledTimes(2);
    });

    it("returns degraded=false when a single movie is not found on TMDB", async () => {
      const favorites = [
        buildFavorite({ id: "fav-1", tmdbId: 603, title: "The Matrix" }),
        buildFavorite({ id: "fav-2", tmdbId: 999999, title: "Missing Movie" }),
      ];

      mockedRepository.findAllFavorites.mockResolvedValue(favorites);
      mockedGetMovieDetails
        .mockResolvedValueOnce({
          tmdbId: 603,
          title: "The Matrix (TMDB)",
          releaseYear: 1999,
          posterPath: "/matrix-tmdb.jpg",
          overview: "Updated overview.",
        })
        .mockRejectedValueOnce(new NotFoundError("Movie not found on TMDB"));

      const result = await listFavorites();

      expect(result.degraded).toBe(false);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        tmdbId: 603,
        enriched: true,
      });
      expect(result.data[1]).toMatchObject({
        tmdbId: 999999,
        title: "Missing Movie",
        enriched: false,
      });
      expect(mockedGetMovieDetails).toHaveBeenCalledTimes(2);
    });
  });
});
