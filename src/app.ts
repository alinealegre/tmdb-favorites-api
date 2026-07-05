import express from "express";
import { errorHandler } from "./shared/middlewares/error-handler";
import { favoritesRouter } from "./modules/favorites/favorites.routes";
import { healthRouter } from "./modules/health/health.routes";
import { moviesRouter } from "./modules/movies/movies.routes";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/movies", moviesRouter);
app.use("/favorites", favoritesRouter);

app.use(errorHandler);

export { app };
