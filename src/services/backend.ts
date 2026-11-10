import type { Detail, Episode, MediaKind, Season, Title, Person } from '@/types';

export const BACKEND_API = 'https://movieappbackend.vercel.app/api';

type ApiKind = 'movie' | 'series';
type ApiTitle = {
  id: number;
  kind: ApiKind;
  name: string;
  year: number | null;
  overview: string;
  poster: string;
  rating: number | null;
  genres: string[];
  official_rating?: string;
  runtime_minutes?: number | null;
  is_available?: boolean;
  [key: string]: any;
};
type ApiPage = { count: number; next: string | null; results: ApiTitle[] };
type ApiCategory<T> = T & { title_count: number };

export type BackendCategory = ApiCategory<{ id: number; name: string }>;
export type BackendLibrary = ApiCategory<{ id: number; name: string }>;
export interface BackendCollections {
  year: number;
  kind: ApiKind | null;
  collections: { slug: string; name: string; results: ApiTitle[] }[];
  genres: BackendCategory[];
  libraries: BackendLibrary[];
}

const apiKind = (kind: MediaKind): ApiKind => kind === 'movie' ? 'movie' : 'series';
const mediaKind = (kind: ApiKind): MediaKind => kind === 'movie' ? 'movie' : 'tv';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${BACKEND_API}${path}`, { headers: { Accept: 'application/json' } });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail ?? `Media library request failed (${response.status}).`;
    throw new Error(detail);
  }
  return body as T;
}

function mapTitle(raw: ApiTitle): Title {
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

function mapEpisode(raw: any): Episode {
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

function mapSeason(raw: any): Season {
  const episodes: Episode[] = (raw.episodes ?? []).map(mapEpisode);
  return {
    id: raw.id,
    number: raw.number ?? 0,
    name: raw.name ?? '',
    episodeCount: episodes.length,
    year: '',
    episodes,
  };
}

function mapDetail(raw: any): Detail {
  const title = mapTitle(raw);
  const people = (raw.cast ?? []).map((person: any, index: number): Person => ({
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

export async function getBackendCollections(kind: MediaKind): Promise<{
  recentlyReleased: Title[];
  popular: Title[];
  topRated: Title[];
  genres: BackendCategory[];
  libraries: BackendLibrary[];
  year: number;
}> {
  const data = await request<BackendCollections>(`/collections/?kind=${apiKind(kind)}`);
  const find = (slug: string) => data.collections.find((item) => item.slug === slug)?.results ?? [];
  return {
    recentlyReleased: find('recently-released').map(mapTitle),
    popular: find('popular').map(mapTitle),
    topRated: find('top-rated').map(mapTitle),
    genres: data.genres,
    libraries: data.libraries,
    year: data.year,
  };
}

export async function getBackendGenreTitles(kind: MediaKind, genreId: number): Promise<Title[]> {
  const data = await request<ApiPage>(`/titles/?kind=${apiKind(kind)}&genre=${genreId}&page_size=100`);
  return data.results.map(mapTitle);
}

export async function getBackendCategoryTitles(
  kind: MediaKind,
  categoryId: number,
  categoryType: 'genre' | 'library',
  query = '',
): Promise<Title[]> {
  const params = new URLSearchParams({ kind: apiKind(kind), [categoryType]: String(categoryId), page_size: '100' });
  if (query.trim()) params.set('q', query.trim());
  const data = await request<ApiPage>(`/titles/?${params.toString()}`);
  return data.results.map(mapTitle);
}

export async function searchBackendTitles(query: string, kind: MediaKind | 'all'): Promise<Title[]> {
  const params = new URLSearchParams({ page_size: '100', sort: 'name' });
  if (kind !== 'all') params.set('kind', apiKind(kind));
  if (query.trim()) params.set('q', query.trim());
  const data = await request<ApiPage>(`/titles/?${params.toString()}`);
  return data.results.map(mapTitle);
}

export async function getBackendCatalog(kind: MediaKind | 'all'): Promise<Title[]> {
  if (kind === 'movie') return getBackendMovies();
  if (kind === 'tv') return getBackendSeries();
  const [movies, series] = await Promise.all([getBackendMovies(), getBackendSeries()]);
  return [...movies, ...series];
}

export async function getBackendTitleDetail(id: string | number): Promise<Detail> {
  return mapDetail(await request<any>(`/titles/${encodeURIComponent(String(id))}/`));
}

export async function getBackendSeries(): Promise<Title[]> {
  const data = await request<ApiPage>('/series/?page_size=100');
  return data.results.map(mapTitle);
}

export async function getBackendMovies(): Promise<Title[]> {
  const data = await request<ApiPage>('/movies/?page_size=100');
  return data.results.map(mapTitle);
}
