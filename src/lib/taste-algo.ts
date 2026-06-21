import {
  getMovieRecommendations, getSimilarMovies, discoverMovies,
  SEED_MOVIES_BY_TAG, TASTE_KEYWORD_IDS,
  TMDBMovie,
} from './tmdb';

export interface ScoredSuggestion {
  id: number;
  title: string;
  year?: number;
  posterPath: string | null;
  score: number;
  matchedTags: string[];
  voteAverage: number;
  genreIds: number[];
}

interface AlgoOptions {
  tasteTags: string[];
  language?: string;
  excludeIds: number[];
}

const TMDB_GENRE_TO_TASTE: Record<number, string> = {
  18: 'social-drama',
  10749: 'soft-romance',
  35: 'whimsical',
  16: 'comfort-cute',
  14: 'whimsical',
  12: 'coming-of-age',
  10751: 'comfort-cute',
  80: 'social-drama',
  36: 'literary-melancholy',
  9648: 'thought-provoking',
  99: 'thought-provoking',
  10402: 'literary-melancholy',
};

const TASTE_GENRE_IDS: Record<string, number[]> = {
  'coming-of-age': [18, 12, 10751],
  'literary-melancholy': [18, 36, 10402],
  'whimsical': [35, 14, 16],
  'social-drama': [18, 80],
  'soft-romance': [10749, 10751],
  'comfort-cute': [16, 10751, 35],
  'filmy-romance': [10749, 18],
  'thought-provoking': [9648, 99, 18, 53],
};

function detectMatchingTags(genreIds: number[], tasteTags: string[]): string[] {
  const matched = new Set<string>();
  for (const gid of genreIds) {
    const tagFromGenre = TMDB_GENRE_TO_TASTE[gid];
    if (tagFromGenre && tasteTags.includes(tagFromGenre)) {
      matched.add(tagFromGenre);
    }
  }
  return [...matched];
}

function computeScore(
  sourceWeight: number,
  detectedTags: string[],
  movie: TMDBMovie,
): number {
  let score = sourceWeight;
  score += Math.min(detectedTags.length - 1, 3) * 2;
  if (movie.vote_average >= 7) score += 2;
  if (movie.vote_average >= 8) score += 1;
  if (movie.poster_path) score += 1;
  if (movie.popularity > 10) score += 1;
  return score;
}

async function collectCandidates(options: AlgoOptions): Promise<Map<number, ScoredCandidate>> {
  const { tasteTags, language, excludeIds } = options;
  const candidateMap = new Map<number, ScoredCandidate>();
  const excludeSet = new Set(excludeIds);

  const langFilter = language && language !== 'all'
    ? { english: 'en', hindi: 'hi', bengali: 'bn' }[language]
    : undefined;

  for (const tag of tasteTags) {
    const seedIds = SEED_MOVIES_BY_TAG[tag] || [];
    const seedsToUse = seedIds.slice(0, tag === tasteTags[0] ? 3 : 2);

    const tagResults: { movie: TMDBMovie; weight: number }[] = [];

    for (const seedId of seedsToUse) {
      try {
        const [recs, similar] = await Promise.all([
          getMovieRecommendations(seedId),
          getSimilarMovies(seedId),
        ]);
        for (const m of recs.results || []) {
          if (!excludeSet.has(m.id) && (!langFilter || m.original_language === langFilter)) {
            tagResults.push({ movie: m, weight: 3 });
          }
        }
        for (const m of similar.results || []) {
          if (!excludeSet.has(m.id) && (!langFilter || m.original_language === langFilter)) {
            tagResults.push({ movie: m, weight: 2 });
          }
        }
      } catch {}
    }

    try {
      const keywordIds = TASTE_KEYWORD_IDS[tag];
      if (keywordIds && keywordIds.length > 0) {
        const kw = await discoverMovies({
          with_keywords: keywordIds.slice(0, 3).join(','),
          with_original_language: langFilter,
          watch_region: 'IN',
          with_watch_providers: '8|9|342|350|385|220',
          sort_by: 'vote_average.desc',
          vote_count_gte: '50',
        });
        for (const m of kw.results || []) {
          if (!excludeSet.has(m.id)) {
            tagResults.push({ movie: m, weight: 2 });
          }
        }
      }
    } catch {}

    const genreIds = TASTE_GENRE_IDS[tag];
    if (genreIds && genreIds.length > 0) {
      try {
        const gd = await discoverMovies({
          with_genres: genreIds.join(','),
          with_original_language: langFilter,
          watch_region: 'IN',
          with_watch_providers: '8|9|342|350|385|220',
          sort_by: 'popularity.desc',
          vote_count_gte: '100',
        });
        for (const m of gd.results || []) {
          if (!excludeSet.has(m.id)) {
            tagResults.push({ movie: m, weight: 1 });
          }
        }
      } catch {}
    }

    for (const { movie, weight } of tagResults) {
      const existing = candidateMap.get(movie.id);
      const detected = detectMatchingTags(movie.genre_ids, tasteTags);
      if (existing) {
        existing.rawWeight += weight;
        for (const dt of detected) existing.detectedTags.add(dt);
      } else {
        candidateMap.set(movie.id, {
          id: movie.id,
          title: movie.title,
          year: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : undefined,
          posterPath: movie.poster_path,
          rawWeight: weight,
          detectedTags: new Set(detected),
          voteAverage: movie.vote_average,
          genreIds: movie.genre_ids,
        });
      }
    }
  }

  return candidateMap;
}

