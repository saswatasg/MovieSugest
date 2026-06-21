export interface TasteTag {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

export const TASTE_TAGS: Record<string, TasteTag> = {
  'coming-of-age': {
    id: 'coming-of-age',
    emoji: '🏡',
    label: 'Coming of Age',
    description: 'Growing up, finding yourself, becoming who you are',
  },
  'literary-melancholy': {
    id: 'literary-melancholy',
    emoji: '📖',
    label: 'Literary Melancholy',
    description: 'Poetic, bittersweet, deeply felt — like a novel you carry with you',
  },
  whimsical: {
    id: 'whimsical',
    emoji: '🎪',
    label: 'Whimsical',
    description: 'Playful, tender, beautifully strange',
  },
  'social-drama': {
    id: 'social-drama',
    emoji: '🎭',
    label: 'Social Drama',
    description: 'Stories that ask: what does it mean to be human in a broken world?',
  },
  'soft-romance': {
    id: 'soft-romance',
    emoji: '🌙',
    label: 'Soft Romance',
    description: 'Love that is gentle, imperfect, and real',
  },
  'comfort-cute': {
    id: 'comfort-cute',
    emoji: '🧸',
    label: 'Comfort Cute',
    description: 'Warm, safe, soft — like a hug in movie form',
  },
  'filmy-romance': {
    id: 'filmy-romance',
    emoji: '💫',
    label: 'Filmy Romance',
    description: 'Grand gestures, longing looks, love that wants to be seen',
  },
  'thought-provoking': {
    id: 'thought-provoking',
    emoji: '🌀',
    label: 'Thought Provoking',
    description: 'Movies that stay with you, that you need to sit with',
  },
};

export const TASTE_TAG_LIST = Object.values(TASTE_TAGS);
