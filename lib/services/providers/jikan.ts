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
  const trailerUrl = raw.trailer?.embed_url ?? raw.trailer?.url ?? (raw.trailer?.youtube_id ? `https://www.youtube.com/watch?v=${raw.trailer.youtube_id}` : undefined);
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
  "demon-slayer": 38000,
  "steins-gate": 9253,
  "attack-on-titan": 16498,
  "death-note": 1535,
  "kaguya-sama": 37999,
  frieren: 52991,
  "fullmetal-alchemist-brotherhood": 5114,
  "spy-x-family": 50265,
  "your-name": 32281,
};

export const animeFallback: Movie[] = [
  {
    slug: "naruto",
    title: "Naruto",
    originalTitle: "ナルト",
    genre: "Action · Adventure · Shounen",
    releaseDate: "2002",
    rating: "8.0",
    image: "https://cdn.myanimelist.net/images/anime/13/17405l.jpg",
    accent: "#d8a95d",
    badge: "Anime fallback",
    synopsis: "Moments prior to Naruto Uzumaki's birth, a huge demon known as the Kyuubi, the Nine-Tailed Fox, attacked Konohagakure. A young ninja pursues recognition and dreams of becoming Hokage.",
    cast: ["Naruto Uzumaki", "Sasuke Uchiha", "Kakashi Hatake"],
    category: "Anime",
    episodes: 220,
    externalId: "20",
    externalUrl: "https://myanimelist.net/anime/20/Naruto",
    director: "Pierrot",
    trailer: "https://www.youtube.com/watch?v=-G9BqkgZXRA",
  },
  {
    slug: "one-piece",
    title: "One Piece",
    originalTitle: "ワンピース",
    genre: "Action · Adventure · Fantasy",
    releaseDate: "1999",
    rating: "8.7",
    image: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    accent: "#e2764b",
    badge: "Anime fallback",
    synopsis: "Barely surviving in a barrel after passing through a terrible whirlpool at sea, carefree Monkey D. Luffy ends up aboard a ship under attack by pirates. Luffy sets off with his crew in search of the greatest treasure in the world.",
    cast: ["Monkey D. Luffy", "Roronoa Zoro", "Nami"],
    category: "Anime",
    episodes: 1100,
    externalId: "21",
    externalUrl: "https://myanimelist.net/anime/21/One_Piece",
    director: "Toei Animation",
    trailer: "https://www.youtube.com/watch?v=l_98K4_6UQ0",
  },
  {
    slug: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    originalTitle: "呪術廻戦",
    genre: "Action · Supernatural · Fantasy",
    releaseDate: "2020",
    rating: "8.6",
    image: "https://cdn.myanimelist.net/images/anime/1171/124187l.jpg",
    accent: "#38bdf8",
    badge: "Anime fallback",
    synopsis: "Idly indulging in paranormal activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital. A student joins a secret organization fighting curses born from human negativity.",
    cast: ["Yuuji Itadori", "Satoru Gojou", "Megumi Fushiguro"],
    category: "Anime",
    episodes: 24,
    externalId: "40748",
    externalUrl: "https://myanimelist.net/anime/40748/Jujutsu_Kaisen",
    director: "MAPPA",
    trailer: "https://www.youtube.com/watch?v=pkKu8r8m354",
  },
  {
    slug: "demon-slayer",
    title: "Demon Slayer: Kimetsu no Yaiba",
    originalTitle: "鬼滅の刃",
    genre: "Action · Fantasy · Supernatural",
    releaseDate: "2019",
    rating: "8.5",
    image: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    accent: "#cf5d30",
    badge: "Anime fallback",
    synopsis: "Ever since the death of his father, the burden of supporting the family has fallen upon Tanjirou Kamado's shoulders. A determined swordsman joins the Demon Slayer Corps to cure his sister Nezuko and avenge his family.",
    cast: ["Tanjirou Kamado", "Nezuko Kamado", "Zenitsu Agatsuma"],
    category: "Anime",
    episodes: 26,
    externalId: "38000",
    externalUrl: "https://myanimelist.net/anime/38000/Kimetsu_no_Yaiba",
    director: "ufotable",
    trailer: "https://www.youtube.com/watch?v=VQGCKyvzIM4",
  },
  {
    slug: "steins-gate",
    title: "Steins;Gate",
    originalTitle: "シュタインズ・ゲート",
    genre: "Sci-Fi · Mystery · Drama",
    releaseDate: "2011",
    rating: "9.1",
    image: "https://cdn.myanimelist.net/images/anime/1935/127974l.jpg",
    accent: "#10b981",
    badge: "Anime fallback",
    synopsis: "Eccentric scientist Rintarou Okabe accidentally invents a microwave that can send text messages into the past, sparking a chain of world-altering consequences.",
    cast: ["Rintarou Okabe", "Kurisu Makise", "Mayuri Shiina"],
    category: "Anime",
    episodes: 24,
    externalId: "9253",
    externalUrl: "https://myanimelist.net/anime/9253/Steins_Gate",
    director: "White Fox",
    trailer: "https://www.youtube.com/watch?v=uMYhjVwp0Fk",
  },
  {
    slug: "attack-on-titan",
    title: "Attack on Titan",
    originalTitle: "進撃の巨人",
    genre: "Action · Drama · Mystery",
    releaseDate: "2013",
    rating: "9.0",
    image: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    accent: "#8b5cf6",
    badge: "Anime fallback",
    synopsis: "Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans. Humanity fights for survival behind enormous defensive walls.",
    cast: ["Eren Yeager", "Mikasa Ackerman", "Levi Ackerman"],
    category: "Anime",
    episodes: 25,
    externalId: "16498",
    externalUrl: "https://myanimelist.net/anime/16498/Shingeki_no_Kyojin",
    director: "Wit Studio",
    trailer: "https://www.youtube.com/watch?v=MGRm4IzK1SQ",
  },
  {
    slug: "kaguya-sama",
    title: "Kaguya-sama: Love Is War",
    originalTitle: "かぐや様は告らせたい",
    genre: "Comedy · Romance",
    releaseDate: "2019",
    rating: "8.4",
    image: "https://cdn.myanimelist.net/images/anime/1295/106591l.jpg",
    accent: "#ec4899",
    badge: "Anime fallback",
    synopsis: "Two elite high school council geniuses refuse to confess their feelings first, engaging in elaborate psychological warfare of romantic deception.",
    cast: ["Kaguya Shinomiya", "Miyuki Shirogane", "Chika Fujiwara"],
    category: "Anime",
    episodes: 12,
    externalId: "37999",
    externalUrl: "https://myanimelist.net/anime/37999/Kaguya-sama_wa_Kokurasetai",
    director: "A-1 Pictures",
    trailer: "https://www.youtube.com/watch?v=2e_ZgnspK3w",
  },
  {
    slug: "frieren",
    title: "Frieren: Beyond Journey's End",
    originalTitle: "葬送のフリーレン",
    genre: "Adventure · Drama · Fantasy",
    releaseDate: "2023",
    rating: "9.3",
    image: "https://cdn.myanimelist.net/images/anime/1015/138075l.jpg",
    accent: "#06b6d4",
    badge: "Anime fallback",
    synopsis: "An elven mage outlives her human adventuring companions and embarks on a new voyage to understand mortal lives, memories, and regrets.",
    cast: ["Frieren", "Fern", "Stark"],
    category: "Anime",
    episodes: 28,
    externalId: "52991",
    externalUrl: "https://myanimelist.net/anime/52991/Sousou_no_Frieren",
    director: "Madhouse",
    trailer: "https://www.youtube.com/watch?v=qgQunxD0qLk",
  },
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
    genres: movie.genre.split(" · ").map((g) => g.trim()),
    studios: movie.director ? [movie.director] : [],
    poster: { url: movie.image, source: "ANIMEXIA fallback", license: "Fallback artwork; verify reuse rights." },
    backdrop: { url: movie.image, source: "ANIMEXIA fallback", license: "Fallback artwork; verify reuse rights." },
    characters: movie.cast.map((name) => ({ name })),
    externalUrl: movie.externalUrl,
    trailerUrl: movie.trailer,
  };
}

