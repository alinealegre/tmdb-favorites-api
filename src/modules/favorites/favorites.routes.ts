import { Router } from "express";
import {
  addFavorite,
  listFavorites,
  removeFavorite,
} from "./favorites.controller";

const favoritesRouter = Router();

favoritesRouter.post("/", addFavorite);
favoritesRouter.get("/", listFavorites);
favoritesRouter.delete("/:tmdbId", removeFavorite);

export { favoritesRouter };
