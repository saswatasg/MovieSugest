export interface GenreOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const GENRE_OPTIONS: GenreOption[] = [
  { id: 'romance', label: 'Romance', emoji: '💕', color: '#E11D48', bgColor: '#FFF0F3' },
  { id: 'coming-of-age', label: 'Coming of Age', emoji: '🌱', color: '#059669', bgColor: '#F0FDF9' },
  { id: 'drama', label: 'Drama', emoji: '🎭', color: '#7C3AED', bgColor: '#F5F3FF' },
  { id: 'comedy', label: 'Comedy', emoji: '😄', color: '#D97706', bgColor: '#FFFBEB' },
  { id: 'whimsical', label: 'Whimsical', emoji: '🎪', color: '#DB2777', bgColor: '#FDF2F8' },
  { id: 'literary', label: 'Literary', emoji: '📖', color: '#1D4ED8', bgColor: '#EFF6FF' },
  { id: 'social-political', label: 'Social', emoji: '✊', color: '#B91C1C', bgColor: '#FEF2F2' },
  { id: 'thriller', label: 'Thriller', emoji: '🔪', color: '#1E293B', bgColor: '#F1F5F9' },
  { id: 'animation', label: 'Animation', emoji: '🎨', color: '#0D9488', bgColor: '#F0FDFA' },
  { id: 'comfort', label: 'Comfort', emoji: '🧸', color: '#F472B6', bgColor: '#FFF0F5' },
];

export const LANGUAGE_OPTIONS = [
  { id: 'english', label: 'English', emoji: '🔤' },
  { id: 'hindi', label: 'Hindi', emoji: '🪔' },
  { id: 'bengali', label: 'Bengali', emoji: '🌺' },
];

export type LanguageSlug = 'english' | 'hindi' | 'bengali';
