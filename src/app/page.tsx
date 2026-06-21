'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Stars, Heart } from 'lucide-react';

const sparklePositions = [
  { top: '10%', left: '5%', size: 12, delay: 0 },
  { top: '20%', left: '80%', size: 8, delay: 0.5 },
  { top: '50%', left: '10%', size: 10, delay: 1 },
  { top: '60%', left: '75%', size: 14, delay: 1.5 },
  { top: '80%', left: '20%', size: 9, delay: 2 },
  { top: '30%', left: '60%', size: 11, delay: 2.5 },
  { top: '70%', left: '85%', size: 7, delay: 3 },
  { top: '40%', left: '35%', size: 13, delay: 3.5 },
];

export default function HomePage() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const phrases = [
    'Movies that feel like *us*',
    'Late night. Two minds. One pick.',
    'Find your 11 PM cinema',
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 300);
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-between min-h-dvh px-6 py-12 relative overflow-hidden bg-gradient-to-b from-primary-light/15 via-bg-base to-secondary-light/15">
      {sparklePositions.map((sp, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ top: sp.top, left: sp.left }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0.5, 1, 0],
            scale: [0, 1, 0.8, 1, 0],
          }}
          transition={{
            duration: 3,
            delay: sp.delay,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <Stars size={sp.size} className="text-primary/40" />
        </motion.div>
      ))}

      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
        <AnimatePresence mode="wait">
          {showContent && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="text-7xl mb-2"
              >
                🐼🎬
              </motion.div>

              <h1 className="text-4xl font-extrabold text-text text-center tracking-tight">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  11 PM Cinema
                </span>
              </h1>

              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-text-muted text-lg text-center font-medium"
                >
                  {phrases[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
              className="w-full px-4"
            >
              <motion.button
                onClick={() => router.push('/select')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg shadow-lg shadow-primary/25 flex items-center justify-center gap-3"
              >
                <Heart size={20} fill="white" />
                Let&apos;s find our movie
                <Sparkles size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ delay: 1 }}
        className="text-text-muted/50 text-xs text-center"
      >
        Made with 💕 for you two
      </motion.p>
    </div>
  );
}
