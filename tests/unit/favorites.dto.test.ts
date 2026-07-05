import {
  addFavoriteBodySchema,
  rateFavoriteBodySchema,
  tmdbIdParamSchema,
} from "../../src/modules/favorites/favorites.dto";

describe("favorites.dto", () => {
  describe("addFavoriteBodySchema", () => {
    it("accepts a positive integer tmdbId", () => {
      const result = addFavoriteBodySchema.safeParse({ tmdbId: 603 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tmdbId).toBe(603);
      }
    });

    it("rejects invalid tmdbId values", () => {
      expect(addFavoriteBodySchema.safeParse({ tmdbId: 0 }).success).toBe(
        false,
      );
      expect(addFavoriteBodySchema.safeParse({ tmdbId: -1 }).success).toBe(
        false,
      );
      expect(addFavoriteBodySchema.safeParse({ tmdbId: "abc" }).success).toBe(
        false,
      );
    });
  });

  describe("tmdbIdParamSchema", () => {
    it("coerces string path params to positive integers", () => {
      const result = tmdbIdParamSchema.safeParse({ tmdbId: "603" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tmdbId).toBe(603);
      }
    });
  });

  describe("rateFavoriteBodySchema", () => {
    it("accepts ratings between 0 and 10", () => {
      expect(rateFavoriteBodySchema.safeParse({ rating: 0 }).success).toBe(
        true,
      );
      expect(rateFavoriteBodySchema.safeParse({ rating: 9.5 }).success).toBe(
        true,
      );
      expect(rateFavoriteBodySchema.safeParse({ rating: 10 }).success).toBe(
        true,
      );
    });

    it("rejects ratings outside the 0-10 range", () => {
      expect(rateFavoriteBodySchema.safeParse({ rating: -1 }).success).toBe(
        false,
      );
      expect(rateFavoriteBodySchema.safeParse({ rating: 10.1 }).success).toBe(
        false,
      );
      expect(rateFavoriteBodySchema.safeParse({ rating: "high" }).success).toBe(
        false,
      );
    });
  });
});
