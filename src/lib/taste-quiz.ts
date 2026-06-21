export interface QuizAnswer {
  id: string;
  emoji: string;
  label: string;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  answers: QuizAnswer[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'mood',
    question: 'What kind of night is it?',
    subtitle: 'Pick the mood you both are in',
    answers: [
      { id: 'hug', emoji: '🧸', label: 'I need a warm hug', tags: ['comfort-cute'] },
      { id: 'feel', emoji: '💔', label: 'I want to feel something deep', tags: ['literary-melancholy', 'thought-provoking'] },
      { id: 'magic', emoji: '✨', label: 'Surprise me with magic', tags: ['whimsical'] },
      { id: 'fire', emoji: '🔥', label: 'Get me fired up', tags: ['social-drama'] },
      { id: 'love', emoji: '🌙', label: 'Make me believe in love', tags: ['soft-romance', 'filmy-romance'] },
      { id: 'think', emoji: '🧠', label: 'Make me think', tags: ['thought-provoking'] },
      { id: 'nostalgia', emoji: '🌱', label: 'Take me back', tags: ['coming-of-age'] },
    ],
  },
  {
    id: 'vibe',
    question: 'Pick a vibe',
    subtitle: 'What world do you want to escape into?',
    answers: [
      { id: 'rainy', emoji: '📖', label: 'Rainy Kolkata, books, chai', tags: ['literary-melancholy'] },
      { id: 'college', emoji: '🏫', label: 'College campus, friends, first love', tags: ['coming-of-age', 'soft-romance'] },
      { id: 'city', emoji: '🌆', label: 'City nights, rooftop talks', tags: ['soft-romance', 'filmy-romance'] },
      { id: 'cartoon', emoji: '🎨', label: 'Cartoon world, bright colors', tags: ['comfort-cute', 'whimsical'] },
      { id: 'protest', emoji: '✊', label: 'A protest, a revolution', tags: ['social-drama'] },
      { id: 'village', emoji: '🌿', label: 'Quiet village, slow life', tags: ['literary-melancholy', 'coming-of-age'] },
    ],
  },
  {
    id: 'love',
    question: 'What kind of love story?',
    subtitle: 'If there is love in this film, it should feel like...',
    answers: [
      { id: 'slow', emoji: '💕', label: 'Slow burn, real, imperfect', tags: ['soft-romance'] },
      { id: 'grand', emoji: '🌟', label: 'Grand gestures, destiny, SRK style', tags: ['filmy-romance'] },
      { id: 'lost', emoji: '😢', label: 'The one that got away', tags: ['literary-melancholy'] },
      { id: 'first', emoji: '🌱', label: 'First love, young and awkward', tags: ['coming-of-age', 'soft-romance'] },
      { id: 'none', emoji: '🤷', label: 'Not in the mood for love', tags: [] },
    ],
  },
  {
    id: 'story',
    question: 'The story that moves you most',
    subtitle: 'Which of these feels like your kind of cinema?',
    answers: [
      { id: 'place', emoji: '🏠', label: 'Finding where you belong', tags: ['coming-of-age'] },
      { id: 'system', emoji: '⚖️', label: 'One person vs an unfair world', tags: ['social-drama'] },
      { id: 'artist', emoji: '🎨', label: 'An artist struggling to create', tags: ['thought-provoking', 'literary-melancholy'] },
      { id: 'friendship', emoji: '🤝', label: 'An unlikely bond that changes everything', tags: ['comfort-cute', 'whimsical'] },
      { id: 'journey', emoji: '✈️', label: 'A road trip that changes who they are', tags: ['coming-of-age', 'soft-romance'] },
      { id: 'memory', emoji: '📜', label: 'The weight of memory and the past', tags: ['literary-melancholy', 'thought-provoking'] },
    ],
  },
  {
    id: 'comfort',
    question: 'Your couple comfort food?',
    subtitle: 'What are you snacking on during the movie?',
    answers: [
      { id: 'noodles', emoji: '🍜', label: 'Noodles / comfort food', tags: ['comfort-cute'] },
      { id: 'coffee', emoji: '☕', label: 'Black coffee & poetry', tags: ['literary-melancholy', 'thought-provoking'] },
      { id: 'popcorn', emoji: '🍿', label: 'Popcorn & spectacle', tags: ['whimsical'] },
      { id: 'sweet', emoji: '🍫', label: 'Something sweet', tags: ['soft-romance', 'filmy-romance'] },
      { id: 'spicy', emoji: '🌶️', label: 'Something with a kick', tags: ['social-drama'] },
    ],
  },
];

export function computeTasteProfile(answers: Record<string, string>): {
  tags: string[];
  scores: Record<string, number>;
} {
  const scores: Record<string, number> = {};

  for (const [questionId, answerId] of Object.entries(answers)) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
    if (!question) continue;
    const answer = question.answers.find((a) => a.id === answerId);
    if (!answer) continue;
    for (const tag of answer.tags) {
      scores[tag] = (scores[tag] || 0) + 1;
    }
  }

  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);

  const maxScore = sorted.length > 0 ? sorted[0][1] : 0;
  const tags = sorted
    .filter(([, score]) => score >= Math.max(2, maxScore - 1))
    .map(([tag]) => tag);

  return { tags, scores };
}

export function determineLanguageFromNames(name1: string, name2: string): string {
  const combined = `${name1} ${name2}`.toLowerCase();
  if (combined.includes('saswata') || combined.includes('pragati')) return 'hindi';
  return 'english';
}