interface ScoredCandidate {
  id: number;
  title: string;
  year?: number;
  posterPath: string | null;
  rawWeight: number;
  detectedTags: Set<string>;
  voteAverage: number;
  genreIds: number[];
}

function scoreAndRank(candidateMap: Map<number, ScoredCandidate>, tasteTags: string[]): ScoredSuggestion[] {
  const scored: ScoredSuggestion[] = [];

  for (const candidate of candidateMap.values()) {
    const detectedTags = [...candidate.detectedTags].filter(t => tasteTags.includes(t));
    if (detectedTags.length === 0) continue;

    let score = candidate.rawWeight;
    score += (detectedTags.length - 1) * 3;
    if (candidate.voteAverage >= 7) score += 2;
    if (candidate.voteAverage >= 8) score += 1;
    if (candidate.posterPath) score += 1;

    scored.push({
      id: candidate.id,
      title: candidate.title,
      year: candidate.year,
      posterPath: candidate.posterPath,
      score,
      matchedTags: detectedTags,
      voteAverage: candidate.voteAverage,
      genreIds: candidate.genreIds,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function weightedSelect(scored: ScoredSuggestion[], count: number): ScoredSuggestion[] {
  if (scored.length <= count) return scored;

  const selected: ScoredSuggestion[] = [];
  const maxScore = scored[0]?.score || 1;

  const buckets: ScoredSuggestion[][] = [[], [], []];
  for (const s of scored) {
    const ratio = s.score / maxScore;
    if (ratio >= 0.7) buckets[0].push(s);
    else if (ratio >= 0.4) buckets[1].push(s);
    else buckets[2].push(s);
  }

  for (const s of buckets[0]) selected.push(s);
  const remaining = count - selected.length;
  if (remaining > 0) {
    const shuffled1 = [...buckets[1]].sort(() => Math.random() - 0.5).slice(0, Math.ceil(remaining * 0.6));
    selected.push(...shuffled1);
  }
  if (selected.length < count) {
    const shuffled2 = [...buckets[2]].sort(() => Math.random() - 0.5).slice(0, count - selected.length);
    selected.push(...shuffled2);
  }

  return selected.sort(() => Math.random() - 0.5);
}

export async function getMovieSuggestions(options: AlgoOptions): Promise<ScoredSuggestion[]> {
  const candidateMap = await collectCandidates(options);
  const scored = scoreAndRank(candidateMap, options.tasteTags);
  return weightedSelect(scored, 40);
}
