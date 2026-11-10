import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { colors, fonts, radius } from '@/constants/theme';
import { useCachedAsync } from '@/hooks/useCachedAsync';
import { getBackendCatalog, searchBackendTitles } from '@/services/backend';
import type { MediaKind } from '@/types';
import { detailPath } from '@/utils/format';

type SearchKind = 'all' | MediaKind;

export default function Search() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<SearchKind>('all');
  const { data, error, loading, retry } = useCachedAsync(
    () => search ? searchBackendTitles(search, kind) : getBackendCatalog(kind),
    `search:${kind}:${search.toLocaleLowerCase() || 'catalog'}`,
    [search, kind],
  );
  const { width } = useWindowDimensions();
  const cardWidth = (width - 44) / 2;
  const results = data ?? [];
  const submitSearch = () => {
    const nextSearch = query.trim();
    if (nextSearch === search) retry();
    else setSearch(nextSearch);
  };
  const clearSearch = () => {
    setQuery('');
    if (search) setSearch('');
    else retry();
  };
  const feedback = query.trim() !== search
    ? `Press Search to find “${query.trim()}”.`
    : loading
      ? search ? 'Refreshing results…' : 'Updating your library…'
      : error && data
        ? 'Could not refresh. Showing saved results.'
        : search
          ? `${results.length} result${results.length === 1 ? '' : 's'} for “${search}”.`
          : `${results.length} titles in your library.`;

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.heading}>Search</Text>
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={19} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search movies and shows"
            placeholderTextColor={colors.muted}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={submitSearch}
            style={styles.input}
            accessibilityLabel="Search your movie and show library"
          />
          {query ? (
            <Pressable onPress={clearSearch} hitSlop={10} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={19} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
        <Button title="Search" icon="search" onPress={submitSearch} style={styles.searchButton} />
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
      <View style={styles.feedbackRow} accessibilityLiveRegion="polite">
        {loading ? <ActivityIndicator size="small" color={colors.red} /> : null}
        <Text numberOfLines={2} style={styles.feedback}>{feedback}</Text>
      </View>
      {loading && !data ? <ActivityIndicator color={colors.red} size="large" style={{ marginTop: 20 }} /> : null}
      {error && !data ? (
        <View style={styles.state}>
          <Text style={styles.message}>{error}</Text>
          <Button title="Try again" variant="secondary" onPress={retry} />
        </View>
      ) : null}
      <FlatList
          key={kind}
          data={results}
          numColumns={2}
              keyExtractor={(item) => String(item.id)}
          columnWrapperStyle={styles.resultRow}
          contentContainerStyle={styles.results}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
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
            <Text style={styles.empty}>{loading ? 'Loading titles…' : search ? `No titles found for “${search}”.` : error ?? 'Your library is empty.'}</Text>
          }
        />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  heading: { fontFamily: fonts.bold, fontSize: 21, color: colors.white },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 6, marginBottom: 8 },
  searchBox: { flex: 1, height: 48, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.md },
  searchButton: { paddingHorizontal: 12 },
  input: { flex: 1, height: '100%', color: colors.white, fontFamily: fonts.regular, fontSize: 15 },
  filter: { marginHorizontal: 16, marginBottom: 8 },
  feedbackRow: { minHeight: 22, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedback: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  results: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 18 },
  resultRow: { gap: 12 },
  empty: { padding: 24, color: colors.muted, textAlign: 'center', fontFamily: fonts.regular },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  message: { color: colors.muted, fontFamily: fonts.regular, textAlign: 'center' },
});
