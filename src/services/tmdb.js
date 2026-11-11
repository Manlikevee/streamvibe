import { env } from '@/config/env';
const API_BASE = 'https://api.themoviedb.org/3';
export const imageUrl = (path, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
// TMDB v4 read tokens are long JWT-style strings; v3 keys are 32 hex chars.
const isBearerToken = (key) => key.length > 60;
async function request(path, params = {}) {
    const key = env.tmdbApiKey;
    if (!key || key === 'your_tmdb_api_key_here') {
        throw new Error('TMDB key missing. Add EXPO_PUBLIC_TMDB_API_KEY to .env and restart Expo with: npx expo start -c');
    }
    const query = new URLSearchParams({ language: 'en-US' });
    Object.entries(params).forEach(([k, v]) => query.set(k, String(v)));
    const bearer = isBearerToken(key);
    if (!bearer)
        query.set('api_key', key);
    const res = await fetch(`${API_BASE}${path}?${query.toString()}`, {
        headers: {
            Accept: 'application/json',
            ...(bearer ? { Authorization: `Bearer ${key}` } : {}),
        },
    });
    if (!res.ok)
        throw new Error(`TMDB request failed (${res.status}). Check your API key.`);
    return (await res.json());
}
const normalize = (r, kind) => ({
    id: r.id,
    kind,
    title: r.title ?? r.name ?? 'Untitled',
    overview: r.overview ?? '',
    poster: imageUrl(r.poster_path, 'w500'),
    backdrop: imageUrl(r.backdrop_path, 'w780'),
    date: r.release_date ?? r.first_air_date ?? '',
    rating: r.vote_average ?? 0,
    votes: r.vote_count ?? 0,
    popularity: r.popularity ?? 0,
    genreIds: r.genre_ids ?? (r.genres ?? []).map((g) => g.id),
});
// TMDB sometimes returns avatar paths like "/https://www.gravatar.com/...".
const avatarUrl = (path) => {
    if (!path)
        return null;
    if (path.startsWith('/http'))
        return path.slice(1);
    return imageUrl(path, 'w185');
};
export async function getGenres(kind) {
    const r = await request(`/genre/${kind}/list`);
    return r.genres;
}
export async function getTrending(kind) {
    const r = await request(`/trending/${kind}/week`);
    return r.results.map((x) => normalize(x, kind));
}
export async function getNewReleases(kind) {
    const path = kind === 'movie' ? '/movie/now_playing' : '/tv/on_the_air';
    const r = await request(path);
    return r.results.map((x) => normalize(x, kind));
}
export async function getTopRated(kind) {
    const r = await request(`/${kind}/top_rated`);
    return r.results.map((x) => normalize(x, kind));
}
export async function getByGenre(kind, genreId) {
    const r = await request(`/discover/${kind}`, {
        with_genres: genreId,
        sort_by: 'popularity.desc',
        include_adult: 'false',
    });
    return r.results.map((x) => normalize(x, kind));
}
export async function searchTitles(kind, query) {
    const r = await request(`/search/${kind}`, {
        query,
        include_adult: 'false',
    });
    return r.results.map((x) => normalize(x, kind));
}
export async function getDetail(kind, id) {
    const r = await request(`/${kind}/${id}`, { append_to_response: 'credits,reviews' });
    const crew = r.credits?.crew ?? [];
    const findCrew = (jobs) => {
        const p = crew.find((c) => jobs.includes(c.job));
        return p ? { id: p.id, name: p.name, role: p.job, image: imageUrl(p.profile_path, 'w185') } : null;
    };
    const director = kind === 'movie'
        ? findCrew(['Director'])
        : r.created_by?.[0]
            ? { id: r.created_by[0].id, name: r.created_by[0].name, role: 'Creator', image: imageUrl(r.created_by[0].profile_path, 'w185') }
            : null;
    const cast = (r.credits?.cast ?? []).slice(0, 10).map((c) => ({
        id: c.id,
        name: c.name,
        role: c.character,
        image: imageUrl(c.profile_path, 'w185'),
    }));
    const reviews = (r.reviews?.results ?? []).slice(0, 8).map((v) => ({
        id: v.id,
        author: v.author_details?.name || v.author,
        rating: v.author_details?.rating ?? null,
        content: v.content,
        avatar: avatarUrl(v.author_details?.avatar_path),
    }));
    const seasons = (r.seasons ?? [])
        .filter((s) => s.season_number > 0)
        .map((s) => ({
        id: s.id,
        number: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        year: s.air_date?.slice(0, 4) ?? '',
    }));
    return {
        ...normalize(r, kind),
        runtime: kind === 'movie' ? r.runtime ?? null : r.episode_run_time?.[0] ?? null,
        year: (r.release_date ?? r.first_air_date ?? '').slice(0, 4),
        languages: (r.spoken_languages ?? []).map((l) => l.english_name || l.name),
        genres: (r.genres ?? []).map((g) => g.name),
        director,
        music: findCrew(['Original Music Composer', 'Music', 'Composer']),
        cast,
        reviews,
        seasons,
    };
}
export async function getSeason(showId, seasonNumber) {
    const r = await request(`/tv/${showId}/season/${seasonNumber}`);
    return (r.episodes ?? []).map((e) => ({
        id: e.id,
        number: e.episode_number,
        name: e.name,
        overview: e.overview ?? '',
        runtime: e.runtime ?? null,
        still: imageUrl(e.still_path, 'w342'),
    }));
}
