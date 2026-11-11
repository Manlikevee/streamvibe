import * as SecureStore from "expo-secure-store";
import { getDetail, getGenres, searchTitles } from "./tmdb";
export const JELLYFIN_SERVER = "https://apps.shutter.ng";
const CDN_BASE = "https://cdn.shutter.ng/p/home";
const SESSION_KEY = "jellyfin-session-v1";
const CLIENT_HEADER = 'MediaBrowser Client="StreamVibe", Device="Mobile", DeviceId="streamvibe-mobile", Version="1.0.0"';
const authHeader = (token) => `${CLIENT_HEADER}, Token="${token}"`;
export async function saveJellyfinSession(session) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}
export async function getJellyfinSession() {
    const saved = await SecureStore.getItemAsync(SESSION_KEY);
    if (!saved)
        return null;
    try {
        return JSON.parse(saved);
    }
    catch {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        return null;
    }
}
export async function clearJellyfinSession() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
}
export async function authenticateJellyfin(username, password) {
    const response = await fetch(`${JELLYFIN_SERVER}/Users/AuthenticateByName`, {
        method: "POST",
        headers: {
            Authorization: CLIENT_HEADER,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ Username: username, Pw: password }),
    });
    if (!response.ok)
        throw new Error(response.status === 401
            ? "Username or password is incorrect."
            : `Jellyfin sign-in failed (${response.status}).`);
    const result = (await response.json());
    if (!result.AccessToken || !result.User?.Id)
        throw new Error("Jellyfin returned an incomplete sign-in response.");
    const session = {
        accessToken: result.AccessToken,
        userId: result.User.Id,
        username: result.User.Name ?? username,
    };
    await saveJellyfinSession(session);
    return session;
}
async function jellyfinRequest(path, params = {}) {
    const session = await getJellyfinSession();
    if (!session)
        throw new Error("Connect your Jellyfin account to browse your library.");
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => query.set(key, String(value)));
    const suffix = query.size ? `?${query.toString()}` : "";
    const response = await fetch(`${JELLYFIN_SERVER}${path}${suffix}`, {
        headers: {
            Authorization: authHeader(session.accessToken),
            Accept: "application/json",
        },
    });
    if (response.status === 401) {
        await clearJellyfinSession();
        throw new Error("Your Jellyfin session expired. Sign in again.");
    }
    if (!response.ok)
        throw new Error(`Jellyfin request failed (${response.status}).`);
    return (await response.json());
}
function imageUrl(id, type, tag, token) {
    const params = new URLSearchParams();
    if (tag)
        params.set("tag", tag);
    if (token)
        params.set("api_key", token);
    const suffix = params.size ? `?${params.toString()}` : "";
    return `${JELLYFIN_SERVER}/Items/${encodeURIComponent(id)}/Images/${type}${type === "Backdrop" ? "/0" : ""}${suffix}`;
}
export function getJellyfinPrimaryImage(id, tag, token) {
    const params = new URLSearchParams();
    if (tag)
        params.set("tag", tag);
    if (token)
        params.set("api_key", token);
    const suffix = params.size ? `?${params.toString()}` : "";
    return `${JELLYFIN_SERVER}/Items/${encodeURIComponent(id)}/Images/Primary${suffix}`;
}
export function getJellyfinBackdrop(id, tag, token) {
    const params = new URLSearchParams();
    if (tag)
        params.set("tag", tag);
    if (token)
        params.set("api_key", token);
    const suffix = params.size ? `?${params.toString()}` : "";
    return `${JELLYFIN_SERVER}/Items/${encodeURIComponent(id)}/Images/Backdrop/0${suffix}`;
}
export async function getJellyfinItems(kind) {
    const [session, genres] = await Promise.all([
        getJellyfinSession(),
        getGenres(kind).catch(() => []),
    ]);
    if (!session)
        throw new Error("Connect your Jellyfin account to browse your library.");
    const response = await jellyfinRequest(`/Users/${encodeURIComponent(session.userId)}/Items`, {
        IncludeItemTypes: kind === "movie" ? "Movie" : "Series",
        Recursive: true,
        Fields: "Overview,Genres,ProviderIds,Path,DateCreated,RunTimeTicks",
        SortBy: "DateCreated",
        SortOrder: "Descending",
        Limit: 100,
    });
    return response.Items.map((item) => mapLibraryItem(item, kind, genres, session.accessToken));
}
function mapLibraryItem(item, kind, tmdbGenres, token) {
    const names = item.Genres ?? item.GenreItems?.map((genre) => genre.Name) ?? [];
    const matchGenreIds = tmdbGenres
        .filter((genre) => names.some((name) => name.toLowerCase() === genre.name.toLowerCase()))
        .map((genre) => genre.id);
    const primaryTag = item.ImageTags?.Primary;
    const backdropTag = item.BackdropImageTags?.[0];
    const title = item.Name.replace(/^\(\d{3,4}p\)\s*/i, "");
    return {
        id: item.Id,
        libraryId: item.Id,
        streamUrl: item.Path
            ? (getPublicCdnUrl(item.Path) ?? undefined)
            : undefined,
        kind,
        title,
        overview: item.Overview ?? "",
        poster: primaryTag ? imageUrl(item.Id, "Primary", primaryTag, token) : null,
        backdrop: backdropTag
            ? imageUrl(item.Id, "Backdrop", backdropTag, token)
            : null,
        date: item.PremiereDate ??
            (item.ProductionYear ? `${item.ProductionYear}-01-01` : ""),
        rating: item.CommunityRating ?? 0,
        votes: 0,
        popularity: 0,
        genreIds: matchGenreIds,
    };
}
export async function getJellyfinDetail(kind, itemId) {
    const session = await getJellyfinSession();
    if (!session)
        throw new Error("Connect your Jellyfin account to browse your library.");
    const raw = await jellyfinRequest(`/Users/${encodeURIComponent(session.userId)}/Items/${encodeURIComponent(itemId)}`, {
        Fields: "Overview,Genres,ProviderIds,Path,RunTimeTicks",
    });
    const tmdbId = Number(raw.ProviderIds?.Tmdb);
    let tmdb = null;
    if (Number.isFinite(tmdbId) && tmdbId > 0) {
        try {
            tmdb = await getDetail(kind, tmdbId);
        }
        catch {
            /* Keep Jellyfin metadata when TMDB enrichment is unavailable. */
        }
    }
    else {
        try {
            const matches = await searchTitles(kind, raw.Name);
            const year = raw.ProductionYear;
            const match = matches.find((candidate) => year && candidate.date.startsWith(String(year))) ?? matches[0];
            if (match)
                tmdb = await getDetail(kind, match.id);
        }
        catch {
            /* Keep Jellyfin metadata when TMDB enrichment is unavailable. */
        }
    }
    const genres = raw.Genres ?? raw.GenreItems?.map((genre) => genre.Name) ?? [];
    const poster = raw.ImageTags?.Primary
        ? imageUrl(raw.Id, "Primary", raw.ImageTags.Primary, session.accessToken)
        : null;
    const backdrop = raw.BackdropImageTags?.[0]
        ? imageUrl(raw.Id, "Backdrop", raw.BackdropImageTags[0], session.accessToken)
        : null;
    const runtime = raw.RunTimeTicks
        ? Math.round(raw.RunTimeTicks / 10_000_000 / 60)
        : null;
    const seasons = kind === "tv"
        ? await getJellyfinSeasons(raw.Id).catch(() => tmdb?.seasons ?? [])
        : [];
    return {
        id: raw.Id,
        libraryId: raw.Id,
        streamUrl: raw.Path ? (getPublicCdnUrl(raw.Path) ?? undefined) : undefined,
        kind,
        title: tmdb?.title ?? raw.Name.replace(/^\(\d{3,4}p\)\s*/i, ""),
        overview: tmdb?.overview || raw.Overview || "",
        poster: poster ?? tmdb?.poster ?? null,
        backdrop: backdrop ?? tmdb?.backdrop ?? null,
        date: raw.PremiereDate ??
            (raw.ProductionYear ? `${raw.ProductionYear}-01-01` : (tmdb?.date ?? "")),
        rating: tmdb?.rating ?? raw.CommunityRating ?? 0,
        votes: tmdb?.votes ?? 0,
        popularity: tmdb?.popularity ?? 0,
        genreIds: tmdb?.genreIds ?? [],
        runtime: runtime ?? tmdb?.runtime ?? null,
        year: String(raw.ProductionYear ?? tmdb?.year ?? ""),
        languages: tmdb?.languages ?? [],
        genres: tmdb?.genres.length ? tmdb.genres : genres,
        director: tmdb?.director ?? null,
        music: tmdb?.music ?? null,
        cast: tmdb?.cast ?? [],
        reviews: tmdb?.reviews ?? [],
        seasons,
    };
}
export async function getJellyfinSeasons(seriesId) {
    const session = await getJellyfinSession();
    if (!session)
        throw new Error("Connect your Jellyfin account to browse your library.");
    const response = await jellyfinRequest(`/Shows/${encodeURIComponent(seriesId)}/Seasons`, { UserId: session.userId });
    return response.Items.map((item, index) => ({
        id: item.Id,
        number: item.IndexNumber ?? index + 1,
        name: item.Name,
        episodeCount: item.ChildCount ?? 0,
        year: item.ProductionYear ? String(item.ProductionYear) : "",
    }));
}
export async function getJellyfinEpisodes(seriesId, seasonNumber) {
    const session = await getJellyfinSession();
    if (!session)
        throw new Error("Connect your Jellyfin account to browse your library.");
    const response = await jellyfinRequest(`/Shows/${encodeURIComponent(seriesId)}/Episodes`, {
        UserId: session.userId,
        Season: seasonNumber,
        Fields: "Overview,RunTimeTicks,Path",
    });
    return response.Items.map((item) => ({
        id: item.Id,
        number: item.IndexNumber ?? 0,
        name: item.Name,
        overview: item.Overview ?? "",
        runtime: item.RunTimeTicks
            ? Math.round(item.RunTimeTicks / 10_000_000 / 60)
            : null,
        still: item.ImageTags?.Primary
            ? getJellyfinPrimaryImage(item.Id, item.ImageTags.Primary, session.accessToken)
            : null,
        streamUrl: item.Path
            ? (getPublicCdnUrl(item.Path) ?? undefined)
            : undefined,
    }));
}
function getPublicCdnUrl(path) {
    const normalized = path.replace(/\\/g, "/");
    const mediaRoot = normalized.match(/\/(?:MOVIES|SERIES)\//i);
    const relativePath = mediaRoot ? normalized.slice(mediaRoot.index) : null;
    if (!relativePath)
        return null;
    const encodedPath = relativePath
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
    return `${CDN_BASE}${encodedPath}`;
}
export async function getMediaDetail(kind, itemId) {
    return /^\d+$/.test(itemId)
        ? getDetail(kind, Number(itemId))
        : getJellyfinDetail(kind, itemId);
}
