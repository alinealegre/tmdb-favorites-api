import { z } from "zod";

export const searchMoviesQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type SearchMoviesQuery = z.infer<typeof searchMoviesQuerySchema>;

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(", ");
}
