import type { Movie } from "@/lib/mock-data";
import type { Anime, AnimeCharacter, MediaImage } from "./types";
export type { Anime } from "./types";

type JikanGenre = { name: string };
type JikanImage = { jpg?: { image_url?: string | null; large_image_url?: string | null } | null };
type JikanTrailer = { youtube_id?: string | null; url?: string | null; embed_url?: string | null };
type JikanAnime = {
  mal_id: number;
  title: string;
  title_english?: string | null;
  title_japanese?: string | null;
  type?: string | null;
  episodes?: number | null;
  status?: string | null;
  score?: number | null;
  synopsis?: string | null;
  genres?: JikanGenre[] | null;
  images?: JikanImage | null;
  aired?: { from?: string | null; to?: string | null } | null;
  url?: string;
  source?: string | null;
  season?: string | null;
  year?: number | null;
  studios?: Array<{ name?: string | null }> | null;
  rank?: number | null;
  popularity?: number | null;
  trailer?: JikanTrailer | null;
  characters?: Array<{ character?: { name?: string | null; images?: JikanImage | null }; role?: string | null }> | null;
};

type JikanResponse<T> = { data?: T[] | T | null; pagination?: { has_next_page?: boolean } | null };
type JikanCharactersResponse = { data?: JikanAnime["characters"] | null };

const API_URL = "https://api.jikan.moe/v4";
const SOURCE = "Jikan API";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripHtml(value: string | null | undefined) {
  return (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatReleaseDate(value: string | null | undefined) {
  if (!value) return "Release date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function mediaImage(url: string | null | undefined): MediaImage | undefined {
  return url ? { url, source: SOURCE, license: "Jikan links to MyAnimeList artwork; verify reuse rights before commercial use." } : undefined;
}

function normalizeAnime(raw: JikanAnime): Anime | undefined {
  if (!raw.mal_id || !raw.title) return undefined;
  const englishTitle = raw.title_english?.trim() || raw.title;
  const poster = mediaImage(raw.images?.jpg?.large_image_url ?? raw.images?.jpg?.image_url);
  const synopsis = stripHtml(raw.synopsis) || "Anime synopsis is not yet available from the provider.";
  const trailerUrl = raw.trailer?.url ?? (raw.trailer?.youtube_id ? `https://www.youtube.com/watch?v=${raw.trailer.youtube_id}` : undefined);
  const characters: AnimeCharacter[] = (raw.characters ?? []).flatMap((entry) => {
    const name = entry.character?.name;
    if (!name) return [];
    return [{ name, role: entry.role ?? undefined, image: mediaImage(entry.character?.images?.jpg?.image_url) }];
  }).slice(0, 12);
  return {
    id: String(raw.mal_id),
    providerId: String(raw.mal_id),
    slug: slugify(englishTitle) || String(raw.mal_id),
    title: englishTitle,
    japaneseTitle: raw.title_japanese ?? undefined,
    synopsis,
    type: raw.type ?? undefined,
    status: raw.status ?? undefined,
    episodes: raw.episodes ?? undefined,
    score: raw.score ?? undefined,
    rank: raw.rank ?? undefined,
    popularity: raw.popularity ?? undefined,
    year: raw.year ?? (raw.aired?.from ? new Date(raw.aired.from).getFullYear() : undefined),
    airedFrom: raw.aired?.from ?? undefined,
    airedTo: raw.aired?.to ?? undefined,
    genres: (raw.genres ?? []).map((genre) => genre.name).filter(Boolean),
    studios: (raw.studios ?? []).map((studio) => studio.name).filter((name): name is string => Boolean(name)),
    poster,
    backdrop: poster,
    trailerUrl,
    characters,
    source: raw.source ?? undefined,
    externalUrl: raw.url,
  };
}

async function request<T>(path: string, revalidate = 1800, attempt = 0): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, revalidate === 0 ? {
    cache: "no-store",
    headers: { Accept: "application/json", "User-Agent": "ANIMEXIA/1.0" },
  } : {
    next: { revalidate },
    headers: { Accept: "application/json", "User-Agent": "ANIMEXIA/1.0" },
  });

  if ((response.status === 429 || response.status >= 500) && attempt === 0) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return request<T>(path, revalidate, 1);
  }
  if (response.status === 429) throw new Error("Jikan rate limit reached.");
  if (!response.ok) throw new Error(`Jikan request failed with status ${response.status}.`);

  return (await response.json()) as T;
}

const knownAnimeIds: Record<string, number> = {
  naruto: 20,
  "one-piece": 21,
  "jujutsu-kaisen": 40748,
};

