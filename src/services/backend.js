export const BACKEND_API = 'https://movieappbackend.vercel.app/api';
const apiKind = (kind) => kind === 'movie' ? 'movie' : 'series';
const mediaKind = (kind) => kind === 'movie' ? 'movie' : 'tv';
async function request(path) {
    const response = await fetch(`${BACKEND_API}${path}`, { headers: { Accept: 'application/json' } });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
        const detail = body?.detail ?? `Media library request failed (${response.status}).`;
        throw new Error(detail);
    }
    return body;
}
function mapTitle(raw) {
    return {
        id: raw.id,
        kind: mediaKind(raw.kind),
        title: raw.name,
        overview: raw.overview ?? '',
        poster: raw.poster || null,
        backdrop: raw.backdrop_url || raw.jellyfin_backdrop_url || null,
        date: raw.premiere_date ?? (raw.year ? `${raw.year}-01-01` : ''),
        rating: raw.rating ?? raw.tmdb_rating ?? raw.community_rating ?? 0,
        votes: raw.tmdb_votes ?? 0,
        popularity: raw.tmdb_votes ?? 0,
        genreIds: [],
        streamUrl: raw.cdn_url || undefined,
    };
}
function mapEpisode(raw) {
    return {
        id: raw.id,
        number: raw.number ?? 0,
        name: raw.name ?? '',
        overview: raw.overview ?? '',
        runtime: raw.runtime_minutes ?? null,
        still: raw.still_url || null,
        streamUrl: raw.cdn_url || undefined,
    };
}
function mapSeason(raw) {
    const episodes = (raw.episodes ?? []).map(mapEpisode);
    return {
        id: raw.id,
        number: raw.number ?? 0,
        name: raw.name ?? '',
        episodeCount: episodes.length,
        year: '',
        episodes,
    };
}
function mapDetail(raw) {
    const title = mapTitle(raw);
    const people = (raw.cast ?? []).map((person, index) => ({
        id: index,
        name: person.name,
        role: person.character ?? '',
        image: person.photo || null,
    }));
    const directorRaw = raw.directors?.[0];
    return {
        ...title,
        runtime: raw.runtime_minutes ?? null,
        year: raw.year ? String(raw.year) : '',
        languages: [],
        genres: raw.genres ?? [],
        director: directorRaw ? { id: 0, name: directorRaw.name, role: directorRaw.role, image: null } : null,
        music: null,
        cast: people,
        reviews: [],
        seasons: (raw.seasons ?? []).map(mapSeason),
        streamUrl: raw.cdn_url || undefined,
    };
}
export async function getBackendCollections(kind) {
    const data = await request(`/collections/?kind=${apiKind(kind)}`);
    const find = (slug) => data.collections.find((item) => item.slug === slug)?.results ?? [];
    return {
        recentlyReleased: find('recently-released').map(mapTitle),
        popular: find('popular').map(mapTitle),
        topRated: find('top-rated').map(mapTitle),
        genres: data.genres,
        libraries: data.libraries,
        year: data.year,
    };
}
export async function getBackendGenreTitles(kind, genreId) {
    const data = await request(`/titles/?kind=${apiKind(kind)}&genre=${genreId}&page_size=100`);
    return data.results.map(mapTitle);
}
export async function getBackendCategoryTitles(kind, categoryId, categoryType, query = '') {
    const params = new URLSearchParams({ kind: apiKind(kind), [categoryType]: String(categoryId), page_size: '100' });
    if (query.trim())
        params.set('q', query.trim());
    const data = await request(`/titles/?${params.toString()}`);
    return data.results.map(mapTitle);
}
export async function getBackendRecentlyReleasedPage(kind, year, page = 1, query = '') {
    const params = new URLSearchParams({
        kind: apiKind(kind),
        year: String(year),
        sort: 'released',
        page_size: '24',
        page: String(page),
    });
    if (query.trim()) params.set('q', query.trim());
    const data = await request(`/titles/?${params.toString()}`);
    return { results: data.results.map(mapTitle), hasMore: Boolean(data.next) };
}
export async function searchBackendTitles(query, kind) {
    const params = new URLSearchParams({ page_size: '100', sort: 'name' });
    if (kind !== 'all')
        params.set('kind', apiKind(kind));
    if (query.trim())
        params.set('q', query.trim());
    const data = await request(`/titles/?${params.toString()}`);
    return data.results.map(mapTitle);
}
export async function getBackendCatalog(kind) {
    if (kind === 'movie')
        return getBackendMovies();
    if (kind === 'tv')
        return getBackendSeries();
    const [movies, series] = await Promise.all([getBackendMovies(), getBackendSeries()]);
    return [...movies, ...series];
}
export async function getBackendTitleDetail(id) {
    return mapDetail(await request(`/titles/${encodeURIComponent(String(id))}/`));
}
export async function getBackendSeries() {
    const data = await request('/series/?page_size=100');
    return data.results.map(mapTitle);
}
export async function getBackendMovies() {
    const data = await request('/movies/?page_size=100');
    return data.results.map(mapTitle);
}
