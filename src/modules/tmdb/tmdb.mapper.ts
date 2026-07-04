import { TmdbMovieDetailsResponse, TmdbSearchMovieResult } from "./tmdb.types";

export interface MovieSummaryDto {
  tmdbId: number;
  title: string;
  releaseYear: number | null;
  posterPath: string | null;
  overview: string | null;
}

function extractReleaseYear(releaseDate?: string): number | null {
  if (!releaseDate || releaseDate.length < 4) {
    return null;
  }

  const year = Number(releaseDate.slice(0, 4));
  return Number.isNaN(year) ? null : year;
}

export function mapTmdbMovieToSummary(
  movie: TmdbSearchMovieResult | TmdbMovieDetailsResponse,
): MovieSummaryDto {
  return {
    tmdbId: movie.id,
    title: movie.title,
    releaseYear: extractReleaseYear(movie.release_date),
    posterPath: movie.poster_path ?? null,
    overview: movie.overview ?? null,
  };
}
