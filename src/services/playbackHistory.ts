import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'streamvibe-playback-history-v1';
const HISTORY_LIMIT = 20;

export interface PlaybackHistoryEntry {
  itemId: string;
  title: string;
  playedAt: number;
  streamUrl?: string;
}

export async function getPlaybackHistory(): Promise<PlaybackHistoryEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PlaybackHistoryEntry[];
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export async function addPlaybackHistoryEntry(entry: PlaybackHistoryEntry) {
  const history = await getPlaybackHistory();
  const updated = [entry, ...history.filter((item) => item.itemId !== entry.itemId)].slice(0, HISTORY_LIMIT);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function clearPlaybackHistory() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
