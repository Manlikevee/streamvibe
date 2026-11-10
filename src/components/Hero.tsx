import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';
import type { Title } from '@/types';
import { detailPath } from '@/utils/format';
import { Button } from './ui/Button';

export function Hero({ item, fallbackImage }: { item: Title; fallbackImage?: string | null }) {
  const [failedImages, setFailedImages] = useState(0);
  const images = [item.backdrop, item.poster, fallbackImage].filter((image, index, all): image is string =>
    Boolean(image) && all.indexOf(image) === index,
  );
  const image = images[failedImages];
  return (
    <View style={styles.wrap}>
      {image ? <Image source={{ uri: image }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setFailedImages((count) => count + 1)} /> : null}
      <View style={styles.shade} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Button title="Play Now" icon="play" onPress={() => router.push(detailPath(item.kind, item.libraryId ?? item.id))} fullWidth />
        <View style={styles.actions}>
          <CircleIcon name="add" />
          <CircleIcon name="thumbs-up-outline" />
          <CircleIcon name="volume-high-outline" />
        </View>
      </View>
    </View>
  );
}

export function CircleIcon({ name, onPress }: { name: React.ComponentProps<typeof Ionicons>['name']; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.circle}>
      <Ionicons name={name} size={18} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 360, overflow: 'hidden', backgroundColor: colors.card },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,20,20,0.35)' },
  content: { flex: 1, justifyContent: 'flex-end', padding: 20, gap: 14, backgroundColor: 'transparent' },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.white, textAlign: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
