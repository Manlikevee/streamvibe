import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { openInExternalPlayer } from '@/services/externalPlayer';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '@/constants/theme';
import { formatCount, formatRuntime } from '@/utils/format';
import { CtaBanner } from './CtaBanner';
import { Footer } from './Footer';
import { CircleIcon } from './Hero';
import { Chip } from './ui/Chip';
import { Button } from './ui/Button';
import { RatingStars } from './ui/RatingStars';
import { clearPlaybackHistory, getPlaybackHistory } from '@/services/playbackHistory';
import { isFavorite, toggleFavorite } from '@/services/favorites';
function Panel({ icon, label, children }) {
    return (<View style={styles.panel}>
      <View style={styles.panelLabel}>
        {icon ? <Ionicons name={icon} size={16} color={colors.muted}/> : null}
        <Text style={styles.panelLabelText}>{label}</Text>
      </View>
      {children}
    </View>);
}
function PersonRow({ person }) {
    return (<View style={styles.personRow}>
      {person.image ? <Image source={{ uri: person.image }} style={styles.avatar}/> : <View style={[styles.avatar, styles.placeholder]}/>}
      <View style={{ flex: 1 }}>
        <Text style={styles.personName}>{person.name}</Text>
        {person.role ? <Text style={styles.personRole}>{person.role}</Text> : null}
      </View>
    </View>);
}
function ReviewCard({ review, width }) {
    return (<View style={[styles.reviewCard, { width }]}>
      <View style={styles.reviewHead}>
        <View style={styles.reviewUser}>
          {review.avatar ? <Image source={{ uri: review.avatar }} style={styles.reviewAvatar}/> : <View style={[styles.reviewAvatar, styles.placeholder]}/>}
          <Text style={styles.personName}>{review.author}</Text>
        </View>
        {review.rating != null ? <RatingStars value={review.rating / 2} size={12}/> : null}
      </View>
      <Text style={styles.reviewText} numberOfLines={6}>
        {review.content}
      </Text>
    </View>);
}
export function TitleDetail({ detail, children }) {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const [favorite, setFavorite] = useState(false);
    useEffect(() => {
        let active = true;
        isFavorite(detail.id, detail.kind).then((saved) => active && setFavorite(saved)).catch(() => { });
        return () => { active = false; };
    }, [detail.id, detail.kind]);
    const onToggleFavorite = async () => {
        try {
            const result = await toggleFavorite(detail);
            setFavorite(result.isFavorite);
        } catch {
            Alert.alert('Favorites unavailable', 'Could not save this title to your favorites.');
        }
    };
    const play = () => {
        if (detail.kind === 'tv') {
            const firstEpisode = detail.seasons[0]?.episodes?.find((episode) => episode.streamUrl);
            if (firstEpisode?.streamUrl) {
                router.push({ pathname: '/player/[id]', params: {
                    id: String(firstEpisode.id), mediaId: String(detail.id), kind: 'tv',
                    title: `${detail.title} · ${firstEpisode.name}`, poster: detail.poster ?? '',
                    backdrop: detail.backdrop ?? '', source: firstEpisode.streamUrl,
                } });
            }
            else {
                Alert.alert('No episodes available', 'This show has no playable episodes in the library yet.');
            }
            return;
        }
        if (!detail.streamUrl)
            return Alert.alert('Playback unavailable', 'This movie has no CDN path in Jellyfin.');
        router.push({ pathname: '/player/[id]', params: {
            id: String(detail.id), mediaId: String(detail.id), kind: 'movie', title: detail.title,
            poster: detail.poster ?? '', backdrop: detail.backdrop ?? '', source: detail.streamUrl,
        } });
    };
    return (<ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        {detail.backdrop ? <Image source={{ uri: detail.backdrop }} style={StyleSheet.absoluteFill} resizeMode="cover"/> : null}
        <View style={styles.heroShade}/>
        <Pressable onPress={() => router.back()} style={[styles.back, { top: insets.top + 8 }]} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={colors.white}/>
        </Pressable>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{detail.title}</Text>
          <Button title="Play Now" icon="play" onPress={play} fullWidth/>
          <View style={styles.actionRow}>
            <CircleIcon name={favorite ? 'heart' : 'heart-outline'} color={favorite ? colors.red : colors.white} onPress={onToggleFavorite} accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}/>
            <CircleIcon name="thumbs-up-outline"/>
            <CircleIcon name="volume-high-outline"/>
          </View>
        </View>
      </View>

      {detail.kind === 'movie' && detail.streamUrl ? <PlaybackLinks itemId={String(detail.id)} kind={detail.kind} title={detail.title} poster={detail.poster} backdrop={detail.backdrop} streamUrl={detail.streamUrl}/> : null}

      <View style={styles.body}>
        {children}

        <Panel label="Description">
          <Text style={styles.paragraph}>{detail.overview || 'No description available.'}</Text>
        </Panel>

        <Panel icon="calendar-outline" label="Released Year">
          <Text style={styles.value}>{detail.year || 'TBA'}</Text>
          {detail.runtime ? <Text style={styles.muted}>Runtime: {formatRuntime(detail.runtime)}</Text> : null}
        </Panel>

        {detail.languages.length ? (<Panel icon="language-outline" label="Available Languages">
            <View style={styles.chips}>
              {detail.languages.map((l) => (<Chip key={l} label={l}/>))}
            </View>
          </Panel>) : null}

        <Panel icon="star-outline" label="Ratings">
          <View style={styles.ratingRow}>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingSource}>TMDB</Text>
              <RatingStars value={detail.rating / 2} size={13}/>
            </View>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingSource}>Votes</Text>
              <Text style={styles.value}>{formatCount(detail.votes)}</Text>
            </View>
          </View>
        </Panel>

        {detail.genres.length ? (<Panel icon="grid-outline" label="Genres">
            <View style={styles.chips}>
              {detail.genres.map((g) => (<Chip key={g} label={g}/>))}
            </View>
          </Panel>) : null}

        {detail.director ? (<Panel label={detail.kind === 'movie' ? 'Director' : 'Creator'}>
            <PersonRow person={detail.director}/>
          </Panel>) : null}

        {detail.music ? (<Panel label="Music">
            <PersonRow person={{ ...detail.music, role: detail.music.role ?? 'Composer' }}/>
          </Panel>) : null}

        {detail.cast.length ? (<Panel label="Cast">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {detail.cast.map((p) => (<View key={p.id} style={styles.castItem}>
                  {p.image ? <Image source={{ uri: p.image }} style={styles.castImg}/> : <View style={[styles.castImg, styles.placeholder]}/>}
                  <Text numberOfLines={1} style={styles.personName}>{p.name}</Text>
                  {p.role ? <Text numberOfLines={1} style={styles.personRole}>{p.role}</Text> : null}
                </View>))}
            </ScrollView>
          </Panel>) : null}

        <View style={styles.reviewsHead}>
          <Text style={styles.panelLabelText}>Reviews</Text>
          <Button title="Add Your Review" variant="secondary" icon="add" onPress={() => Alert.alert('Coming soon', 'Reviews are read-only in this demo.')}/>
        </View>
        {detail.reviews.length ? (<ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={width * 0.82 + 12} decelerationRate="fast" contentContainerStyle={{ gap: 12 }}>
            {detail.reviews.map((r) => (<ReviewCard key={r.id} review={r} width={width * 0.82}/>))}
          </ScrollView>) : (<Text style={styles.muted}>No reviews yet.</Text>)}
      </View>

      <CtaBanner image={detail.backdrop}/>
      <Footer />
    </ScrollView>);
}
function PlaybackLinks({ itemId, kind, title, poster, backdrop, streamUrl }) {
    const [history, setHistory] = useState([]);
    useEffect(() => {
        let active = true;
        getPlaybackHistory().then((items) => active && setHistory(items)).catch(() => { });
        return () => { active = false; };
    }, []);
    return (<View style={styles.playbackPanel}>
      <Text selectable numberOfLines={3} style={styles.playbackUrl}>{streamUrl}</Text>
      {(<View style={styles.playbackActions}>
          <Button title="In app" icon="play" onPress={() => router.push({ pathname: '/player/[id]', params: { id: itemId, mediaId: itemId, kind, title, poster: poster || '', backdrop: backdrop || '', source: streamUrl } })} style={styles.playbackButton}/>
          <Pressable onPress={() => openInExternalPlayer('vlc', streamUrl, title, { itemId, mediaId: itemId, kind, title, poster, backdrop, streamUrl })} style={styles.playerButton} accessibilityRole="button" accessibilityLabel="Play in VLC">
            <Ionicons name="play-circle-outline" size={23} color="#FF8C00"/>
            <Text style={styles.playerButtonText}>VLC</Text>
          </Pressable>
          {Platform.OS === 'android' ? (<Pressable onPress={() => openInExternalPlayer('mx', streamUrl, title, { itemId, mediaId: itemId, kind, title, poster, backdrop, streamUrl })} style={styles.playerButton} accessibilityRole="button" accessibilityLabel="Play in MX Player">
              <View style={styles.mxLogo}><Text style={styles.mxLogoText}>MX</Text></View>
              <Text style={styles.playerButtonText}>MX</Text>
            </Pressable>) : null}
          <Pressable onPress={() => openInExternalPlayer('default', streamUrl, title, { itemId, mediaId: itemId, kind, title, poster, backdrop, streamUrl })} style={styles.playerButton} accessibilityRole="button" accessibilityLabel="Open in another video player">
            <Ionicons name="open-outline" size={22} color={colors.white}/>
            <Text style={styles.playerButtonText}>Other</Text>
          </Pressable>
        </View>)}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>History</Text>
        {history.length ? (<Pressable onPress={() => clearPlaybackHistory().then(() => setHistory([]))} hitSlop={8}>
            <Text style={styles.historyClear}>Clear</Text>
          </Pressable>) : null}
      </View>
      {history.filter((entry) => entry.kind === kind).map((entry) => (<Pressable key={entry.itemId} disabled={!entry.streamUrl} onPress={() => entry.streamUrl && router.push({ pathname: '/player/[id]', params: {
          id: entry.itemId, mediaId: entry.mediaId || itemId, kind: entry.kind || kind, title: entry.title,
          poster: entry.poster || poster || '', backdrop: entry.backdrop || backdrop || '', source: entry.streamUrl,
        } })} style={styles.historyRow}>
          <View style={styles.historyText}>
            <Text numberOfLines={1} style={styles.historyItemTitle}>{entry.title}</Text>
            <Text numberOfLines={1} style={styles.historyDate}>{new Date(entry.playedAt).toLocaleString()}</Text>
          </View>
          <Ionicons name="play-circle-outline" size={20} color={colors.muted}/>
        </Pressable>))}
    </View>);
}
const styles = StyleSheet.create({
    scroll: { flex: 1, backgroundColor: colors.bg },
    hero: { height: 420, overflow: 'hidden', backgroundColor: colors.card },
    heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,20,20,0.4)' },
    back: {
        position: 'absolute',
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(15,15,15,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    heroContent: { flex: 1, justifyContent: 'flex-end', padding: 20, gap: 14 },
    heroTitle: { fontFamily: fonts.bold, fontSize: 30, color: colors.white, textAlign: 'center' },
    actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
    body: { padding: 16, gap: 14 },
    playbackPanel: { margin: 16, padding: 12, gap: 10, backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.cardBorder },
    playbackUrl: { color: colors.mutedLight, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 },
    playbackActions: { flexDirection: 'row', gap: 10 },
    playbackButton: { flex: 1 },
    playerButton: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.sm },
    playerButtonText: { fontFamily: fonts.medium, color: colors.white, fontSize: 12 },
    mxLogo: { width: 22, height: 22, borderRadius: 6, backgroundColor: '#1687D9', alignItems: 'center', justifyContent: 'center' },
    mxLogoText: { fontFamily: fonts.bold, color: colors.white, fontSize: 9 },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    historyTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
    historyClear: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
    historyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 7, borderTopWidth: 1, borderTopColor: colors.cardBorder },
    historyText: { flex: 1, gap: 3 },
    historyItemTitle: { fontFamily: fonts.medium, fontSize: 13, color: colors.mutedLight },
    historyDate: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted },
    panel: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: 16,
        gap: 12,
    },
    panelLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    panelLabelText: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted },
    paragraph: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.mutedLight },
    value: { fontFamily: fonts.semibold, fontSize: 15, color: colors.white },
    muted: { fontFamily: fonts.light, fontSize: 13, color: colors.muted },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    ratingRow: { flexDirection: 'row', gap: 10 },
    ratingBox: {
        flex: 1,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: radius.sm,
        padding: 12,
        gap: 8,
    },
    ratingSource: { fontFamily: fonts.medium, fontSize: 13, color: colors.white },
    personRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: radius.sm,
        padding: 10,
    },
    avatar: { width: 48, height: 48, borderRadius: 24 },
    placeholder: { backgroundColor: colors.cardBorder },
    personName: { fontFamily: fonts.medium, fontSize: 14, color: colors.white },
    personRole: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
    castItem: { width: 84, gap: 4 },
    castImg: { width: 84, height: 100, borderRadius: radius.sm, backgroundColor: colors.card },
    reviewsHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    reviewCard: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: 16,
        gap: 14,
    },
    reviewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    reviewUser: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
    reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
    reviewText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, color: colors.mutedLight },
});
