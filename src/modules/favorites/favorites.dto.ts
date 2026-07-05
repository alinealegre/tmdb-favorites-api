import { z } from "zod";

export const addFavoriteBodySchema = z.object({
  tmdbId: z.coerce.number().int().positive("tmdbId must be a positive integer"),
});

export const tmdbIdParamSchema = z.object({
  tmdbId: z.coerce.number().int().positive("tmdbId must be a positive integer"),
});

export const rateFavoriteBodySchema = z.object({
  rating: z.coerce
    .number()
    .min(0, "Rating must be between 0 and 10")
    .max(10, "Rating must be between 0 and 10"),
});

export type AddFavoriteBody = z.infer<typeof addFavoriteBodySchema>;
export type TmdbIdParam = z.infer<typeof tmdbIdParamSchema>;
export type RateFavoriteBody = z.infer<typeof rateFavoriteBodySchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(", ");
}
