import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Loading, ErrorState, Screen } from '@/components/ui/Screen';
import { colors, fonts, radius } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { getBackendCollections } from '@/services/backend';
import type { MediaKind } from '@/types';

export default function GenresScreen() {
  const { kind } = useLocalSearchParams<{ kind: MediaKind }>();
  const { data, error, loading, retry } = useAsync(() => getBackendCollections(kind), [kind]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Could not load genres.'} onRetry={retry} />;

  const genres = [...data.genres].sort((a, b) => b.title_count - a.title_count || a.name.localeCompare(b.name));
  const label = kind === 'movie' ? 'movies' : 'shows';

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <View>
          <Text style={styles.title}>Genres</Text>
          <Text style={styles.subtitle}>Sorted by number of {label}</Text>
        </View>
      </View>
      <FlatList
        data={genres}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.empty}>No genres found.</Text>}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push(`/category/${kind}/${item.id}?name=${encodeURIComponent(item.name)}`)}
            style={styles.row}
          >
            <Text style={styles.rank}>{index + 1}</Text>
            <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
            <Text style={styles.count}>{item.title_count} {label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 21, color: colors.white },
  subtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 28 },
  separator: { height: 1, backgroundColor: colors.border },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rank: { width: 24, color: colors.red, fontFamily: fonts.bold, fontSize: 14, textAlign: 'center' },
  name: { flex: 1, color: colors.white, fontFamily: fonts.medium, fontSize: 15 },
  count: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, backgroundColor: colors.card, paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.sm },
  empty: { color: colors.muted, fontFamily: fonts.regular, textAlign: 'center', padding: 24 },
});
