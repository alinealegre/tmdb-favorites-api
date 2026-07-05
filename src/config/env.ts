import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
  databaseUrl: process.env.DATABASE_URL || "",
  redisUrl: process.env.REDIS_URL || "",
  cache: {
    searchTtlSeconds: Number(process.env.CACHE_TTL_SEARCH_SECONDS) || 900,
    movieTtlSeconds: Number(process.env.CACHE_TTL_MOVIE_SECONDS) || 3600,
  },
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || "",
    baseUrl: process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3",
    maxRetryAttempts: Number(process.env.TMDB_RETRY_MAX_ATTEMPTS) || 3,
    retryBaseDelayMs: Number(process.env.TMDB_RETRY_BASE_DELAY_MS) || 200,
  },
} as const;
