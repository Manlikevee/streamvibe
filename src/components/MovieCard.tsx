import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  image: string | null;
  fallbackImage?: string | null;
  width: number;
  aspect?: number;
  caption?: string;
  badge?: string;
  meta?: { icon: IconName; label: string }[];
  onPress?: () => void;
}

export function MovieCard({ image, fallbackImage, width, aspect = 1.5, caption, badge, meta, onPress }: Props) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const source = image && failedImage !== image
    ? image
    : fallbackImage && failedImage !== fallbackImage
      ? fallbackImage
      : null;
  return (
    <Pressable onPress={onPress} style={[styles.card, { width }]}>
      <View style={[styles.imageWrap, { aspectRatio: aspect }]}>
        {source ? (
          <Image
            source={{ uri: source }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setFailedImage(source)}
          />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {caption ? (
        <Text numberOfLines={2} style={styles.caption}>
          {caption}
        </Text>
      ) : null}
      {meta?.length ? (
        <View style={styles.metaRow}>
          {meta.map((m) => (
            <View key={m.label} style={styles.meta}>
              <Ionicons name={m.icon} size={12} color={colors.mutedLight} />
              <Text style={styles.metaText}>{m.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  imageWrap: { width: '100%', borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.card },
  image: { width: '100%', height: '100%' },
  placeholder: { backgroundColor: colors.cardBorder },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.red,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: 11, color: colors.white },
  caption: { fontFamily: fonts.medium, fontSize: 14, color: colors.white },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  metaText: { fontFamily: fonts.regular, fontSize: 12, color: colors.mutedLight },
});
