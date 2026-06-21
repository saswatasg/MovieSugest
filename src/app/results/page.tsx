'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Shuffle, Sparkles, RefreshCw,
  Heart, RotateCcw, Eye, EyeOff, Film, Check
} from 'lucide-react';
import { curatedMovies } from '@/lib/curated-movies';
import { getMovieSuggestions, ScoredSuggestion } from '@/lib/taste-algo';
import { fetchMoviePoster } from '@/lib/tmdb';
import { TASTE_TAGS } from '@/lib/taste-tags';
import { genresToTasteTags } from '@/lib/taste-matcher';
import { getWatchedIds, addWatchedId } from '@/lib/watched-storage';
import NoResults from '@/components/results/NoResults';

interface Suggestion {
  id: number;
  title: string;
  year?: number;
  posterPath: string | null;
  tasteTags: string[];
  matchNote?: string;
  score: number;
  voteAverage: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pool, setPool] = useState<Suggestion[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [markedWatched, setMarkedWatched] = useState<number | null>(null);

  const selectedGenres = searchParams.get('genres')?.split(',') || [];
  const language = searchParams.get('language') || '';
  const fromQuiz = searchParams.get('fromQuiz') === 'true';
  const quizTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    async function loadMovies() {
      setLoading(true);

      const tasteTags = fromQuiz && quizTags.length > 0
        ? quizTags
        : genresToTasteTags(selectedGenres);

      if (tasteTags.length === 0) {
        setLoading(false);
        return;
      }

      const watchedIds = getWatchedIds();
      const curatedIds = new Set(curatedMovies.map((m) => m.tmdbId));
      const excludeIds = [...watchedIds, ...curatedIds];

      try {
        const suggestions = await getMovieSuggestions({
          tasteTags,
          language,
          excludeIds,
        });

        const results: Suggestion[] = suggestions.map((s) => ({
          id: s.id,
          title: s.title,
          year: s.year,
          posterPath: s.posterPath,
          tasteTags: s.matchedTags,
          score: s.score,
          voteAverage: s.voteAverage,
        }));

        setPool(results);
      } catch {
        setPool([]);
      }
      setCurrent(0);
      setLoading(false);
    }

    if (language) loadMovies();
    else setLoading(false);
  }, [selectedGenres.join(','), language, fromQuiz, quizTags.join(',')]);

  const advance = useCallback(() => {
    if (pool.length <= 1) return;
    const next = (current + 1) % pool.length;
    setCurrent(next);
    setShowReason(false);
    setMarkedWatched(null);
  }, [current, pool.length]);

  const handleNext = useCallback(() => {
    if (switching || pool.length <= 1) return;
    setSwitching(true);
    setTimeout(() => { advance(); setSwitching(false); }, 200);
  }, [switching, pool.length, advance]);

  const handleSurprise = useCallback(() => {
    if (switching || pool.length <= 1) return;
    setSwitching(true);
    setShowReason(false);
    let count = 0;
    const interval = setInterval(() => {
      setCurrent(Math.floor(Math.random() * pool.length));
      count++;
      if (count >= 8) {
        clearInterval(interval);
        setCurrent(Math.floor(Math.random() * pool.length));
        setSwitching(false);
        setMarkedWatched(null);
        import('canvas-confetti').then((confetti) => {
          confetti.default({
            particleCount: 80, spread: 70, origin: { y: 0.6 },
            colors: ['#F472B6', '#A78BFA', '#34D399', '#FBBF24'],
          });
        });
      }
    }, 80);
  }, [pool.length, switching]);

  const movie = pool[current];

  const handleWatched = useCallback(() => {
    if (!movie) return;
    addWatchedId(movie.id);
    setMarkedWatched(movie.id);
    const movieId = movie.id;
    setTimeout(() => {
      setPool((prev) => prev.filter((m) => m.id !== movieId));
      setMarkedWatched(null);
      advance();
    }, 800);
  }, [movie, advance]);

  if (!language) return <NoResults />;

  return (
    <div className="flex flex-col min-h-dvh px-4 py-6">
      <div className="flex items-center justify-between mb-3">
        <motion.button
          onClick={() => router.push('/select')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 -ml-2 rounded-xl hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft size={22} className="text-text-muted" />
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

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Heart size={32} className="text-primary" />
          </motion.div>
        </div>
      ) : !movie ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <Sparkles size={56} className="text-primary/40" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-text">All caught up!</h2>
            <p className="text-text-muted text-sm mt-2">
              You&apos;ve worked through all suggestions. Try different genres or
              language, or reset your watched list.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/select')}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm"
            >
              Try different mood
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('11pm_watched');
                router.refresh();
              }}
              className="px-5 py-2.5 rounded-xl border-2 border-border text-text-light font-semibold text-sm"
            >
              Reset watched
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col gap-4"
            >
              <Link href={`/movie/${movie.id}`} className="block">
                <div className="relative w-full aspect-[2/3] rounded-3xl overflow-hidden bg-gradient-to-br from-primary-light/15 to-secondary-light/15 shadow-lg shadow-primary/10">
                  {movie.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 480px) 100vw, 500px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={64} className="text-text-muted/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h1 className="text-2xl font-extrabold text-white drop-shadow-lg">
                      {movie.title}
                    </h1>
                    {movie.year && (
                      <p className="text-white/80 text-sm font-medium drop-shadow">
                        {movie.year}
                      </p>
                    )}
                  </div>
                </div>
              </Link>

              <div className="flex flex-wrap gap-2 items-center">
                {movie.tasteTags.map((tagId) => {
                  const tag = TASTE_TAGS[tagId];
                  if (!tag) return null;
                  return (
                    <span
                      key={tagId}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-accent-light/40 text-emerald-700"
                    >
                      <span>{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </span>
                  );
                })}
                <Link
                  href={`/movie/${movie.id}`}
                  className="ml-auto text-xs text-primary font-bold"
                >
                  Details →
                </Link>
              </div>

              {movie.matchNote && (
                <>
                  <button
                    onClick={() => setShowReason(!showReason)}
                    className="flex items-center gap-2 text-sm text-text-muted"
                  >
                    <Heart size={14} className={showReason ? 'text-primary' : ''} />
                    Why this movie?
                  </button>
                  <AnimatePresence>
                    {showReason && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-r from-primary-light/10 to-secondary-light/10 rounded-2xl p-4 border border-primary/10 overflow-hidden"
                      >
                        <p className="text-sm text-text leading-relaxed font-medium">
                          {movie.matchNote}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {markedWatched === movie.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-bold py-2"
                >
                  <Check size={16} />
                  Marked as watched — removed from suggestions
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-3 pt-2 pb-4">
              <motion.button
                onClick={handleWatched}
                disabled={switching}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 rounded-xl border-2 border-emerald-200 text-emerald-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors disabled:opacity-50"
              >
                <Check size={16} />
                Already watched it — suggest something new
              </motion.button>

            <motion.button
              onClick={handleSurprise}
              disabled={switching || pool.length <= 1}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-warm to-primary text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Shuffle size={18} />
              {switching ? 'Picking...' : 'Surprise Me! 🎲'}
            </motion.button>

            <motion.button
              onClick={handleNext}
              disabled={switching || pool.length <= 1}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-2xl border-2 border-border text-text-light font-semibold text-sm flex items-center justify-center gap-2 hover:border-primary/30 transition-colors disabled:opacity-30"
            >
              <RotateCcw size={16} />
              Not feeling it — show another
            </motion.button>

            <p className="text-center text-xs text-text-muted/60">
              {pool.length} new suggestion{pool.length !== 1 ? 's' : ''} for you
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
