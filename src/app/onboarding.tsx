import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const SLIDES = [
  {
    icon: 'film-outline',
    title: 'Unlimited movies & shows',
    text: 'Stream thousands of blockbusters, hit series and hidden gems, all in one place.',
  },
  {
    icon: 'tv-outline',
    title: 'Watch on any device',
    text: 'Pick up where you left off on your phone, tablet or TV, wherever you are.',
  },
  {
    icon: 'ticket-outline',
    title: 'Start your free trial',
    text: 'Try StreamVibe free for 7 days. Cancel anytime, no commitments.',
  },
] as const;

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const { completeOnboarding } = useAuth();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const finish = async () => {
    await completeOnboarding();
    router.replace('/login');
  };

  const next = () => {
    if (isLast) return finish();
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={finish} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={[...SLIDES]}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.iconRing}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={56} color={colors.white} />
              </View>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button title={isLast ? 'Get Started' : 'Next'} onPress={next} fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingVertical: 12 },
  skip: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 18 },
  iconRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(229,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.white, textAlign: 'center' },
  text: { fontFamily: fonts.light, fontSize: 15, lineHeight: 24, color: colors.muted, textAlign: 'center' },
  footer: { padding: 24, gap: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.cardBorder },
  dotActive: { width: 24, backgroundColor: colors.red },
});