export const MAL_GENRE_MAP: Record<string, number> = {
  action: 1,
  adventure: 2,
  comedy: 4,
  mystery: 7,
  drama: 8,
  fantasy: 10,
  romance: 22,
  "sci-fi": 24,
  scifi: 24,
  shounen: 27,
  supernatural: 37,
};

export async function fetchJikanAnimeByGenre(genre: string, limit = 24, page = 1): Promise<Anime[]> {
  const norm = genre.toLowerCase().trim();
  const genreId = MAL_GENRE_MAP[norm];
  if (genreId) {
    return fetchList(`/anime?genres=${genreId}&order_by=score&sort=desc&page=${page}`, limit);
  }
  return fetchList(`/anime?q=${encodeURIComponent(genre)}&order_by=score&sort=desc&page=${page}`, limit);
}

export async function getJikanAnime(limit: number, fallback: Movie[] = [], page = 1, genre?: string): Promise<Movie[]> {
  const cleanGenre = genre?.trim().toLowerCase();
  const hasGenre = cleanGenre && cleanGenre !== "all";

  try {
    if (hasGenre) {
      const items = await fetchJikanAnimeByGenre(cleanGenre, limit, page);
      if (items.length > 0) return items.map(animeToMovie);
    } else {
      const items = await fetchJikanAnime(limit, page);
      if (items.length > 0) return items.map(animeToMovie);
    }
  } catch {
    // Graceful fallback on upstream timeout or rate limits
  }

  const sourceFallback = fallback.length ? fallback : animeFallback;
  if (hasGenre) {
    const filtered = sourceFallback.filter((item) => {
      const itemGenre = item.genre.toLowerCase();
      const itemCat = item.category?.toLowerCase() ?? "";
      return itemGenre.includes(cleanGenre) || itemCat.includes(cleanGenre);
    });
    return filtered.length > 0 ? filtered.slice(0, limit) : sourceFallback.slice(0, limit);
  }

  return sourceFallback.slice(0, limit);
}

export async function getJikanSection(fetcher: (limit: number) => Promise<Anime[]>, limit: number, fallback: Movie[]) {
  try {
    return (await fetcher(limit)).map(animeToMovie);
  } catch {
    return fallback;
  }
}

