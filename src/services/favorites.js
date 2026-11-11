import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'streamvibe-favorites-v1';

export async function getFavorites() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const favorites = JSON.parse(raw);
    return Array.isArray(favorites) ? favorites : [];
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export async function isFavorite(id, kind) {
  const favorites = await getFavorites();
  return favorites.some((item) => String(item.id) === String(id) && item.kind === kind);
}

export async function toggleFavorite(title) {
  const favorites = await getFavorites();
  const exists = favorites.some((item) => String(item.id) === String(title.id) && item.kind === title.kind);
  const savedTitle = {
    id: title.id,
    kind: title.kind,
    title: title.title,
    poster: title.poster ?? null,
    backdrop: title.backdrop ?? null,
    date: title.date ?? '',
    rating: title.rating ?? 0,
    votes: title.votes ?? 0,
    popularity: title.popularity ?? 0,
    genreIds: title.genreIds ?? [],
    streamUrl: title.streamUrl,
    savedAt: Date.now(),
  };
  const updated = exists
    ? favorites.filter((item) => String(item.id) !== String(title.id) || item.kind !== title.kind)
    : [savedTitle, ...favorites];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return { isFavorite: !exists, favorites: updated };
}
