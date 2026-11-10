import VLCPlayer, { type VLCPlayerRef } from '@lunarr/vlc-player';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import Slider from '@react-native-community/slider';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts } from '@/constants/theme';
import { addPlaybackHistoryEntry } from '@/services/playbackHistory';

function Playback({ source, title }: { source: string; title: string }) {
  const player = useRef<VLCPlayerRef>(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const { width, height } = useWindowDimensions();
  const videoWidth = Math.min(width - 32, Math.max(180, (height - 190) * (16 / 9)));
  const seekBy = (seconds: number) => player.current?.seek(Math.max(0, Math.min(progress.duration, progress.currentTime + seconds)));
  return (
    <View style={styles.playerWrap}>
      <VLCPlayer
        ref={player}
        source={{ uri: source, isNetwork: true, mediaOptions: ['network-caching=3000'] }}
        style={[styles.video, { width: videoWidth, height: videoWidth * (9 / 16) }]}
        autoplay
        resizeMode="contain"
        showNowPlaying={false}
        onProgress={({ currentTime, duration }) => {
          setProgress({ currentTime, duration });
          if (!isSeeking) setSeekPosition(currentTime);
        }}
        progressUpdateInterval={700}
        onPlaying={() => { setPlaying(true); setBuffering(false); }}
        onPaused={() => setPlaying(false)}
        onBuffer={(event) => setBuffering(Boolean(event.isBuffering))}
        onLoad={() => setBuffering(false)}
        onError={(event) => { setBuffering(false); setPlaybackError(event.type || 'VLC could not play this stream.'); }}
      />
      {buffering && !playbackError ? <ActivityIndicator color={colors.red} style={styles.playerLoading} /> : null}
      {playbackError ? <Text style={styles.playerError}>{playbackError}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.controls}>
        <Pressable onPress={() => seekBy(-10)} hitSlop={10} accessibilityLabel="Rewind 10 seconds">
          <Ionicons name="play-back" size={24} color={colors.white} />
        </Pressable>
        <Pressable onPress={() => { if (playing) player.current?.pause(); else player.current?.play(); }} hitSlop={10} accessibilityLabel={playing ? 'Pause playback' : 'Start playback'}>
          <Ionicons name={playing ? 'pause-circle' : 'play-circle'} size={46} color={colors.white} />
        </Pressable>
        <Pressable onPress={() => seekBy(10)} hitSlop={10} accessibilityLabel="Forward 10 seconds">
          <Ionicons name="play-forward" size={24} color={colors.white} />
        </Pressable>
      </View>
      <View style={styles.seekRow}>
        <Text style={styles.status}>{formatTime(isSeeking ? seekPosition : progress.currentTime)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={Math.max(progress.duration, 1)}
          value={Math.min(isSeeking ? seekPosition : progress.currentTime, Math.max(progress.duration, 1))}
          minimumTrackTintColor={colors.red}
          maximumTrackTintColor={colors.cardBorder}
          thumbTintColor={colors.white}
          disabled={progress.duration <= 0 || !!playbackError}
          onSlidingStart={() => setIsSeeking(true)}
          onValueChange={setSeekPosition}
          onSlidingComplete={(value) => {
            player.current?.seek(value);
            setProgress((current) => ({ ...current, currentTime: value }));
            setIsSeeking(false);
          }}
          accessibilityLabel="Seek through video"
        />
        <Text style={styles.status}>{formatTime(progress.duration)}</Text>
      </View>
    </View>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}` : `${minutes}:${String(remaining).padStart(2, '0')}`;
}

export default function PlayerScreen() {
  const { id, title, source } = useLocalSearchParams<{ id: string; title?: string; source?: string }>();
  const cdnSource = source?.startsWith('https://cdn.shutter.ng/p/home/') ? source : null;
  const [landscape, setLandscape] = useState(false);
  useEffect(() => () => { ScreenOrientation.unlockAsync().catch(() => {}); }, []);
  const toggleOrientation = async () => {
    try {
      if (landscape) await ScreenOrientation.unlockAsync();
      else await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setLandscape((value) => !value);
    } catch {
      // Keep playback usable on devices that reject a programmatic orientation lock.
    }
  };
  useEffect(() => {
    if (cdnSource) addPlaybackHistoryEntry({ itemId: id, title: title ?? id, streamUrl: cdnSource, playedAt: Date.now() }).catch(() => {});
  }, [cdnSource, id, title]);
  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.heading}>Now Playing</Text>
        <Pressable onPress={toggleOrientation} hitSlop={10} accessibilityLabel={landscape ? 'Return to automatic orientation' : 'Rotate to landscape'} style={styles.rotateButton}>
          <Ionicons name="phone-landscape-outline" size={22} color={colors.white} />
        </Pressable>
      </View>
      {!cdnSource ? <Text style={styles.error}>This video has no valid CDN playback link. Open it from the library again.</Text> : <Playback source={cdnSource} title={title ?? 'StreamVibe'} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  rotateButton: { marginLeft: 'auto', width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  back: { color: colors.white, fontSize: 36, lineHeight: 40 },
  heading: { color: colors.white, fontFamily: fonts.semibold, fontSize: 18 },
  playerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  video: { backgroundColor: '#000' },
  playerLoading: { marginVertical: 8 },
  playerError: { color: colors.error, fontFamily: fonts.regular, fontSize: 13 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 36, marginTop: 2 },
  seekRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8 },
  slider: { flex: 1, height: 36 },
  title: { color: colors.white, fontFamily: fonts.semibold, fontSize: 18 },
  status: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  error: { margin: 20, color: colors.error, fontFamily: fonts.regular, textAlign: 'center' },
});
