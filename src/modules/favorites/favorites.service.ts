import { Favorite } from "@prisma/client";
import { MovieSummaryDto } from "../tmdb/tmdb.mapper";
import { getMovieDetails } from "../tmdb/tmdb.service";
import { isTmdbServiceUnavailable } from "../tmdb/tmdb.client";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../shared/errors/app-error";
import * as favoritesRepository from "./favorites.repository";

export interface FavoriteResponse {
  id: string;
  tmdbId: number;
  title: string;
  releaseYear: number | null;
  posterPath: string | null;
  overview: string | null;
  watchedAt: string | null;
  rating: number | null;
}

export interface FavoriteListItemResponse extends FavoriteResponse {
  enriched: boolean;
}

export interface ListFavoritesResult {
  data: FavoriteListItemResponse[];
  degraded: boolean;
}

function mapRating(rating: Favorite["rating"]): number | null {
  if (rating === null) {
    return null;
  }

  return Number(rating);
}

function mapFavoriteToResponse(favorite: Favorite): FavoriteResponse {
  return {
    id: favorite.id,
    tmdbId: favorite.tmdbId,
    title: favorite.title,
    releaseYear: favorite.releaseYear,
    posterPath: favorite.posterPath,
    overview: favorite.overview,
    watchedAt: favorite.watchedAt?.toISOString() ?? null,
    rating: mapRating(favorite.rating),
  };
}

function mapFavoriteToListItem(
  favorite: Favorite,
  enriched: boolean,
  movie?: MovieSummaryDto,
): FavoriteListItemResponse {
  const base = mapFavoriteToResponse(favorite);

  if (enriched && movie) {
    return {
      ...base,
      title: movie.title,
      releaseYear: movie.releaseYear,
      posterPath: movie.posterPath,
      overview: movie.overview,
      enriched: true,
    };
  }

  return {
    ...base,
    enriched: false,
  };
}

export async function addFavorite(tmdbId: number): Promise<FavoriteResponse> {
  const existing = await favoritesRepository.findFavoriteByTmdbId(tmdbId);

  if (existing) {
    throw new ConflictError("Movie is already in favorites");
  }

  const movie = await getMovieDetails(tmdbId);

  const favorite = await favoritesRepository.createFavorite({
    tmdbId: movie.tmdbId,
    title: movie.title,
    releaseYear: movie.releaseYear,
    posterPath: movie.posterPath,
    overview: movie.overview,
  });

  return mapFavoriteToResponse(favorite);
}

export async function removeFavorite(tmdbId: number): Promise<void> {
  const deleted = await favoritesRepository.deleteFavoriteByTmdbId(tmdbId);

  if (!deleted) {
    throw new NotFoundError("Favorite not found");
  }
}

export async function listFavorites(): Promise<ListFavoritesResult> {
  const favorites = await favoritesRepository.findAllFavorites();

  if (favorites.length === 0) {
    return { data: [], degraded: false };
  }

  const data: FavoriteListItemResponse[] = [];

  for (let index = 0; index < favorites.length; index += 1) {
    const favorite = favorites[index];

    try {
      const movie = await getMovieDetails(favorite.tmdbId);
      data.push(mapFavoriteToListItem(favorite, true, movie));
    } catch (error) {
      if (isTmdbServiceUnavailable(error)) {
        data.push(mapFavoriteToListItem(favorite, false));

        for (
          let nextIndex = index + 1;
          nextIndex < favorites.length;
          nextIndex += 1
        ) {
          data.push(mapFavoriteToListItem(favorites[nextIndex], false));
        }

        return { data, degraded: true };
      }

      if (error instanceof NotFoundError) {
        data.push(mapFavoriteToListItem(favorite, false));
        continue;
      }

      throw error;
    }
  }

  return { data, degraded: false };
}

export async function markAsWatched(tmdbId: number): Promise<FavoriteResponse> {
  const favorite = await favoritesRepository.updateFavoriteWatchedAt(
    tmdbId,
    new Date(),
  );

  if (!favorite) {
    throw new NotFoundError("Favorite not found");
  }

  return mapFavoriteToResponse(favorite);
}

export async function rateFavorite(
  tmdbId: number,
  rating: number,
): Promise<FavoriteResponse> {
  const favorite = await favoritesRepository.findFavoriteByTmdbId(tmdbId);

  if (!favorite) {
    throw new NotFoundError("Favorite not found");
  }

  if (!favorite.watchedAt) {
    throw new ValidationError("Movie must be marked as watched before rating");
  }

  const updated = await favoritesRepository.updateFavoriteRating(
    tmdbId,
    rating,
  );

  if (!updated) {
    throw new NotFoundError("Favorite not found");
  }

  return mapFavoriteToResponse(updated);
}
