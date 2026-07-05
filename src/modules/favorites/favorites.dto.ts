import { z } from "zod";

export const addFavoriteBodySchema = z.object({
  tmdbId: z.coerce.number().int().positive("tmdbId must be a positive integer"),
});

export const tmdbIdParamSchema = z.object({
  tmdbId: z.coerce.number().int().positive("tmdbId must be a positive integer"),
});

export type AddFavoriteBody = z.infer<typeof addFavoriteBodySchema>;
export type TmdbIdParam = z.infer<typeof tmdbIdParamSchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(", ");
}
