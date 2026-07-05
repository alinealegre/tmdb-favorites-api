export function buildSearchCacheKey(query: string, page: number): string {
  const normalizedQuery = query.trim().toLowerCase();
  return `tmdb:search:${normalizedQuery}:${page}`;
}

export function buildMovieCacheKey(tmdbId: number): string {
  return `tmdb:movie:${tmdbId}`;
}
