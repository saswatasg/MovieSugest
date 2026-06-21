'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shuffle, Sparkles, RefreshCw, Heart } from 'lucide-react';
import { curatedMovies, CuratedMovie } from '@/lib/curated-movies';
import {
  getTasteRecommendations,
  discoverByTasteKeywords,
  fetchMoviePoster,
  assignTasteTagFromGenres,
} from '@/lib/tmdb';
import { getProviderById, OTTProvider } from '@/lib/ott-providers';
import { genresToTasteTags } from '@/lib/taste-matcher';
import MovieCard from '@/components/results/MovieCard';
import NoResults from '@/components/results/NoResults';

interface MovieResult {
  id: number;
  title: string;
  year?: number;
  posterPath: string | null;
  tasteTags: string[];
  matchNote?: string;
  ottProviders: OTTProvider[];
  isCurated: boolean;
  sourceLabel?: string;
}

function matchCuratedMovie(movie: CuratedMovie, selectedGenres: string[], lang: string): boolean {
  if (movie.language !== lang) return false;
  if (selectedGenres.length === 0) return true;
  return movie.genres.some((g) => selectedGenres.includes(g));
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<MovieResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [surpriseId, setSurpriseId] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const surpriseRef = useRef<HTMLDivElement>(null);

  const selectedGenres = searchParams.get('genres')?.split(',') || [];
  const language = searchParams.get('language') || '';

  useEffect(() => {
    async function loadMovies() {
      setLoading(true);
      const seen = new Set<number>();
      const results: MovieResult[] = [];

      const matchedCurated = curatedMovies.filter((m) =>
        matchCuratedMovie(m, selectedGenres, language)
      );

      const tasteTags = genresToTasteTags(selectedGenres);

      for (const cm of matchedCurated) {
        seen.add(cm.tmdbId);
        const poster = await fetchMoviePoster(cm.tmdbId).catch(() => null);
        results.push({
          id: cm.tmdbId,
          title: cm.title,
          year: cm.year,
          posterPath: poster,
          tasteTags: cm.tasteTags,
          matchNote: cm.matchNote,
          ottProviders: [],
          isCurated: true,
          sourceLabel: 'Your taste pick',
        });
      }

      try {
        const recommendations = await getTasteRecommendations({
          selectedTags: tasteTags,
          language: language === 'english' ? 'en' : language === 'hindi' ? 'hi' : 'bn',
          watchRegion: 'IN',
          watchProviders: '8|9|342|350|385|220',
        });

        for (const { movie, sourceTag } of recommendations) {
          if (seen.has(movie.id)) continue;
          seen.add(movie.id);
          results.push({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : undefined,
            posterPath: movie.poster_path,
            tasteTags: [sourceTag],
            ottProviders: [],
            isCurated: false,
            sourceLabel: 'Because you like these',
          });
        }
      } catch {
        // recommendations failed
      }

      try {
        const keywordMovies = await discoverByTasteKeywords({
          selectedTags: tasteTags,
          with_original_language: language === 'english' ? 'en' : language === 'hindi' ? 'hi' : undefined,
          watch_region: 'IN',
          with_watch_providers: '8|9|342|350|385|220',
          sort_by: 'popularity.desc',
        });

        for (const movie of keywordMovies) {
          if (seen.has(movie.id)) continue;
          seen.add(movie.id);
          results.push({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : undefined,
            posterPath: movie.poster_path,
            tasteTags: [assignTasteTagFromGenres(movie.genre_ids)],
            ottProviders: [],
            isCurated: false,
            sourceLabel: 'New discovery',
          });
        }
      } catch {
        // keyword discover failed
      }

      setMovies(results.slice(0, 40));
      setLoading(false);
    }

    if (language) {
      loadMovies();
    } else {
      setLoading(false);
    }
  }, [selectedGenres.join(','), language]);

  const handleSurpriseMe = useCallback(() => {
    if (movies.length === 0 || isShuffling) return;
    setIsShuffling(true);
    setSurpriseId(null);

    let count = 0;
    const maxCycles = 12;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * movies.length);
      setSurpriseId(movies[randomIdx].id);
      count++;
      if (count >= maxCycles) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * movies.length);
        setSurpriseId(movies[finalIdx].id);
        setIsShuffling(false);

        import('canvas-confetti').then((confetti) => {
          confetti.default({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F472B6', '#A78BFA', '#34D399', '#FBBF24'],
          });
        });

        setTimeout(() => {
          surpriseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }, 80);
  }, [movies, isShuffling]);

  if (!language) {
    return <NoResults />;
  }

  return (
    <div className="flex flex-col min-h-dvh px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <motion.button
          onClick={() => router.push('/select')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 -ml-2 rounded-xl hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft size={22} className="text-text-muted" />
        </motion.button>
        <div className="flex gap-2">
          <motion.button
            onClick={handleSurpriseMe}
            disabled={isShuffling || movies.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-warm to-primary text-white text-sm font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Shuffle size={16} />
            Surprise Me!
          </motion.button>
          <motion.button
            onClick={() => router.refresh()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl hover:bg-primary/10 transition-colors"
          >
            <RefreshCw size={18} className="text-text-muted" />
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Heart size={32} className="text-primary" />
          </motion.div>
        </div>
      ) : movies.length === 0 ? (
        <NoResults />
      ) : (
        <>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-text-muted text-sm mb-4"
          >
            Curated from your taste ✨
          </motion.p>

          <div className="grid grid-cols-2 gap-3.5 pb-8" ref={surpriseRef}>
            {movies.map((movie, i) => (
              <div
                key={movie.id}
                className={
                  surpriseId === movie.id
                    ? 'relative ring-4 ring-primary rounded-2xl ring-offset-2 ring-offset-bg-base animate-pulse'
                    : ''
                }
              >
                <MovieCard movie={movie} index={i} />
              </div>
            ))}
          </div>

          <AnimatePresence>
            {movies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-bg-base via-bg-base/95 to-transparent"
              >
                <motion.button
                  onClick={handleSurpriseMe}
                  disabled={isShuffling}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-warm to-primary text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  <Shuffle size={18} />
                  {isShuffling ? 'Picking...' : 'Surprise Me! 🎲'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
