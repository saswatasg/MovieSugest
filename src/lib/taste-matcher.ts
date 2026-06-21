const GENRE_TO_TASTE: Record<string, string[]> = {
  romance: ['soft-romance', 'filmy-romance'],
  'coming-of-age': ['coming-of-age'],
  drama: ['social-drama', 'literary-melancholy', 'thought-provoking'],
  comedy: ['whimsical', 'comfort-cute'],
  whimsical: ['whimsical'],
  literary: ['literary-melancholy', 'thought-provoking'],
  'social-political': ['social-drama', 'thought-provoking'],
  thriller: ['thought-provoking'],
  animation: ['comfort-cute', 'whimsical'],
  comfort: ['comfort-cute'],
};

export function genresToTasteTags(genreSlugs: string[]): string[] {
  const tags = new Set<string>();
  for (const slug of genreSlugs) {
    const mapped = GENRE_TO_TASTE[slug];
    if (mapped) mapped.forEach((t) => tags.add(t));
  }
  return [...tags];
}
