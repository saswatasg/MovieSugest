'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function ResultsLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-4">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles size={40} className="text-primary" />
      </motion.div>
      <p className="text-text-muted text-sm font-medium">
        Finding your perfect movie...
      </p>
    </div>
  );
}