export const animeFallback: Movie[] = [
  { slug: "naruto", title: "Naruto", genre: "Action · Adventure", releaseDate: "2002", rating: "8.0", image: "https://cdn.myanimelist.net/images/anime/13/17405l.jpg", accent: "#d8a95d", badge: "Anime fallback", synopsis: "A young ninja pursues recognition and dreams of becoming Hokage.", cast: [], category: "Anime", externalId: "20", externalUrl: "https://myanimelist.net/anime/20/Naruto" },
  { slug: "one-piece", title: "One Piece", genre: "Action · Adventure", releaseDate: "1999", rating: "8.7", image: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg", accent: "#d8a95d", badge: "Anime fallback", synopsis: "Monkey D. Luffy sails with his crew in search of the legendary One Piece.", cast: [], category: "Anime", externalId: "21", externalUrl: "https://myanimelist.net/anime/21/One_Piece" },
  { slug: "jujutsu-kaisen", title: "Jujutsu Kaisen", genre: "Action · Supernatural", releaseDate: "2020", rating: "8.6", image: "https://cdn.myanimelist.net/images/anime/1171/124187l.jpg", accent: "#d8a95d", badge: "Anime fallback", synopsis: "A student joins a secret organization fighting curses born from human negativity.", cast: [], category: "Anime", externalId: "40748", externalUrl: "https://myanimelist.net/anime/40748/Jujutsu_Kaisen" },
];

async function fetchList(path: string, limit: number, revalidate = 900): Promise<Anime[]> {
  const payload = await request<JikanResponse<JikanAnime>>(`${path}${path.includes("?") ? "&" : "?"}limit=${Math.min(limit, 25)}`, revalidate);
  const seen = new Set<string>();
  return (Array.isArray(payload.data) ? payload.data : [])
    .map(normalizeAnime)
    .filter((item): item is Anime => Boolean(item))
    .filter((item) => !seen.has(item.id) && seen.add(item.id))
    .slice(0, limit);
}

export async function fetchJikanAnime(limit = 12, page = 1): Promise<Anime[]> {
  return fetchList(`/top/anime?page=${page}`, limit);
}

export async function fetchJikanAiringAnime(limit = 12): Promise<Anime[]> {
  return fetchList("/top/anime?filter=airing", limit);
}

export async function fetchJikanUpcomingAnime(limit = 12): Promise<Anime[]> {
  return fetchList("/top/anime?filter=upcoming", limit);
}

export async function fetchJikanMovies(limit = 12): Promise<Anime[]> {
  return fetchList("/top/anime?type=movie", limit);
}

export async function searchJikanAnime(query: string, limit = 12): Promise<Anime[]> {
  const safeQuery = query.trim();
  if (!safeQuery) return [];
  const payload = await request<JikanResponse<JikanAnime>>(`/anime?q=${encodeURIComponent(safeQuery)}&limit=${limit}&sfw`);
  return (Array.isArray(payload.data) ? payload.data : []).map(normalizeAnime).filter((item): item is Anime => Boolean(item)).slice(0, limit);
}

export async function fetchJikanAnimeBySlug(slug: string): Promise<Anime | undefined> {
  const knownId = knownAnimeIds[slug];
  if (knownId) {
    const detail = await request<JikanResponse<JikanAnime>>(`/anime/${knownId}/full`, 3600);
    const full = !Array.isArray(detail.data) && detail.data ? detail.data : undefined;
    if (full) {
      const characters = await request<JikanCharactersResponse>(`/anime/${knownId}/characters`, 0).catch(() => ({ data: [] }));
      return normalizeAnime({ ...full, characters: characters.data ?? [] });
    }
  }
  const query = slug.replace(/-/g, " ").trim();
  if (!query) return undefined;
  const payload = await request<JikanResponse<JikanAnime>>(`/anime?q=${encodeURIComponent(query)}&limit=5&sfw`, 3600);
  const items = Array.isArray(payload.data) ? payload.data : [];
  const match = items.find((item) => slugify(item.title_english ?? item.title) === slug || slugify(item.title) === slug);
  const candidate = match ?? items[0];
  if (!candidate) return undefined;
  const detail = await request<JikanResponse<JikanAnime>>(`/anime/${candidate.mal_id}/full`, 3600);
  const full = !Array.isArray(detail.data) && detail.data ? detail.data : candidate;
  const characters = await request<JikanCharactersResponse>(`/anime/${candidate.mal_id}/characters`, 0).catch(() => ({ data: [] }));
  return normalizeAnime({ ...full, characters: characters.data ?? [] });
}

export function animeToMovie(anime: Anime): Movie {
  return {
    slug: anime.slug,
    title: anime.title,
    originalTitle: anime.japaneseTitle,
    genre: anime.genres.slice(0, 3).join(" · ") || "Anime",
    releaseDate: anime.airedFrom ? formatReleaseDate(anime.airedFrom) : anime.status ?? "Release date unavailable",
    rating: anime.score?.toFixed(1),
    image: anime.poster?.url ?? "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=85",
    accent: "#d8a95d",
    badge: anime.status ?? anime.type,
    synopsis: anime.synopsis,
    cast: anime.characters.map((character) => character.name),
    category: "Anime",
    episodes: anime.episodes,
    imageSource: anime.poster?.source,
    imageLicense: anime.poster?.license,
    externalId: anime.providerId,
    externalUrl: anime.externalUrl,
    director: anime.studios[0],
    trailer: anime.trailerUrl,
  };
}

export function fallbackToAnime(movie: Movie): Anime {
  return {
    id: movie.externalId ?? movie.slug,
    providerId: movie.externalId ?? movie.slug,
    slug: movie.slug,
    title: movie.title,
    japaneseTitle: movie.originalTitle,
    synopsis: movie.synopsis,
    type: "TV",
    status: movie.badge,
    episodes: movie.episodes,
    score: movie.rating ? Number(movie.rating) : undefined,
    genres: movie.genre.split(" · "),
    studios: [],
    poster: { url: movie.image, source: "ANIMEXIA fallback", license: "Fallback artwork; verify reuse rights." },
    backdrop: { url: movie.image, source: "ANIMEXIA fallback", license: "Fallback artwork; verify reuse rights." },
    characters: movie.cast.map((name) => ({ name })),
    externalUrl: movie.externalUrl,
  };
}

export async function getJikanAnime(limit: number, fallback: Movie[] = [], page = 1): Promise<Movie[]> {
  try {
    return (await fetchJikanAnime(limit, page)).map(animeToMovie);
  } catch {
    return fallback.length ? fallback : animeFallback.slice(0, limit);
  }
}

export async function getJikanSection(fetcher: (limit: number) => Promise<Anime[]>, limit: number, fallback: Movie[]) {
  try {
    return (await fetcher(limit)).map(animeToMovie);
  } catch {
    return fallback;
  }
}
