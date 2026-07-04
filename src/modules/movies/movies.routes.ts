import { Router } from "express";
import { searchMovies } from "./movies.controller";

const moviesRouter = Router();

moviesRouter.get("/search", searchMovies);

export { moviesRouter };
