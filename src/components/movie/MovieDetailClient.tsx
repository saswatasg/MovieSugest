'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Star,
  Globe,
  Play,
  ExternalLink,
  Heart,
} from 'lucide-react';
import {
  getMovieDetails,
  getMovieVideos,
  getMovieWatchProviders,
  tmdbImage,
} from '@/lib/tmdb';
import { getProviderById, OTTProvider } from '@/lib/ott-providers';
import { TASTE_TAGS } from '@/lib/taste-tags';
import { curatedMovies } from '@/lib/curated-movies';
import OTTChip from '@/components/results/OTTChip';
import TasteTag from '@/components/results/TasteTag';

interface Props {
  movieId: number;
}

export default function MovieDetailClient({ movieId }: Props) {
  const router = useRouter();
  const [details, setDetails] = useState<{
    title: string;
    overview: string;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string;
    voteAverage: number;
    runtime: number;
    genres: { id: number; name: string }[];
    originalLanguage: string;
    tagline: string;
  } | null>(null);
  const [providers, setProviders] = useState<OTTProvider[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const curated = curatedMovies.find((m) => m.tmdbId === movieId);

  useEffect(() => {
    async function load() {
      try {
        const [detailData, providersData, videoKey] = await Promise.all([
          getMovieDetails(movieId),
          getMovieWatchProviders(movieId),
          getMovieVideos(movieId),
        ]);

        setDetails({
          title: detailData.title,
          overview: detailData.overview,
          posterPath: detailData.poster_path,
          backdropPath: detailData.backdrop_path,
          releaseDate: detailData.release_date,
          voteAverage: detailData.vote_average,
          runtime: detailData.runtime,
          genres: detailData.genres,
          originalLanguage: detailData.original_language,
          tagline: detailData.tagline,
        });

        const indiaProviders = providersData['IN']?.flatrate || [];
        setProviders(
          indiaProviders
            .map((p) => getProviderById(p.provider_id))
            .filter(Boolean) as OTTProvider[]
        );

        setTrailerKey(videoKey);
      } catch {
        if (curated) {
          setDetails({
            title: curated.title,
            overview: '',
            posterPath: null,
            backdropPath: null,
            releaseDate: String(curated.year),
            voteAverage: 0,
            runtime: 0,
            genres: curated.genres.map((g: string, i: number) => ({
              id: i,
              name: g.charAt(0).toUpperCase() + g.slice(1),
            })),
            originalLanguage:
              curated.language === 'english'
                ? 'en'
                : curated.language === 'hindi'
                  ? 'hi'
                  : 'bn',
            tagline: '',
          });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [movieId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <Heart size={32} className="text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 gap-4">
        <p className="text-text-muted">Couldn&apos;t load movie details</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-primary text-white font-bold"
        >
          Go back
        </button>
      </div>
    );
  }

  const posterUrl = tmdbImage(details.posterPath, 'w342');
  const backdropUrl = tmdbImage(details.backdropPath, 'original');
  const year = details.releaseDate?.substring(0, 4);

  const langLabel: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    bn: 'Bengali',
  };

  return (
    <div className="min-h-dvh bg-bg-base pb-8">
      <div className="relative h-56 sm:h-64 bg-gradient-to-br from-primary-light/20 to-secondary-light/20 overflow-hidden">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={details.title}
            fill
            className="object-cover opacity-40"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-transparent" />

        <motion.button
          onClick={() => router.back()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-4 left-4 z-10 p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm"
        >
          <ArrowLeft size={20} className="text-text" />
        </motion.button>

        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h1 className="text-2xl font-extrabold text-text">{details.title}</h1>
          {details.tagline && (
            <p className="text-text-light text-sm italic mt-1">
              &ldquo;{details.tagline}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="px-4 -mt-16 relative z-20">
        <div className="flex gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-28 h-40 rounded-xl overflow-hidden shadow-lg bg-white shrink-0 border border-border/50"
          >
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={details.title}
                width={112}
                height={160}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light/20 to-secondary-light/20">
                <span className="text-4xl">🎬</span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col justify-end gap-2 pb-1"
          >
            <div className="flex flex-wrap gap-2">
              {year && (
                <span className="text-xs font-bold text-text-light bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  {year}
                </span>
              )}
              <span className="text-xs font-bold text-text-light bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                <Star size={12} className="text-warm" fill="#FBBF24" />
                {details.voteAverage?.toFixed(1)}
              </span>
              {details.runtime > 0 && (
                <span className="text-xs font-bold text-text-light bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock size={12} />
                  {details.runtime}m
                </span>
              )}
              <span className="text-xs font-bold text-text-light bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                <Globe size={12} />
                {langLabel[details.originalLanguage] || details.originalLanguage}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-1">
              {details.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {details.overview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-sm font-bold text-text-light uppercase tracking-wider mb-2">
              Synopsis
            </h2>
            <p className="text-sm text-text-light leading-relaxed">
              {details.overview}
            </p>
          </motion.div>
        )}

        {curated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-primary-light/10 to-secondary-light/10 rounded-2xl p-5 border border-primary/10"
          >
            <h2 className="text-sm font-bold text-text-light uppercase tracking-wider mb-3 flex items-center gap-2">
              <Heart size={14} className="text-primary" />
              Why this movie fits us
            </h2>
            <p className="text-sm text-text leading-relaxed font-medium">
              {curated.matchNote}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {curated.tasteTags.map((tagId) => {
                const tag = TASTE_TAGS[tagId];
                if (!tag) return null;
                return <TasteTag key={tagId} tag={tag} />;
              })}
            </div>
          </motion.div>
        )}

        {providers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-sm font-bold text-text-light uppercase tracking-wider mb-3">
              Watch on
            </h2>
            <div className="flex flex-wrap gap-2">
              {providers.map((p) => (
                <OTTChip key={p.id} provider={p} />
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          {trailerKey && (
            <a
              href={`https://www.youtube.com/watch?v=${trailerKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-base flex items-center justify-center gap-2 shadow-md"
            >
              <Play size={20} fill="white" />
              Watch Trailer
            </a>
          )}
          <a
            href={`https://www.themoviedb.org/movie/${movieId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl border-2 border-border text-text-light font-semibold text-sm flex items-center justify-center gap-2 hover:border-primary/30 transition-colors"
          >
            <ExternalLink size={16} />
            View on TMDB
          </a>
        </motion.div>
      </div>
    </div>
  );
}
