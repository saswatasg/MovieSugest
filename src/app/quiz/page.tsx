'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
import { QUIZ_QUESTIONS, computeTasteProfile } from '@/lib/taste-quiz';
import { TASTE_TAGS } from '@/lib/taste-tags';
import { LANGUAGE_OPTIONS, LanguageSlug } from '@/lib/genre-options';

type Phase = 'names' | 'questions' | 'profile' | 'language';

export default function QuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('names');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageSlug | null>(null);

  const profile = phase === 'profile' || phase === 'language'
    ? computeTasteProfile(answers)
    : null;

  const handleAnswer = useCallback((answerId: string) => {
    const q = QUIZ_QUESTIONS[questionIdx];
    setAnswers((prev) => ({ ...prev, [q.id]: answerId }));
    if (questionIdx < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setQuestionIdx((i) => i + 1), 300);
    } else {
      setTimeout(() => setPhase('profile'), 400);
    }
  }, [questionIdx]);

  const handleFinish = () => {
    if (selectedLanguage) {
      const tasteTags = profile?.tags.join(',') || '';
      const seedAnswers = Object.values(answers).join(',');
      router.push(
        `/results?fromQuiz=true&tags=${encodeURIComponent(tasteTags)}&answers=${encodeURIComponent(seedAnswers)}&language=${selectedLanguage}`
      );
    }
  };

  if (phase === 'names') {
    return (
      <div className="flex flex-col min-h-dvh px-6 py-10">
        <motion.button
          onClick={() => router.push('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="self-start mb-10 p-2 -ml-2 rounded-xl hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft size={22} className="text-text-muted" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col gap-10"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              🐼🎬
            </motion.div>
            <h1 className="text-2xl font-extrabold text-text">
              Who&apos;s watching tonight?
            </h1>
            <p className="text-text-muted text-sm mt-2">
              We&apos;ll ask you both a few questions to find your perfect match.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-text-light uppercase tracking-wider mb-2 block">
                Person 1
              </label>
              <input
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-border text-text font-medium placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-light uppercase tracking-wider mb-2 block">
                Person 2
              </label>
              <input
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                placeholder="Their name"
                className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-border text-text font-medium placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end pb-4">
            <motion.button
              onClick={() => setPhase('questions')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
            >
              Start the quiz 💕
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === 'questions') {
    const q = QUIZ_QUESTIONS[questionIdx];
    return (
      <div className="flex flex-col min-h-dvh px-5 py-8">
        <div className="flex items-center gap-2 mb-8">
          {QUIZ_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= questionIdx ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col gap-6"
          >
            <div>
              <p className="text-xs text-primary font-bold mb-2">
                Question {questionIdx + 1} of {QUIZ_QUESTIONS.length}
              </p>
              <h2 className="text-2xl font-extrabold text-text">
                {q.question}
              </h2>
              <p className="text-text-muted text-sm mt-1">{q.subtitle}</p>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              {q.answers.map((answer, i) => (
                <motion.button
                  key={answer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => handleAnswer(answer.id)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-border text-left flex items-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                >
                  <span className="text-2xl">{answer.emoji}</span>
                  <span className="text-sm font-semibold text-text">
                    {answer.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (phase === 'profile' && profile) {
    const topTags = profile.tags.slice(0, 4);
    return (
      <div className="flex flex-col min-h-dvh px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col gap-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              🎬✨
            </motion.div>
            <h1 className="text-2xl font-extrabold text-text">
              Your couple taste profile
            </h1>
            <p className="text-text-muted text-sm mt-2">
              Based on your answers, here&apos;s your shared cinema language
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {topTags.map((tagId, i) => {
              const tag = TASTE_TAGS[tagId];
              if (!tag) return null;
              return (
                <motion.div
                  key={tagId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-light/15 to-secondary-light/15 border border-primary/10 flex items-center gap-2.5"
                >
                  <span className="text-xl">{tag.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-text">{tag.label}</p>
                    <p className="text-xs text-text-muted">{tag.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-primary-light/10 to-secondary-light/10 rounded-2xl p-5 text-center"
          >
            <p className="text-sm text-text font-medium">
              You two are <span className="text-primary font-bold">11 PM Cinema</span> —
              {topTags.includes('literary-melancholy')
                ? ' poetic souls who feel deeply. '
                : topTags.includes('coming-of-age')
                  ? ' still growing, still dreaming. '
                  : ' stories waiting to be told. '}
              Let&apos;s find your movie.
            </p>
          </motion.div>

          <div className="flex-1 flex flex-col justify-end pb-4 gap-3">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={() => setPhase('language')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
            >
              Pick a language
              <ChevronRight size={20} />
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              onClick={() => { setQuestionIdx(0); setPhase('questions'); }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="text-sm text-text-muted text-center"
            >
              Retake quiz
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === 'language') {
    return (
      <div className="flex flex-col min-h-dvh px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col gap-8"
        >
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-text">
              What language tonight?
            </h1>
            <p className="text-text-muted text-sm mt-2">
              Pick the language you&apos;re in the mood for
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {LANGUAGE_OPTIONS.map((lang) => (
              <motion.button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id as LanguageSlug)}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-2xl text-lg font-bold transition-all duration-200 flex items-center justify-center gap-3 border-2 ${
                  selectedLanguage === lang.id
                    ? 'bg-secondary text-white border-transparent shadow-md shadow-secondary/30'
                    : 'bg-white text-text-light border-border hover:border-secondary/30'
                }`}
              >
                <span className="text-2xl">{lang.emoji}</span>
                <span>{lang.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-end pb-4">
            <motion.button
              onClick={handleFinish}
              disabled={!selectedLanguage}
              whileHover={selectedLanguage ? { scale: 1.02 } : {}}
              whileTap={selectedLanguage ? { scale: 0.98 } : {}}
              className={`w-full py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
                selectedLanguage
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Sparkles size={20} />
              Find Our Movie 💕
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
