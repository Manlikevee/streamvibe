import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';
import { Button } from './ui/Button';

export function CtaBanner({ image }: { image?: string | null }) {
  return (
    <View style={styles.wrap}>
      {image ? <Image source={{ uri: image }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
      <View style={styles.overlay} />
      <Text style={styles.title}>Start your free trial today!</Text>
      <Text style={styles.sub}>
        This is a clear and concise call to action that encourages users to sign up for a free trial of StreamVibe.
      </Text>
      <Button title="Start a Free Trial" onPress={() => router.navigate('/plans')} style={{ marginTop: 6 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 40,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 44,
    paddingHorizontal: 22,
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
  },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,20,20,0.82)' },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 34, color: colors.white, textAlign: 'center' },
  sub: { fontFamily: fonts.light, fontSize: 13, lineHeight: 22, color: colors.muted, textAlign: 'center' },
});
