import axios, { AxiosError, isAxiosError } from "axios";
import { config } from "../../config/env";
import {
  ExternalServiceError,
  NotFoundError,
} from "../../shared/errors/app-error";
import { logger } from "../../shared/logger";
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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

function isRetryableTmdbError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  if (isTimeoutError(error)) {
    return true;
  }

  if (!error.response) {
    return true;
  }

  return error.response.status >= 500;
}

async function withRetry<T>(
  operation: () => Promise<T>,
  context: { operation: string },
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.tmdb.maxRetryAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (
        !isRetryableTmdbError(error) ||
        attempt === config.tmdb.maxRetryAttempts
      ) {
        throw error;
      }

      const delayMs = config.tmdb.retryBaseDelayMs * 2 ** (attempt - 1);

      logger.warn(
        { attempt, delayMs, operation: context.operation },
        "TMDB request retry",
      );

      await sleep(delayMs);
    }
  }

  throw lastError;
}

export function isTmdbServiceUnavailable(error: unknown): boolean {
  return (
    error instanceof ExternalServiceError &&
    (error.code === "TMDB_TIMEOUT" ||
      error.code === "TMDB_UNAVAILABLE" ||
      error.code === "TMDB_NOT_CONFIGURED")
  );
}

function handleMovieNotFound(error: unknown): void {
  if (isAxiosError(error) && error.response?.status === 404) {
    throw new NotFoundError("Movie not found on TMDB");
  }
}

export async function searchMoviesOnTmdb(
  query: string,
  page: number,
): Promise<TmdbSearchMoviesResponse> {
  ensureApiKeyConfigured();

  try {
    return await withRetry(
      async () => {
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
      },
      { operation: "searchMovies" },
    );
  } catch (error) {
    handleTmdbClientError(error);
  }
}

export async function getMovieDetailsFromTmdb(
  tmdbId: number,
): Promise<TmdbMovieDetailsResponse> {
  ensureApiKeyConfigured();

  try {
    return await withRetry(
      async () => {
        const { data } = await tmdbHttpClient.get<TmdbMovieDetailsResponse>(
          `/movie/${tmdbId}`,
          {
            params: {
              api_key: config.tmdb.apiKey,
            },
          },
        );

        return data;
      },
      { operation: "getMovieDetails" },
    );
  } catch (error) {
    handleMovieNotFound(error);
    handleTmdbClientError(error);
  }
}
