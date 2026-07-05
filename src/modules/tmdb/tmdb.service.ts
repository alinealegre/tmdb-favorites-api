import { config } from "../../config/env";
import { logger } from "../../shared/logger";
import { buildMovieCacheKey, buildSearchCacheKey } from "../cache/cache.keys";
import { cacheGet, cacheSet } from "../cache/cache.service";
import { mapTmdbMovieToSummary, MovieSummaryDto } from "./tmdb.mapper";
import { getMovieDetailsFromTmdb, searchMoviesOnTmdb } from "./tmdb.client";

export interface SearchMoviesResult {
  data: MovieSummaryDto[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export async function searchMovies(
  query: string,
  page: number,
): Promise<SearchMoviesResult> {
  const cacheKey = buildSearchCacheKey(query, page);
  const cached = await cacheGet<SearchMoviesResult>(cacheKey);

  if (cached) {
    logger.debug({ cacheKey }, "TMDB cache hit");
    return cached;
  }

  logger.debug({ cacheKey }, "TMDB cache miss");

  const response = await searchMoviesOnTmdb(query, page);

  const result: SearchMoviesResult = {
    data: response.results.map(mapTmdbMovieToSummary),
    page: response.page,
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };

  await cacheSet(cacheKey, result, config.cache.searchTtlSeconds);

  return result;
}

export async function getMovieDetails(
  tmdbId: number,
): Promise<MovieSummaryDto> {
  const cacheKey = buildMovieCacheKey(tmdbId);
  const cached = await cacheGet<MovieSummaryDto>(cacheKey);

  if (cached) {
    logger.debug({ cacheKey }, "TMDB cache hit");
    return cached;
  }

  logger.debug({ cacheKey }, "TMDB cache miss");

  const movie = await getMovieDetailsFromTmdb(tmdbId);
  const result = mapTmdbMovieToSummary(movie);

  await cacheSet(cacheKey, result, config.cache.movieTtlSeconds);

  return result;
}
