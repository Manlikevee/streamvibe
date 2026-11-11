import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/constants/theme';
import { getSeason } from '@/services/tmdb';
import { getJellyfinEpisodes } from '@/services/jellyfin';
import { formatRuntime } from '@/utils/format';
export function SeasonList({ showId, showTitle, poster, backdrop, jellyfinSeriesId, seasons }) {
    const [open, setOpen] = useState(seasons[0]?.number ?? null);
    const [cache, setCache] = useState({});
    const [loading, setLoading] = useState(null);
    useEffect(() => {
        if (open == null || cache[open])
            return;
        let active = true;
        Promise.resolve()
            .then(() => {
            if (active)
                setLoading(open);
            const embeddedEpisodes = seasons.find((season) => season.number === open)?.episodes;
            if (embeddedEpisodes)
                return embeddedEpisodes;
            return jellyfinSeriesId ? getJellyfinEpisodes(jellyfinSeriesId, open) : getSeason(showId, open);
        })
            .then((eps) => active && setCache((c) => ({ ...c, [open]: eps })))
            .catch(() => active && setCache((c) => ({ ...c, [open]: [] })))
            .finally(() => active && setLoading(null));
        return () => {
            active = false;
        };
    }, [open, showId, jellyfinSeriesId, cache, seasons]);
    if (!seasons.length)
        return null;
    return (<View style={styles.wrap}>
      <Text style={styles.heading}>Seasons and Episodes</Text>
      {seasons.map((s) => {
            const isOpen = open === s.number;
            const eps = cache[s.number];
            return (<View key={s.id} style={styles.season}>
            <Pressable onPress={() => setOpen(isOpen ? null : s.number)} style={styles.seasonHead}>
              <Text style={styles.seasonName}>
                Season {String(s.number).padStart(2, '0')}
                <Text style={styles.seasonCount}>  {s.episodeCount} Episodes</Text>
              </Text>
              <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.white}/>
            </Pressable>

            {isOpen ? (<View style={styles.episodes}>
                {loading === s.number || !eps ? (<ActivityIndicator color={colors.red} style={{ marginVertical: 16 }}/>) : (eps.map((e) => (<Pressable key={e.id} disabled={!e.streamUrl} onPress={() => e.streamUrl && router.push({ pathname: '/player/[id]', params: { id: String(e.id), mediaId: String(showId), kind: 'tv', title: `${showTitle || 'Series'} · ${e.name}`, poster: poster || '', backdrop: backdrop || '', source: e.streamUrl } })} style={styles.episode}>
                      <View style={styles.stillWrap}>
                        {e.still ? <Image source={{ uri: e.still }} style={styles.still}/> : <View style={[styles.still, { backgroundColor: colors.cardBorder }]}/>}
                        <View style={styles.playDot}>
                          <Ionicons name="play" size={14} color={colors.white}/>
                        </View>
                      </View>
                      <View style={styles.episodeInfo}>
                        {e.runtime ? (<View style={styles.pill}>
                            <Ionicons name="time-outline" size={12} color={colors.mutedLight}/>
                            <Text style={styles.pillText}>{formatRuntime(e.runtime)}</Text>
                          </View>) : null}
                        <Text style={styles.epName}>
                          {String(e.number).padStart(2, '0')}. {e.name}
                        </Text>
                        {e.overview ? (<Text numberOfLines={3} style={styles.epOverview}>
                            {e.overview}
                          </Text>) : null}
                      </View>
                    </Pressable>)))}
              </View>) : null}
          </View>);
        })}
    </View>);
}
const styles = StyleSheet.create({
    wrap: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 16, gap: 12 },
    heading: { fontFamily: fonts.medium, fontSize: 16, color: colors.white, marginBottom: 4 },
    season: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.sm, overflow: 'hidden' },
    seasonHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
    seasonName: { fontFamily: fonts.medium, fontSize: 14, color: colors.white },
    seasonCount: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
    episodes: { padding: 12, gap: 16, borderTopWidth: 1, borderTopColor: colors.cardBorder },
    episode: { gap: 10 },
    stillWrap: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.bg },
    still: { width: '100%', height: '100%' },
    playDot: {
        position: 'absolute',
        alignSelf: 'center',
        top: '40%',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(229,0,0,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 2,
    },
    episodeInfo: { gap: 6 },
    pill: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: radius.sm,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    pillText: { fontFamily: fonts.regular, fontSize: 12, color: colors.mutedLight },
    epName: { fontFamily: fonts.medium, fontSize: 15, color: colors.white },
    epOverview: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.muted },
});
