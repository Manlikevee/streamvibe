import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/constants/theme';
import { addPlaybackHistoryEntry } from '@/services/playbackHistory';

const CDN_PREFIX = 'https://cdn.shutter.ng/p/home/';
const CONTROLS_TIMEOUT_MS = 3500;
const SKIP_SECONDS = 10;

const firstParam = (value) => (Array.isArray(value) ? value[0] : value) ?? '';

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = String(total % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${secs}` : `${minutes}:${secs}`;
}

function VideoStage({ source, title, isLandscape, onToggleOrientation }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const player = useVideoPlayer({ uri: source }, (instance) => {
    instance.loop = false;
    instance.timeUpdateEventInterval = 0.5;
    instance.staysActiveInBackground = false;
    instance.showNowPlayingNotification = false;
    instance.play();
  });

  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrubbing, setScrubbing] = useState(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef(null);

  useEffect(() => {
    const subscriptions = [
      player.addListener('playingChange', ({ isPlaying }) => setPlaying(isPlaying)),
      player.addListener('timeUpdate', ({ currentTime }) => setTime(currentTime ?? 0)),
      player.addListener('statusChange', ({ status: next, error: err }) => {
        setStatus(next);
        if (next === 'readyToPlay') setDuration(player.duration || 0);
        if (next === 'error') setError(err?.message || 'This video could not be played on this device.');
      }),
    ];
    return () => subscriptions.forEach((sub) => sub.remove());
  }, [player]);

  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), CONTROLS_TIMEOUT_MS);
  }, []);

  // Controls stay up while paused and fade after a few seconds of playback.
  useEffect(() => {
    if (playing) scheduleHide();
    else {
      clearTimeout(hideTimer.current);
    }
    return () => clearTimeout(hideTimer.current);
  }, [playing, scheduleHide]);

  const wake = () => {
    setControlsVisible(true);
    if (playing) scheduleHide();
  };

  const maxTime = Math.max(duration, 1);
  const shownTime = scrubbing ?? time;

  const seekTo = (seconds) => {
    const next = Math.min(Math.max(0, seconds), maxTime);
    // VideoPlayer.currentTime is Expo Video's documented seek API.
    // eslint-disable-next-line react-hooks/immutability
    player.currentTime = next;
    setTime(next);
    wake();
  };

  const togglePlay = () => {
    if (playing) player.pause();
    else player.play();
    wake();
  };

  const stageHeight = isLandscape ? height : width * (9 / 16);
  const stageWidth = isLandscape ? width : width;
  const busy = status !== 'readyToPlay' && !error;

  return (
    <View style={[styles.stage, { width: stageWidth, height: stageHeight }]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls={false}
        allowsPictureInPicture={false}
      />

      {/* Tap anywhere on the video to show or hide controls. */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => (controlsVisible ? setControlsVisible(false) : wake())}
        accessibilityLabel="Toggle playback controls"
      />

      {busy ? (
        <ActivityIndicator size="large" color={colors.red} style={StyleSheet.absoluteFill} pointerEvents="none" />
      ) : null}

      {error ? (
        <View style={styles.errorBox} pointerEvents="none">
          <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
          <Text style={styles.errorTitle}>Can&apos;t play this video</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorText}>Use VLC or MX Player from the title page instead.</Text>
        </View>
      ) : null}

      {controlsVisible || !playing ? (
        <View style={styles.overlay} pointerEvents="box-none">
          {isLandscape ? <View style={styles.landscapeTopSpacer}/> : (
          <View style={[styles.topBar, { paddingTop: 10 }]} pointerEvents="box-none">
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton} accessibilityLabel="Back">
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </Pressable>
            <Text numberOfLines={1} style={styles.topTitle}>{title}</Text>
          </View>
          )}

          <View style={styles.centerRow} pointerEvents="box-none">
            <Pressable onPress={() => { seekTo(time - SKIP_SECONDS); }} hitSlop={12} style={styles.skipButton} accessibilityLabel="Rewind 10 seconds">
              <Ionicons name="play-back" size={28} color={colors.white} />
            </Pressable>
            <Pressable onPress={togglePlay} hitSlop={12} style={styles.playButton} accessibilityLabel={playing ? 'Pause' : 'Play'}>
              <Ionicons name={playing ? 'pause' : 'play'} size={34} color={colors.white} style={playing ? null : styles.playIcon} />
            </Pressable>
            <Pressable onPress={() => { seekTo(time + SKIP_SECONDS); }} hitSlop={12} style={styles.skipButton} accessibilityLabel="Forward 10 seconds">
              <Ionicons name="play-forward" size={28} color={colors.white} />
            </Pressable>
          </View>

          <View style={[styles.bottomBar, { paddingBottom: isLandscape ? insets.bottom + 10 : 12, paddingHorizontal: isLandscape ? insets.left + 16 : 16 }]} pointerEvents="box-none">
            <View style={styles.seekRow}>
              {isLandscape ? (
                <Pressable onPress={() => router.back()} hitSlop={12} style={styles.iconButton} accessibilityLabel="Back">
                  <Ionicons name="chevron-back" size={22} color={colors.white} />
                </Pressable>
              ) : null}
              <Text style={styles.time}>{formatTime(shownTime)}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={maxTime}
                value={Math.min(shownTime, maxTime)}
                minimumTrackTintColor={colors.red}
                maximumTrackTintColor="rgba(255,255,255,0.25)"
                thumbTintColor={colors.red}
                disabled={duration <= 0}
                onSlidingStart={() => setScrubbing(time)}
                onValueChange={(value) => setScrubbing(value)}
                onSlidingComplete={(value) => {
                  setScrubbing(null);
                  seekTo(value);
                }}
                accessibilityLabel="Seek through video"
              />
              <Text style={styles.time}>{formatTime(duration)}</Text>
              <Pressable onPress={onToggleOrientation} hitSlop={12} style={styles.iconButton} accessibilityLabel={isLandscape ? 'Exit fullscreen' : 'Enter fullscreen'}>
                <Ionicons name={isLandscape ? 'contract-outline' : 'expand-outline'} size={20} color={colors.white} />
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function PlayerScreen() {
  const params = useLocalSearchParams();
  const id = firstParam(params.id);
  const title = firstParam(params.title) || 'StreamVibe';
  const source = firstParam(params.source);
  const mediaId = firstParam(params.mediaId) || id;
  const mediaKind = firstParam(params.kind);
  const poster = firstParam(params.poster);
  const backdrop = firstParam(params.backdrop);
  const cdnSource = source.startsWith(CDN_PREFIX) ? source : null;

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();

  useEffect(() => () => { ScreenOrientation.unlockAsync().catch(() => {}); }, []);

  useEffect(() => {
    if (cdnSource) {
      addPlaybackHistoryEntry({
        itemId: id,
        mediaId,
        kind: mediaKind,
        title,
        poster: poster || null,
        backdrop: backdrop || null,
        streamUrl: cdnSource,
        playedAt: Date.now(),
      }).catch(() => {});
    }
  }, [backdrop, cdnSource, id, mediaId, mediaKind, poster, title]);

  const toggleOrientation = () => {
    ScreenOrientation.lockAsync(
      isLandscape ? ScreenOrientation.OrientationLock.PORTRAIT_UP : ScreenOrientation.OrientationLock.LANDSCAPE,
    ).catch(() => {});
  };

  if (!cdnSource) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backFallback}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.message}>This video has no valid playback link. Open it from the library again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden={isLandscape} style="light" />
      <View style={isLandscape ? null : [styles.topSafe, { paddingTop: insets.top }]}>
        <VideoStage
          key={cdnSource}
          source={cdnSource}
          title={title}
          isLandscape={isLandscape}
          onToggleOrientation={toggleOrientation}
        />
      </View>
      {!isLandscape ? (
        <View style={styles.info}>
          <Text style={styles.infoTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.infoHint}>Tap the video for controls. Use the expand button for fullscreen.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topSafe: { backgroundColor: '#000' },
  stage: { backgroundColor: '#000', overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', backgroundColor: 'transparent' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 16, paddingBottom: 12, backgroundColor: 'rgba(0,0,0,0.45)' },
  landscapeTopSpacer: { height: 1 },
  topTitle: { flex: 1, color: colors.white, fontFamily: fonts.semibold, fontSize: 16 },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,15,15,0.7)' },
  centerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
  playButton: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(229,0,0,0.92)' },
  playIcon: { marginLeft: 4 },
  skipButton: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15,15,15,0.6)' },
  bottomBar: { paddingTop: 16, backgroundColor: 'rgba(0,0,0,0.5)' },
  seekRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slider: { flex: 1, height: 36 },
  time: { color: colors.white, fontFamily: fonts.medium, fontSize: 12, minWidth: 44, textAlign: 'center', fontVariant: ['tabular-nums'] },
  errorBox: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8, backgroundColor: 'rgba(0,0,0,0.8)' },
  errorTitle: { color: colors.white, fontFamily: fonts.bold, fontSize: 17 },
  errorText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, textAlign: 'center' },
  info: { padding: 18, gap: 8 },
  infoTitle: { color: colors.white, fontFamily: fonts.bold, fontSize: 20 },
  infoHint: { color: colors.muted, fontFamily: fonts.light, fontSize: 13 },
  message: { margin: 20, color: colors.error, fontFamily: fonts.regular, textAlign: 'center' },
  backFallback: { margin: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
});
