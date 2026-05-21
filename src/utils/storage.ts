const PREFIX = 'food-gacha:';

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // Silently fail
  }
}
