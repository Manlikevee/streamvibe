import AsyncStorage from '@react-native-async-storage/async-storage';
const memoryCache = new Map();
const storageKey = (key) => `streamvibe-cache:${key}`;
export async function readAsyncCache(key) {
    if (memoryCache.has(key))
        return memoryCache.get(key);
    try {
        const stored = await AsyncStorage.getItem(storageKey(key));
        if (stored == null)
            return null;
        const value = JSON.parse(stored);
        memoryCache.set(key, value);
        return value;
    }
    catch {
        return null;
    }
}
export async function writeAsyncCache(key, value) {
    memoryCache.set(key, value);
    try {
        await AsyncStorage.setItem(storageKey(key), JSON.stringify(value));
    }
    catch {
        // Keep the in-memory cache even when persistent storage is full or unavailable.
    }
}
