import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { colors, fonts, radius } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { getBackendCatalog, searchBackendTitles } from '@/services/backend';
import type { MediaKind } from '@/types';
import { detailPath } from '@/utils/format';

type SearchKind = 'all' | MediaKind;

export default function Search() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<SearchKind>('all');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const { data, error, loading, retry } = useAsync(
    () => search ? searchBackendTitles(search, kind) : getBackendCatalog(kind),
    [search, kind],
  );
  const { width } = useWindowDimensions();
  const cardWidth = (width - 44) / 2;
  const results = data ?? [];

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.heading}>Search</Text>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={19} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search movies and shows"
          placeholderTextColor={colors.muted}
          autoFocus
          returnKeyType="search"
          style={styles.input}
          accessibilityLabel="Search your movie and show library"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={19} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      <SegmentedControl
        options={[
          { label: 'All', value: 'all' },
          { label: 'Movies', value: 'movie' },
          { label: 'Shows', value: 'tv' },
        ]}
        value={kind}
        onChange={setKind}
        style={styles.filter}
      />
      {loading ? <ActivityIndicator color={colors.red} size="large" style={{ marginTop: 36 }} /> : null}
      {error ? (
        <View style={styles.state}>
          <Text style={styles.message}>{error}</Text>
          <Button title="Try again" variant="secondary" onPress={retry} />
        </View>
      ) : null}
      {!loading && !error ? (
        <FlatList
          key={kind}
          data={results}
          numColumns={2}
              keyExtractor={(item) => String(item.id)}
          columnWrapperStyle={styles.resultRow}
          contentContainerStyle={styles.results}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <MovieCard
              image={item.poster ?? item.backdrop}
              fallbackImage={item.poster ? item.backdrop : null}
              width={cardWidth}
              aspect={0.7}
              caption={item.title}
              badge={item.kind === 'movie' ? 'Movie' : 'Show'}
              onPress={() => router.push(detailPath(item.kind, item.id))}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{query ? 'No matching titles found.' : 'Search your library by title or description.'}</Text>
          }
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  heading: { fontFamily: fonts.bold, fontSize: 21, color: colors.white },
  searchBox: { height: 48, marginHorizontal: 16, marginTop: 6, marginBottom: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.md },
  input: { flex: 1, height: '100%', color: colors.white, fontFamily: fonts.regular, fontSize: 15 },
  filter: { marginHorizontal: 16, marginBottom: 8 },
  results: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 18 },
  resultRow: { gap: 12 },
  empty: { padding: 24, color: colors.muted, textAlign: 'center', fontFamily: fonts.regular },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  message: { color: colors.muted, fontFamily: fonts.regular, textAlign: 'center' },
});
