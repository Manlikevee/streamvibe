import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { MovieCard } from '@/components/MovieCard';
import { ErrorState, Loading, Screen } from '@/components/ui/Screen';
import { colors, fonts } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { getBackendCategoryTitles } from '@/services/backend';
import type { MediaKind } from '@/types';
import { detailPath } from '@/utils/format';

export default function Category() {
  const { kind, id, name, type } = useLocalSearchParams<{ kind: MediaKind; id: string; name?: string; type?: 'genre' | 'library' }>();
  const { width } = useWindowDimensions();
  const cardW = (width - 16 * 2 - 12) / 2;
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchDraft.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchDraft]);
  const { data, error, loading, retry } = useAsync(
    () => getBackendCategoryTitles(kind, Number(id), type === 'library' ? 'library' : 'genre', search),
    [kind, id, type, search],
  );

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Nothing found.'} onRetry={retry} />;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>{name ?? 'Browse'}</Text>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={searchDraft}
          onChangeText={setSearchDraft}
          placeholder={`Search ${name ?? 'titles'}`}
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          style={styles.searchInput}
          accessibilityLabel="Search titles in this category"
        />
        {searchDraft ? (
          <Pressable onPress={() => setSearchDraft('')} hitSlop={10} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      <FlatList
        data={data ?? []}
        numColumns={2}
        keyExtractor={(i) => String(i.id)}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, gap: 18 }}
        ListEmptyComponent={<Text style={styles.empty}>No titles found in this category.</Text>}
        renderItem={({ item }) => (
          <MovieCard
            image={item.poster ?? item.backdrop}
            fallbackImage={item.poster ? item.backdrop : null}
            width={cardW}
            aspect={0.68}
            caption={item.title}
            onPress={() => router.push(detailPath(item.kind, item.id))}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.white, flexShrink: 1 },
  searchBox: {
    height: 46,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
  },
  searchInput: { flex: 1, height: '100%', color: colors.white, fontFamily: fonts.regular, fontSize: 15 },
  empty: { color: colors.muted, fontFamily: fonts.regular, paddingVertical: 24, textAlign: 'center' },
});
