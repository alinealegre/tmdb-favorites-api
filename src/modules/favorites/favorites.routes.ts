import { Router } from "express";
import {
  addFavorite,
  listFavorites,
  markAsWatched,
  rateFavorite,
  removeFavorite,
} from "./favorites.controller";

const favoritesRouter = Router();

favoritesRouter.post("/", addFavorite);
favoritesRouter.get("/", listFavorites);
favoritesRouter.patch("/:tmdbId/watched", markAsWatched);
favoritesRouter.patch("/:tmdbId/rating", rateFavorite);
favoritesRouter.delete("/:tmdbId", removeFavorite);

export { favoritesRouter };
