export interface TmdbSearchMovieResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string;
}

export interface TmdbSearchMoviesResponse {
  page: number;
  results: TmdbSearchMovieResult[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMovieDetailsResponse {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
  overview?: string;
}
