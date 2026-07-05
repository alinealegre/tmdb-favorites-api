import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../../shared/errors/app-error";
import {
  addFavoriteBodySchema,
  formatZodError,
  tmdbIdParamSchema,
} from "./favorites.dto";
import * as favoritesService from "./favorites.service";

export async function addFavorite(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedBody = addFavoriteBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
      throw new ValidationError(formatZodError(parsedBody.error));
    }

    const favorite = await favoritesService.addFavorite(parsedBody.data.tmdbId);

    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
}

export async function removeFavorite(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedParams = tmdbIdParamSchema.safeParse(req.params);

    if (!parsedParams.success) {
      throw new ValidationError(formatZodError(parsedParams.error));
    }

    await favoritesService.removeFavorite(parsedParams.data.tmdbId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listFavorites(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await favoritesService.listFavorites();

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
