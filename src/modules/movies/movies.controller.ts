import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../../shared/errors/app-error";
import { formatZodError, searchMoviesQuerySchema } from "./movies.dto";
import * as moviesService from "./movies.service";

export async function searchMovies(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedQuery = searchMoviesQuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
      throw new ValidationError(formatZodError(parsedQuery.error));
    }

    const { q, page } = parsedQuery.data;
    const result = await moviesService.searchMovies(q, page);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
