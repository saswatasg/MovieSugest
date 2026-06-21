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

interface TMDBKeyword {
  id: number;
  name: string;
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
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

export async function discoverMovies(params: {
  with_genres?: string;
  with_original_language?: string;
  watch_region?: string;
  with_watch_providers?: string;
  with_keywords?: string;
  sort_by?: string;
  page?: number;
  year?: number;
  vote_count_gte?: string;
}) {
  const queryParams: Record<string, string> = {
    sort_by: params.sort_by || 'popularity.desc',
    page: String(params.page || 1),
  };
  if (params.vote_count_gte) queryParams['vote_count.gte'] = params.vote_count_gte;
  if (params.with_genres) queryParams.with_genres = params.with_genres;
  if (params.with_original_language) queryParams.with_original_language = params.with_original_language;
  if (params.watch_region) queryParams.watch_region = params.watch_region;
  if (params.with_watch_providers) queryParams.with_watch_providers = params.with_watch_providers;
  if (params.with_keywords) queryParams.with_keywords = params.with_keywords;
  if (params.year) queryParams['primary_release_year'] = String(params.year);
  return tmdbFetch<{ results: TMDBMovie[]; total_pages: number; total_results: number }>(
    '/discover/movie', queryParams
  );
}

export async function getMovieRecommendations(movieId: number, page = 1) {
  return tmdbFetch<{ results: TMDBMovie[] }>(`/movie/${movieId}/recommendations`, { page: String(page) });
}

export async function getSimilarMovies(movieId: number, page = 1) {
  return tmdbFetch<{ results: TMDBMovie[] }>(`/movie/${movieId}/similar`, { page: String(page) });
}

export async function getMovieKeywords(movieId: number) {
  const data = await tmdbFetch<{ keywords: TMDBKeyword[] }>(`/movie/${movieId}/keywords`);
  return data.keywords || [];
}

export async function getMovieWatchProviders(movieId: number): Promise<Record<string, TMDBWatchProviders>> {
  const data = await tmdbFetch<{ results: Record<string, TMDBWatchProviders> }>(
    `/movie/${movieId}/watch/providers`
  );
  return data.results || {};
}

export async function getMovieDetails(movieId: number) {
  return tmdbFetch<{
    id: number; title: string; overview: string; poster_path: string | null;
    backdrop_path: string | null; release_date: string; vote_average: number;
    runtime: number; genres: { id: number; name: string }[];
    original_language: string; tagline: string;
  }>(`/movie/${movieId}`);
}

export async function getMovieVideos(movieId: number) {
  const data = await tmdbFetch<{ results: TMDBVideo[] }>(`/movie/${movieId}/videos`);
  const trailer = data.results.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  return trailer?.key || null;
}

export async function checkMovieInIndia(movieId: number): Promise<{
  available: boolean; providers: TMDBWatchProvider[];
}> {
  const providers = await getMovieWatchProviders(movieId);
  const flatrate = providers['IN']?.flatrate || [];
  return { available: flatrate.length > 0, providers: flatrate };
}

export async function fetchMoviePoster(movieId: number): Promise<string | null> {
  try {
    const d = await tmdbFetch<{ poster_path: string | null }>(`/movie/${movieId}`);
    return d.poster_path;
  } catch {
    return null;
  }
}

const GENRE_MAP: Record<string, number> = {
  romance: 10749, drama: 18, comedy: 35, animation: 16, thriller: 53,
  'coming-of-age': 18, 'social-political': 18, literary: 18,
  whimsical: 14, comfort: 16, action: 28, horror: 27, documentary: 99,
};

export function getGenreIds(genreSlugs: string[]): string {
  const ids = genreSlugs.map((slug) => GENRE_MAP[slug]).filter(Boolean);
  return [...new Set(ids)].join(',');
}

const LANGUAGE_MAP: Record<string, string> = {
  english: 'en', hindi: 'hi', bengali: 'bn',
};

export function getLanguageCode(language: string): string | undefined {
  return LANGUAGE_MAP[language];
}

const GENRE_TO_TAG: Record<number, string> = {
  10749: 'soft-romance', 18: 'social-drama', 35: 'whimsical',
  16: 'comfort-cute', 14: 'whimsical', 53: 'thought-provoking',
};

export function assignTasteTagFromGenres(genreIds: number[]): string {
  for (const id of genreIds) {
    if (GENRE_TO_TAG[id]) return GENRE_TO_TAG[id];
  }
  return 'thought-provoking';
}

export const TASTE_KEYWORD_IDS: Record<string, number[]> = {
  'coming-of-age': [188952, 10756, 195230, 1446, 156051],
  'literary-melancholy': [158371, 198793, 150201, 177262, 207988],
  'whimsical': [2051, 9663, 9951, 156039, 207989],
  'social-drama': [1985, 3500, 10144, 187998, 207990],
  'soft-romance': [210024, 207991, 14736, 156231],
  'comfort-cute': [2245, 14601, 3803, 972, 207992],
  'filmy-romance': [210024, 207993, 14736, 188967],
  'thought-provoking': [833, 198793, 156121, 207988, 150201],
};

export const SEED_MOVIES_BY_TAG: Record<string, number[]> = {
  'coming-of-age': [21297, 339274, 391713, 20453, 61202],
  'literary-melancholy': [16727, 41252, 336203, 35790],
  'whimsical': [127501, 401285, 9502, 508947],
  'social-drama': [15774, 280795, 597089, 527511, 360814],
  'soft-romance': [21297, 653221, 191714, 509],
  'comfort-cute': [937278, 862, 354912, 150540, 332835],
  'filmy-romance': [509, 765019, 185008],
  'thought-provoking': [1402, 26237, 20453, 336203],
};

export async function getTasteRecommendations(params: {
  selectedTags: string[];
  language?: string;
  genres?: string;
  watchRegion?: string;
  watchProviders?: string;
}): Promise<{ movie: TMDBMovie; sourceTag: string }[]> {
  const seen = new Set<number>();
  const results: { movie: TMDBMovie; sourceTag: string }[] = [];

  const tagPool = params.selectedTags.length > 0
    ? params.selectedTags
    : Object.keys(SEED_MOVIES_BY_TAG);

  for (const tag of tagPool) {
    const seedIds = SEED_MOVIES_BY_TAG[tag] || [];
    for (const seedId of seedIds) {
      try {
        const [recs, similar] = await Promise.all([
          getMovieRecommendations(seedId),
          getSimilarMovies(seedId),
        ]);
        const combined = [...(recs.results || []), ...(similar.results || [])];
        for (const movie of combined) {
          if (seen.has(movie.id)) continue;
          seen.add(movie.id);
          if (params.language && movie.original_language !== params.language) continue;
          results.push({ movie, sourceTag: tag });
          if (results.length >= 80) break;
        }
      } catch {
        // skip
      }
      if (results.length >= 80) break;
    }
    if (results.length >= 80) break;
  }

  return results.sort((a, b) => b.movie.popularity - a.movie.popularity).slice(0, 60);
}

export async function discoverByTasteKeywords(params: {
  selectedTags: string[];
  with_original_language?: string;
  watch_region?: string;
  with_watch_providers?: string;
  sort_by?: string;
  page?: number;
}): Promise<TMDBMovie[]> {
  const seen = new Set<number>();
  const allMovies: TMDBMovie[] = [];

  const tagPool = params.selectedTags.length > 0
    ? params.selectedTags
    : Object.keys(TASTE_KEYWORD_IDS);

  for (const tag of tagPool) {
    const keywordIds = TASTE_KEYWORD_IDS[tag];
    if (!keywordIds || keywordIds.length === 0) continue;

    const orKeywords = keywordIds.slice(0, 3).join(',');
    try {
      const data = await discoverMovies({
        with_keywords: orKeywords,
        with_original_language: params.with_original_language,
        watch_region: params.watch_region,
        with_watch_providers: params.with_watch_providers,
        sort_by: params.sort_by || 'vote_average.desc',
        page: params.page || 1,
        vote_count_gte: '50',
      });
      for (const movie of data.results) {
        if (seen.has(movie.id)) continue;
        seen.add(movie.id);
        allMovies.push(movie);
        if (allMovies.length >= 80) break;
      }
    } catch {
      // skip
    }
    if (allMovies.length >= 80) break;
  }

  return allMovies.slice(0, 60);
}
