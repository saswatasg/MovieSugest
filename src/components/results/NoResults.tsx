'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NoResults() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 gap-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <SearchX size={64} className="text-text-muted/40" />
      </motion.div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-text">No movies found</h2>
        <p className="text-text-muted text-sm mt-2">
          Try different genres or language — or maybe it&apos;s a popcorn-and-scroll night?
        </p>
      </div>
      <motion.button
        onClick={() => router.push('/select')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-6 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 shadow-md"
      >
        <ArrowLeft size={18} />
        Try again
      </motion.button>
    </div>
  );
}
