import * as tmdbService from "../tmdb/tmdb.service";

export async function searchMovies(query: string, page: number) {
  return tmdbService.searchMovies(query, page);
}
