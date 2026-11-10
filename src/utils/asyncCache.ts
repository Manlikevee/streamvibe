import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryCache = new Map<string, unknown>();
const storageKey = (key: string) => `streamvibe-cache:${key}`;

export async function readAsyncCache<T>(key: string): Promise<T | null> {
  if (memoryCache.has(key)) return memoryCache.get(key) as T;
  try {
    const stored = await AsyncStorage.getItem(storageKey(key));
    if (stored == null) return null;
    const value = JSON.parse(stored) as T;
    memoryCache.set(key, value);
    return value;
  } catch {
    return null;
  }
}

export async function writeAsyncCache<T>(key: string, value: T): Promise<void> {
  memoryCache.set(key, value);
  try {
    await AsyncStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    // Keep the in-memory cache even when persistent storage is full or unavailable.
  }
}
