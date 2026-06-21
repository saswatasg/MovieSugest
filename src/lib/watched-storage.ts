const STORAGE_KEY = '11pm_watched';

export function getWatchedIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addWatchedId(id: number): void {
  const watched = getWatchedIds();
  if (!watched.includes(id)) {
    watched.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
  }
}

export function removeWatchedId(id: number): void {
  const watched = getWatchedIds().filter((wid) => wid !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
}

export function clearWatched(): void {
  localStorage.removeItem(STORAGE_KEY);
}
