'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Film } from 'lucide-react';
import { GENRE_OPTIONS, LANGUAGE_OPTIONS, LanguageSlug } from '@/lib/genre-options';

export default function SelectPage() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageSlug | null>(null);

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((g) => g !== genreId)
        : [...prev, genreId]
    );
  };

  const canProceed = selectedGenres.length > 0 && selectedLanguage !== null;

  const handleFindMovie = () => {
    if (!canProceed) return;
    const params = new URLSearchParams();
    params.set('genres', selectedGenres.join(','));
    params.set('language', selectedLanguage!);
    router.push(`/results?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-dvh px-5 py-8">
      <motion.button
        onClick={() => router.push('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="self-start mb-6 p-2 -ml-2 rounded-xl hover:bg-primary/10 transition-colors"
      >
        <ArrowLeft size={22} className="text-text-muted" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-text">
            What are we in the mood for?
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Pick a vibe (or a few), and a language
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-text-light uppercase tracking-wider mb-3 flex items-center gap-2">
            <Film size={14} /> Genre
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {GENRE_OPTIONS.map((genre, i) => (
              <motion.button
                key={genre.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => toggleGenre(genre.id)}
                whileTap={{ scale: 0.92 }}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 border-2 ${
                  selectedGenres.includes(genre.id)
                    ? 'border-transparent text-white shadow-md'
                    : 'border-border bg-white text-text-light hover:border-primary/30'
                }`}
                style={
                  selectedGenres.includes(genre.id)
                    ? { backgroundColor: genre.color }
                    : {}
                }
              >
                <span>{genre.emoji}</span>
                <span>{genre.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-text-light uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles size={14} /> Language
          </h2>
          <div className="flex gap-3">
            {LANGUAGE_OPTIONS.map((lang) => (
              <motion.button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id as LanguageSlug)}
                whileTap={{ scale: 0.92 }}
                className={`flex-1 py-3.5 rounded-2xl text-base font-bold transition-all duration-200 flex items-center justify-center gap-2 border-2 ${
                  selectedLanguage === lang.id
                    ? 'bg-secondary text-white border-transparent shadow-md shadow-secondary/30'
                    : 'bg-white text-text-light border-border hover:border-secondary/30'
                }`}
              >
                <span>{lang.emoji}</span>
                <span>{lang.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col justify-end pb-4 mt-8">
        <motion.button
          onClick={handleFindMovie}
          disabled={!canProceed}
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.98 } : {}}
          className={`w-full py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
            canProceed
              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Sparkles size={20} />
          Find Our Movie 💕
        </motion.button>
      </div>
    </div>
  );
}
