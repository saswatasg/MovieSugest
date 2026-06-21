'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Shuffle, Sparkles, RefreshCw, Heart, RotateCcw, Star, Clock, Film } from 'lucide-react';
import { curatedMovies, CuratedMovie } from '@/lib/curated-movies';
import {
  getTasteRecommendations,
  discoverByTasteKeywords,
  fetchMoviePoster,
  assignTasteTagFromGenres,
} from '@/lib/tmdb';
import { TASTE_TAGS } from '@/lib/taste-tags';
import { genresToTasteTags } from '@/lib/taste-matcher';
import NoResults from '@/components/results/NoResults';

interface Suggestion {
  id: number;
  title: string;
  year?: number;
  posterPath: string | null;
  tasteTags: string[];
  matchNote?: string;
  isCurated: boolean;
}

function matchCuratedMovie(movie: CuratedMovie, selectedGenres: string[], lang: string): boolean {
  if (movie.language !== lang) return false;
  if (selectedGenres.length === 0) return true;
  return movie.genres.some((g) => selectedGenres.includes(g));
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pool, setPool] = useState<Suggestion[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [showReason, setShowReason] = useState(false);

  const selectedGenres = searchParams.get('genres')?.split(',') || [];
  const language = searchParams.get('language') || '';

  useEffect(() => {
    async function loadMovies() {
      setLoading(true);
      const seen = new Set<number>();
      const results: Suggestion[] = [];

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
          isCurated: true,
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
            isCurated: false,
          });
        }
      } catch {}

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
            isCurated: false,
          });
        }
      } catch {}

      const shuffled = results.sort(() => Math.random() - 0.5);
      setPool(shuffled);
      setCurrent(0);
      setLoading(false);
    }

    if (language) loadMovies();
    else setLoading(false);
  }, [selectedGenres.join(','), language]);

  const handleNext = useCallback(() => {
    if (switching || pool.length <= 1) return;
    setSwitching(true);
    setShowReason(false);
    const nextIdx = (current + 1) % pool.length;
    setTimeout(() => {
      setCurrent(nextIdx);
      setSwitching(false);
    }, 200);
  }, [current, pool.length, switching]);

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
        <NoResults />
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
                  {movie.isCurated && (
                    <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Heart size={10} fill="white" />
                      Your taste
                    </div>
                  )}
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
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-3 pt-2 pb-4">
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
              {pool.length} movie{pool.length !== 1 ? 's' : ''} in your lineup
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
