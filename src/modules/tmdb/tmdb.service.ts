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
  const response = await searchMoviesOnTmdb(query, page);

  return {
    data: response.results.map(mapTmdbMovieToSummary),
    page: response.page,
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

export async function getMovieDetails(
  tmdbId: number,
): Promise<MovieSummaryDto> {
  const movie = await getMovieDetailsFromTmdb(tmdbId);
  return mapTmdbMovieToSummary(movie);
}
