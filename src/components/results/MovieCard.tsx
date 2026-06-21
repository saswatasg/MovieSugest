'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { tmdbImage } from '@/lib/tmdb';
import { TASTE_TAGS } from '@/lib/taste-tags';
import { OTTProvider } from '@/lib/ott-providers';
import OTTChip from './OTTChip';
import TasteTag from './TasteTag';
import { Film } from 'lucide-react';

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    year?: number;
    posterPath: string | null;
    tasteTags: string[];
    matchNote?: string;
    ottProviders?: OTTProvider[];
  };
  index: number;
}

export default function MovieCard({ movie, index }: MovieCardProps) {
  const posterUrl = tmdbImage(movie.posterPath, 'w342');
  const yearDisplay = movie.year ? ` (${movie.year})` : '';

  return (
    <Link href={`/movie/${movie.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
        whileHover={{ y: -4 }}
        className="bg-bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border/50"
      >
        <div className="aspect-[2/3] bg-gradient-to-br from-primary-light/10 to-secondary-light/10 relative overflow-hidden">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="(max-width: 360px) 160px, 180px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film size={40} className="text-text-muted/30" />
            </div>
          )}
        </div>

        <div className="p-3.5 space-y-2.5">
          <h3 className="font-bold text-text text-sm leading-tight">
            {movie.title}
            {yearDisplay && (
              <span className="font-normal text-text-muted text-xs ml-1">
                {yearDisplay}
              </span>
            )}
          </h3>

          {movie.matchNote && (
            <p className="text-xs text-text-light leading-relaxed line-clamp-2">
              {movie.matchNote}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {movie.tasteTags.map((tagId) => {
              const tag = TASTE_TAGS[tagId];
              if (!tag) return null;
              return <TasteTag key={tagId} tag={tag} />;
            })}
          </div>

          {movie.ottProviders && movie.ottProviders.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {movie.ottProviders.map((p) => (
                <OTTChip key={p.id} provider={p} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
