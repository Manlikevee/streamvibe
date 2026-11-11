import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { Section } from "@/components/ui/Section";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { colors, fonts, radius } from "@/constants/theme";
import { useCachedAsync } from "@/hooks/useCachedAsync";
import {
  getBackendCollections,
  getBackendGenreTitles,
} from "@/services/backend";
import { getFavorites } from "@/services/favorites";
import { getPlaybackHistory } from "@/services/playbackHistory";
import { detailPath, formatCount, formatDate } from "@/utils/format";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
async function loadHome(kind) {
  const collections = await getBackendCollections(kind);
  const sortedGenres = [...collections.genres].sort(
    (a, b) => b.title_count - a.title_count || a.name.localeCompare(b.name),
  );
  const genreResults = await Promise.all(
    sortedGenres.slice(0, 6).map(async (genre) => ({
      genre,
      items: await getBackendGenreTitles(kind, genre.id).catch(() => []),
    })),
  );
  const byGenre = genreResults.map(({ genre, items }) => ({
    genre,
    items: items.slice(0, 4),
  }));
  return {
    trending: collections.popular,
    newReleases: [...collections.recentlyReleased].sort((a, b) =>
      (b.date || "").localeCompare(a.date || ""),
    ),
    topRated: collections.topRated,
    byGenre,
    genreCount: sortedGenres.length,
    libraries: collections.libraries,
    year: collections.year,
  };
}
export default function Home() {
  const [kind, setKind] = useState("movie");
  const [playbackHistory, setPlaybackHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getPlaybackHistory(), getFavorites()])
        .then(([history, saved]) => {
          if (active) {
            setPlaybackHistory(history);
            setFavorites(saved);
          }
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, []),
  );
  const { data, error, loading, retry } = useCachedAsync(
    () => loadHome(kind),
    `home:${kind}`,
    [kind],
  );
  const { width } = useWindowDimensions();
  const cardW = width * 0.72;
  const artwork = data
    ? [...data.trending, ...data.newReleases, ...data.topRated]
        .flatMap((title) => [title.poster, title.backdrop])
        .filter((image) => Boolean(image))
    : [];
  const fallbackArtwork = artwork[0] ?? null;
  const lastWatchedMovie = playbackHistory.find(
    (entry) => entry.kind === "movie" && entry.mediaId,
  );
  const heroItem = lastWatchedMovie
    ? {
        id: lastWatchedMovie.mediaId,
        kind: "movie",
        title: lastWatchedMovie.title,
        poster: lastWatchedMovie.poster ?? null,
        backdrop: lastWatchedMovie.backdrop ?? lastWatchedMovie.poster ?? null,
        date: "",
        rating: 0,
        votes: 0,
        popularity: 0,
        genreIds: [],
      }
    : data?.trending[0];
  const cardArtwork = (title, landscape = true) => {
    const primary =
      (landscape ? title.backdrop : title.poster) ||
      title.poster ||
      title.backdrop ||
      fallbackArtwork;
    const fallback =
      [title.poster, title.backdrop, ...artwork].find(
        (image) => Boolean(image) && image !== primary,
      ) ?? null;
    return { image: primary, fallbackImage: fallback };
  };
  return (
    <Screen edges={["top"]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={retry}
            tintColor={colors.red}
            colors={[colors.red]}
          />
        }
      >
        {!data ? (
          loading ? (
            <ActivityIndicator
              color={colors.red}
              style={{ marginTop: 60 }}
              size="large"
            />
          ) : (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {error ?? "Could not load titles."}
              </Text>
              <Button title="Try again" onPress={retry} />
            </View>
          )
        ) : (
          <>
            {heroItem ? (
              <Hero item={heroItem} fallbackImage={fallbackArtwork} />
            ) : null}
            <SegmentedControl
              options={[
                { label: "Movies", value: "movie" },
                { label: "Shows", value: "tv" },
              ]}
              value={kind}
              onChange={setKind}
              style={styles.toggle}
            />

            <Section
              title="Our Genres"
              actionLabel={
                data.genreCount > data.byGenre.length ? "View more" : undefined
              }
              onAction={() => router.push(`/genres/${kind}`)}
            >
              <Row>
                {data.byGenre.map((b) => (
                  <GenreCard
                    key={b.genre.id}
                    name={b.genre.name}
                    posters={b.items.map((i) => i.poster)}
                    fallbackPosters={artwork}
                    onPress={() =>
                      router.push(
                        `/category/${kind}/${b.genre.id}?name=${encodeURIComponent(b.genre.name)}`,
                      )
                    }
                  />
                ))}
              </Row>
            </Section>

            <Section title="Popular Top 10 In Genres">
              <Row>
                {data.byGenre.map((b) => (
                  <GenreCard
                    key={`top-${b.genre.id}`}
                    name={b.genre.name}
                    badge="Top 10 In"
                    posters={b.items.map((i) => i.poster)}
                    fallbackPosters={artwork}
                    onPress={() =>
                      router.push(
                        `/category/${kind}/${b.genre.id}?name=${encodeURIComponent(b.genre.name)}`,
                      )
                    }
                    wide
                  />
                ))}
              </Row>
            </Section>

            <Section title="Trending Now">
              <Row>
                {data.trending.map((t) => (
                  <MovieCard
                    key={t.id}
                    {...cardArtwork(t)}
                    width={cardW}
                    aspect={1.6}
                    caption={t.title}
                    onPress={() => router.push(detailPath(t.kind, t.id))}
                    meta={[
                      {
                        icon: "calendar-outline",
                        label: t.date ? t.date.slice(0, 4) : "TBA",
                      },
                      { icon: "eye-outline", label: formatCount(t.popularity) },
                    ]}
                  />
                ))}
              </Row>
            </Section>

            <Section title="Libraries">
              <Row>
                <Pressable
                  onPress={() =>
                    router.push(
                      `/category/${kind}/recently-released?type=recent&year=${data.year}&name=${encodeURIComponent(`Recently Released ${kind === "movie" ? "Movies" : "Series"} · ${data.year}`)}`,
                    )
                  }
                  style={styles.libraryCard}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={22}
                    color={colors.red}
                  />
                  <Text numberOfLines={1} style={styles.genreName}>
                    Recently Released
                  </Text>
                  <Text style={styles.libraryCount}>
                    {data.year} · {kind === "movie" ? "Movies" : "Series"}
                  </Text>
                </Pressable>
                {data.libraries.map((library) => (
                  <Pressable
                    key={library.id}
                    onPress={() =>
                      router.push(
                        `/category/${kind}/${library.id}?type=library&name=${encodeURIComponent(library.name)}`,
                      )
                    }
                    style={styles.libraryCard}
                  >
                    <Ionicons
                      name="albums-outline"
                      size={22}
                      color={colors.red}
                    />
                    <Text numberOfLines={1} style={styles.genreName}>
                      {library.name}
                    </Text>
                    <Text style={styles.libraryCount}>
                      {formatCount(library.title_count)} titles
                    </Text>
                  </Pressable>
                ))}
              </Row>
            </Section>

            <Section
              title={`Recently Released ${kind === "movie" ? "Movies" : "Series"} · ${data.year}`}
              actionLabel="View more"
              onAction={() =>
                router.push(
                  `/category/${kind}/recently-released?type=recent&year=${data.year}&name=${encodeURIComponent(`Recently Released ${kind === "movie" ? "Movies" : "Series"} · ${data.year}`)}`,
                )
              }
            >
              <Row>
                {data.newReleases.map((t) => (
                  <MovieCard
                    key={t.id}
                    {...cardArtwork(t, false)}
                    width={cardW * 0.8}
                    aspect={0.75}
                    caption={t.title}
                    onPress={() => router.push(detailPath(t.kind, t.id))}
                    meta={[
                      {
                        icon: "calendar-outline",
                        label: `Released ${formatDate(t.date)}`,
                      },
                    ]}
                  />
                ))}
              </Row>
            </Section>

            <Section title="My Favorites">
              {favorites.length ? (
                <Row>
                  {favorites.map((item) => (
                    <MovieCard
                      key={`${item.kind}:${item.id}`}
                      {...cardArtwork(item, false)}
                      width={cardW * 0.8}
                      aspect={0.75}
                      caption={item.title}
                      badge={item.kind === "movie" ? "Movie" : "Series"}
                      onPress={() =>
                        router.push(detailPath(item.kind, item.id))
                      }
                    />
                  ))}
                </Row>
              ) : (
                <Text style={styles.emptyFavorites}>
                  Tap the heart on any movie or series to save it here.
                </Text>
              )}
            </Section>

            <Section title="Must - Watch">
              <Row>
                {data.topRated.map((t) => (
                  <MovieCard
                    key={t.id}
                    {...cardArtwork(t)}
                    width={cardW}
                    aspect={1.6}
                    caption={t.title}
                    onPress={() => router.push(detailPath(t.kind, t.id))}
                    meta={[
                      { icon: "star", label: (t.rating / 2).toFixed(1) },
                      { icon: "people-outline", label: formatCount(t.votes) },
                    ]}
                  />
                ))}
              </Row>
            </Section>

            <CtaBanner image={data.topRated[0]?.backdrop} />
            <Footer />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
function Row({ children }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {children}
    </ScrollView>
  );
}
function GenreCard({
  name,
  posters,
  fallbackPosters = [],
  badge,
  onPress,
  wide,
}) {
  const { width } = useWindowDimensions();
  const w = wide ? width * 0.7 : width * 0.55;
  const gridW = w - 22;
  const cellW = (gridW - 4) / 2;
  const cellH = cellW * 0.68;
  const categoryPosters = posters.filter((poster) => Boolean(poster));
  const availablePosters = categoryPosters.length
    ? categoryPosters
    : fallbackPosters;
  const posterSlots = [0, 1, 2, 3].map((index) => ({
    key: `${name}-${index}`,
    uri: availablePosters.length
      ? availablePosters[index % availablePosters.length]
      : null,
  }));
  return (
    <Pressable onPress={onPress} style={[styles.genreCard, { width: w }]}>
      <View style={styles.posterGrid}>
        <FlatList
          data={posterSlots}
          numColumns={2}
          keyExtractor={(item) => item.key}
          scrollEnabled={false}
          style={{ width: gridW, height: cellH * 2 + 4 }}
          contentContainerStyle={styles.posterList}
          columnWrapperStyle={styles.posterRow}
          renderItem={({ item }) =>
            item.uri ? (
              <GenrePoster
                uri={item.uri}
                fallbackUri={fallbackPosters.find(
                  (poster) => poster !== item.uri,
                )}
                width={cellW}
                height={cellH}
              />
            ) : (
              <View
                style={[
                  styles.gridPoster,
                  {
                    width: cellW,
                    height: cellH,
                    backgroundColor: colors.cardBorder,
                  },
                ]}
              />
            )
          }
        />
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.genreFooter}>
        <Text style={styles.genreName}>{name}</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.white} />
      </View>
    </Pressable>
  );
}
function GenrePoster({ uri, fallbackUri, width, height }) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  if (fallbackFailed || (failed && !fallbackUri))
    return (
      <View
        style={[
          styles.gridPoster,
          { width, height, backgroundColor: colors.cardBorder },
        ]}
      />
    );
  return (
    <Image
      source={{ uri: failed ? fallbackUri : uri }}
      style={[styles.gridPoster, { width, height }]}
      contentFit="cover"
      onError={() => (failed ? setFallbackFailed(true) : setFailed(true))}
    />
  );
}
const styles = StyleSheet.create({
  toggle: { marginHorizontal: 16, marginTop: 8 },
  errorBox: { padding: 24, alignItems: "center", gap: 14, marginTop: 40 },
  errorText: {
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: "center",
  },
  row: { paddingHorizontal: 16, gap: 12 },
  genreCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: 10,
    gap: 12,
  },
  posterGrid: { width: "100%", borderRadius: radius.sm, overflow: "hidden" },
  posterList: { gap: 4 },
  posterRow: { justifyContent: "space-between", gap: 4 },
  gridPoster: { borderRadius: 3, flexShrink: 0 },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.red,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: 11, color: colors.white },
  genreFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  genreName: { fontFamily: fonts.medium, fontSize: 14, color: colors.white },
  libraryCard: {
    width: 170,
    minHeight: 100,
    padding: 14,
    gap: 8,
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
  },
  libraryCount: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
  },
  emptyFavorites: {
    marginHorizontal: 16,
    padding: 16,
    color: colors.muted,
    fontFamily: fonts.regular,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
  },
});
