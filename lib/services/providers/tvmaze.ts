import type { Movie } from "@/lib/mock-data";
import type { CastMember, MediaImage, SearchResult, Show } from "./types";

type TvMazeShow = {
  id: number;
  name: string;
  genres: string[];
  premiered?: string | null;
  rating?: { average?: number | null };
  summary?: string | null;
  image?: { medium?: string | null; original?: string | null } | null;
  _embedded?: {
    cast?: Array<{ person?: { name?: string; image?: { medium?: string | null; original?: string | null } | null }; character?: { name?: string } }>;
    episodes?: Array<{ id: number; season?: number | null }>;
  };
};

const API_URL = "https://api.tvmaze.com";
const ATTRIBUTION = "TVmaze";

function stripHtml(value: string | null | undefined) {
  return (value ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function mediaImage(url: string | null | undefined): MediaImage | undefined {
  return url ? { url, source: ATTRIBUTION, license: "CC BY-SA 4.0 data source; verify image rights before commercial reuse" } : undefined;
}

function normalizeShow(raw: TvMazeShow): Show {
  const cast: CastMember[] = (raw._embedded?.cast ?? []).slice(0, 8).flatMap((entry) => {
    const name = entry.person?.name;
    if (!name) return [];
    return [{ name, character: entry.character?.name, image: mediaImage(entry.person?.image?.medium ?? entry.person?.image?.original) }];
  });
  const episodes = raw._embedded?.episodes ?? [];
  const seasons = new Set(episodes.map((episode) => episode.season).filter((season): season is number => typeof season === "number")).size;

  return {
    id: String(raw.id),
    slug: slugify(raw.name),
    title: raw.name,
    summary: stripHtml(raw.summary),
    genres: raw.genres ?? [],
    rating: typeof raw.rating?.average === "number" ? raw.rating.average : undefined,
    premiereDate: raw.premiered ?? undefined,
    image: mediaImage(raw.image?.original ?? raw.image?.medium),
    cast,
    seasons: seasons || undefined,
    episodes: episodes.length || undefined,
  };
}

async function request<T>(path: string, revalidate = 3600): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    next: { revalidate },
    headers: { Accept: "application/json", "User-Agent": "ANIMEXIA anime guide" },
  });
  if (response.status === 429) throw new Error("TVmaze rate limit reached.");
  if (!response.ok) throw new Error(`TVmaze request failed with status ${response.status}.`);
  return response.json() as Promise<T>;
}

export async function getFrameShows(limit = 24, fallback: Movie[] = []): Promise<Movie[]> {
  try {
    return (await fetchTvMazeShows(limit)).map(toFrameShow);
  } catch {
    return fallback;
  }
}

export function toFrameShow(show: Show): Movie {
  return {
    slug: show.slug,
    title: show.title,
    genre: show.genres.join(" · ") || "Series",
    releaseDate: show.premiereDate ? `Premiered ${show.premiereDate}` : "Release date unavailable",
    rating: show.rating?.toFixed(1),
    image: show.image?.url ?? "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=85",
    accent: "#bf8f75",
    synopsis: show.summary || "A Frame series without a published synopsis yet.",
    cast: show.cast.map((member) => member.name),
    category: "Shows",
    seasons: show.seasons,
    episodes: show.episodes,
    imageSource: show.image?.source,
    imageLicense: show.image?.license,
  };
}

export async function fetchTvMazeShows(limit = 24): Promise<Show[]> {
  const data = await request<TvMazeShow[]>("/shows?page=0");
  return data.slice(0, limit).map(normalizeShow);
}

export async function searchTvMazeShows(query: string, limit = 12): Promise<Show[]> {
  const data = await request<Array<{ show: TvMazeShow }>>(`/search/shows?q=${encodeURIComponent(query)}`, 900);
  return data.slice(0, limit).map((entry) => normalizeShow(entry.show));
}

export async function fetchTvMazeShowByName(name: string): Promise<Show | undefined> {
  const data = await request<TvMazeShow | null>(`/singlesearch/shows?q=${encodeURIComponent(name)}&embed[]=cast&embed[]=episodes`, 3600);
  return data ? normalizeShow(data) : undefined;
}

export function showSearchResultsToFrame(results: Show[]): Movie[] {
  return results.map(toFrameShow);
}

export function showToSearchResult(show: Show): SearchResult {
  return { id: show.id, title: show.title, slug: show.slug, type: "show", image: show.image };
}
