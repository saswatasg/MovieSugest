const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
}

export interface TMDBWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface TMDBWatchProviders {
  flatrate?: TMDBWatchProvider[];
  rent?: TMDBWatchProvider[];
  buy?: TMDBWatchProvider[];
  link?: string;
}

interface TMDBVideo {
  key: string;
  site: string;
  type: string;
}

const TMDB_IMG = 'https://image.tmdb.org/t/p';

export function tmdbImage(path: string | null, size: 'w200' | 'w342' | 'w500' | 'original' = 'w342'): string | null {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
}

async function tmdbFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', API_KEY || '');
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

export async function discoverMovies(params: {
  with_genres?: string;
  with_original_language?: string;
  watch_region?: string;
  with_watch_providers?: string;
  sort_by?: string;
  page?: number;
  year?: number;
}) {
  const queryParams: Record<string, string> = {
    sort_by: params.sort_by || 'popularity.desc',
    page: String(params.page || 1),
    'vote_count.gte': '50',
  };
  if (params.with_genres) queryParams.with_genres = params.with_genres;
  if (params.with_original_language) queryParams.with_original_language = params.with_original_language;
  if (params.watch_region) queryParams.watch_region = params.watch_region;
  if (params.with_watch_providers) queryParams.with_watch_providers = params.with_watch_providers;
  if (params.year) {
    queryParams['primary_release_year'] = String(params.year);
  }
  return tmdbFetch<{ results: TMDBMovie[]; total_pages: number; total_results: number }>(
    '/discover/movie',
    queryParams
  );
}

export async function getMovieWatchProviders(movieId: number): Promise<Record<string, TMDBWatchProviders>> {
  const data = await tmdbFetch<{ results: Record<string, TMDBWatchProviders> }>(
    `/movie/${movieId}/watch/providers`
  );
  return data.results || {};
}

export async function getMovieDetails(movieId: number) {
  return tmdbFetch<{
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    runtime: number;
    genres: { id: number; name: string }[];
    original_language: string;
    tagline: string;
  }>(`/movie/${movieId}`);
}

export async function getMovieVideos(movieId: number) {
  const data = await tmdbFetch<{ results: TMDBVideo[] }>(`/movie/${movieId}/videos`);
  const trailer = data.results.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  return trailer?.key || null;
}

export async function getTrendingMovies() {
  const data = await tmdbFetch<{ results: TMDBMovie[] }>('/trending/movie/week');
  return data.results;
}

export async function checkMovieInIndia(movieId: number): Promise<{
  available: boolean;
  providers: TMDBWatchProvider[];
}> {
  const providers = await getMovieWatchProviders(movieId);
  const india = providers['IN'];
  const flatrate = india?.flatrate || [];
  return {
    available: flatrate.length > 0,
    providers: flatrate,
  };
}

export async function fetchMoviesByIds(ids: number[]) {
  const movies = await Promise.all(
    ids.map((id) =>
      tmdbFetch<{
        id: number;
        title: string;
        overview: string;
        poster_path: string | null;
        backdrop_path: string | null;
        release_date: string;
        vote_average: number;
        genre_ids: number[];
        original_language: string;
      }>(`/movie/${id}`)
    )
  );
  return movies;
}

const GENRE_MAP: Record<string, number> = {
  romance: 10749,
  drama: 18,
  comedy: 35,
  animation: 16,
  thriller: 53,
  'coming-of-age': 18,
  'social-political': 18,
  literary: 18,
  whimsical: 14,
  comfort: 16,
  action: 28,
  horror: 27,
  documentary: 99,
};

export function getGenreIds(genreSlugs: string[]): string {
  const ids = genreSlugs
    .map((slug) => GENRE_MAP[slug])
    .filter(Boolean);
  return [...new Set(ids)].join(',');
}

const LANGUAGE_MAP: Record<string, string> = {
  english: 'en',
  hindi: 'hi',
  bengali: 'bn',
};

export function getLanguageCode(language: string): string | undefined {
  return LANGUAGE_MAP[language];
}

const GENRE_TO_TAG: Record<number, string> = {
  10749: 'soft-romance',
  18: 'social-drama',
  35: 'whimsical',
  16: 'comfort-cute',
  14: 'whimsical',
  53: 'thought-provoking',
};

export function assignTasteTagFromGenres(genreIds: number[]): string {
  for (const id of genreIds) {
    if (GENRE_TO_TAG[id]) return GENRE_TO_TAG[id];
  }
  return 'thought-provoking';
}
