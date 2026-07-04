import axios, { AxiosError, isAxiosError } from "axios";
import { config } from "../../config/env";
import { ExternalServiceError } from "../../shared/errors/app-error";
import {
  TmdbMovieDetailsResponse,
  TmdbSearchMoviesResponse,
} from "./tmdb.types";

const TMDB_TIMEOUT_MS = 10_000;

const tmdbHttpClient = axios.create({
  baseURL: config.tmdb.baseUrl,
  timeout: TMDB_TIMEOUT_MS,
  params: {
    language: "en-US",
  },
});

function ensureApiKeyConfigured(): void {
  if (!config.tmdb.apiKey) {
    throw new ExternalServiceError(
      503,
      "TMDB API key is not configured",
      "TMDB_NOT_CONFIGURED",
    );
  }
}

function handleTmdbClientError(error: unknown): never {
  if (isAxiosError(error)) {
    if (isTimeoutError(error)) {
      throw new ExternalServiceError(
        504,
        "TMDB request timed out",
        "TMDB_TIMEOUT",
      );
    }

    if (error.response) {
      const { status } = error.response;

      if (status >= 400 && status < 500) {
        throw new ExternalServiceError(
          502,
          "TMDB rejected the request",
          "TMDB_CLIENT_ERROR",
        );
      }

      if (status >= 500) {
        throw new ExternalServiceError(
          503,
          "TMDB is temporarily unavailable",
          "TMDB_UNAVAILABLE",
        );
      }
    }

    throw new ExternalServiceError(
      503,
      "Unable to reach TMDB",
      "TMDB_UNAVAILABLE",
    );
  }

  throw error;
}

function isTimeoutError(error: AxiosError): boolean {
  return (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT" ||
    error.message.toLowerCase().includes("timeout")
  );
}

export async function searchMoviesOnTmdb(
  query: string,
  page: number,
): Promise<TmdbSearchMoviesResponse> {
  ensureApiKeyConfigured();

  try {
    const { data } = await tmdbHttpClient.get<TmdbSearchMoviesResponse>(
      "/search/movie",
      {
        params: {
          api_key: config.tmdb.apiKey,
          query,
          page,
        },
      },
    );

    return data;
  } catch (error) {
    handleTmdbClientError(error);
  }
}

export async function getMovieDetailsFromTmdb(
  tmdbId: number,
): Promise<TmdbMovieDetailsResponse> {
  ensureApiKeyConfigured();

  try {
    const { data } = await tmdbHttpClient.get<TmdbMovieDetailsResponse>(
      `/movie/${tmdbId}`,
      {
        params: {
          api_key: config.tmdb.apiKey,
        },
      },
    );

    return data;
  } catch (error) {
    handleTmdbClientError(error);
  }
}
