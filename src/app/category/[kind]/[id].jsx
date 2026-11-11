import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { MovieCard } from '@/components/MovieCard';
import { ErrorState, Loading, Screen } from '@/components/ui/Screen';
import { colors, fonts } from '@/constants/theme';
import { useCachedAsync } from '@/hooks/useCachedAsync';
import { getBackendCategoryTitles, getBackendRecentlyReleasedPage } from '@/services/backend';
import { detailPath } from '@/utils/format';
export default function Category() {
    const { kind, id, name, type, year: yearParam } = useLocalSearchParams();
    const { width } = useWindowDimensions();
    const cardW = (width - 16 * 2 - 12) / 2;
    const [searchDraft, setSearchDraft] = useState('');
    const [search, setSearch] = useState('');
    const [moreState, setMoreState] = useState({ key: '', titles: [], page: 1, hasMore: false, loading: false, error: '' });
    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchDraft.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchDraft]);
    const cacheKey = `category:${kind}:${type ?? 'genre'}:${id}:${yearParam ?? ''}:${search.toLocaleLowerCase()}`;
    const { data, error, loading, retry } = useCachedAsync(async () => {
        if (type === 'recent') {
            return getBackendRecentlyReleasedPage(kind, Number(yearParam) || new Date().getFullYear(), 1, search);
        }
        return getBackendCategoryTitles(kind, Number(id), type === 'library' ? 'library' : 'genre', search);
    }, cacheKey, [kind, id, type, search, yearParam]);
    const requestKey = `${kind}:${id}:${type}:${yearParam}:${search}`;
    const currentMore = moreState.key === requestKey
        ? moreState
        : { key: requestKey, titles: [], page: 1, hasMore: Boolean(data?.hasMore), loading: false, error: '' };
    const titles = type === 'recent' ? [...(data?.results ?? []), ...currentMore.titles] : data;
    const loadMore = async () => {
        if (currentMore.loading || !currentMore.hasMore) return;
        setMoreState({ ...currentMore, loading: true, error: '' });
        try {
            const next = await getBackendRecentlyReleasedPage(kind, Number(yearParam) || new Date().getFullYear(), currentMore.page + 1, search);
            setMoreState((current) => current.key === requestKey
                ? { ...current, titles: [...current.titles, ...next.results], page: current.page + 1, hasMore: next.hasMore, loading: false }
                : current);
        } catch {
            setMoreState((current) => current.key === requestKey
                ? { ...current, loading: false, error: 'Could not load more titles. Tap to try again.' }
                : current);
        }
    };
    if (!data && loading)
        return <Loading />;
    if (!data && error)
        return <ErrorState message={error} onRetry={retry}/>;
    if (!data)
        return <ErrorState message="Nothing found." onRetry={retry}/>;
    return (<Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.white}/>
        </Pressable>
        <Text style={styles.title}>{name ?? 'Browse'}</Text>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted}/>
        <TextInput value={searchDraft} onChangeText={setSearchDraft} placeholder={`Search ${name ?? 'titles'}`} placeholderTextColor={colors.muted} returnKeyType="search" style={styles.searchInput} accessibilityLabel="Search titles in this category"/>
        {searchDraft ? (<Pressable onPress={() => setSearchDraft('')} hitSlop={10} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={colors.muted}/>
          </Pressable>) : null}
      </View>
      <FlatList data={titles ?? []} numColumns={2} keyExtractor={(i) => String(i.id)} columnWrapperStyle={{ gap: 12 }} contentContainerStyle={{ padding: 16, gap: 18 }} ListEmptyComponent={<Text style={styles.empty}>No titles found in this category.</Text>} ListFooterComponent={type === 'recent' && currentMore.hasMore ? (<View style={styles.loadMoreWrap}><Pressable onPress={loadMore} disabled={currentMore.loading} style={styles.loadMore} accessibilityRole="button"><Text style={styles.loadMoreText}>{currentMore.loading ? 'Loading…' : 'View more'}</Text></Pressable>{currentMore.error ? <Text onPress={loadMore} style={styles.empty}>{currentMore.error}</Text> : null}</View>) : null} renderItem={({ item }) => (<MovieCard image={item.poster ?? item.backdrop} fallbackImage={item.poster ? item.backdrop : null} width={cardW} aspect={0.68} caption={item.title} onPress={() => router.push(detailPath(item.kind, item.id))}/>)}/>
    </Screen>);
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
    loadMoreWrap: { alignItems: 'center', gap: 8, paddingVertical: 14 },
    loadMore: { minWidth: 140, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.card, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center' },
    loadMoreText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 14 },
});
