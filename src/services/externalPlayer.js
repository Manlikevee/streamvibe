import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Linking, Platform } from 'react-native';
import { addPlaybackHistoryEntry } from '@/services/playbackHistory';

export const EXTERNAL_PLAYERS = {
  vlc: { name: 'VLC', packageName: 'org.videolan.vlc' },
  mx: { name: 'MX Player', packageName: 'com.mxtech.videoplayer.ad' },
  default: { name: 'a video player', packageName: null },
};

function notInstalled(player) {
  Alert.alert(`${player.name} is not installed`, 'Install it from Google Play, then try again.', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Open Play Store',
      onPress: () => Linking.openURL(`market://details?id=${player.packageName}`).catch(() => {}),
    },
  ]);
}

export async function openInExternalPlayer(key, url, title, historyEntry) {
  const player = EXTERNAL_PLAYERS[key] ?? EXTERNAL_PLAYERS.default;
  if (!url) {
    Alert.alert('No playback link', 'This video does not have a playable link yet.');
    return;
  }

  if (Platform.OS === 'ios') {
    if (key !== 'vlc') {
      Alert.alert('Not available on iOS', 'Use the in-app player, or install VLC from the App Store.');
      return;
    }
    const target = `vlc-x-callback://x-callback-url/stream?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(title)}`;
    try {
      await Linking.openURL(target);
      if (historyEntry) await addPlaybackHistoryEntry({ ...historyEntry, playedAt: new Date().toISOString() });
    } catch {
      Alert.alert('VLC is not installed', 'Install VLC from the App Store.');
    }
    return;
  }

  try {
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: url,
      type: 'video/*',
      packageName: player.packageName ?? undefined,
      extra: { title },
    });
    if (historyEntry) await addPlaybackHistoryEntry({ ...historyEntry, playedAt: new Date().toISOString() });
  } catch {
    if (player.packageName) notInstalled(player);
    else Alert.alert('No video player found', 'Install a video player such as VLC or MX Player.');
  }
}
