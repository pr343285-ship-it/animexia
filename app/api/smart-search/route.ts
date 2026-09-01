import { NextResponse } from "next/server";
import { movies, shows } from "@/lib/content";
import { getJikanAnime } from "@/lib/services/providers/jikan";
import { getFrameShows } from "@/lib/services/providers/tvmaze";
import { getFrameMovies } from "@/lib/services/providers/wikidata";
import { analyzeSearchIntent, type SearchIntent } from "@/lib/services/smart-search";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scoreMovie(movie: (typeof movies)[number], intent: SearchIntent) {
  const type = movie.category?.toLowerCase() === "shows" || movie.category?.toLowerCase() === "anime" ? "show" : "movie";
  if (intent.contentType !== "both" && intent.contentType !== type) return 0;

  const searchable = normalize(`${movie.title} ${movie.genre} ${movie.synopsis} ${movie.releaseDate} ${movie.cast.join(" ")}`);
  const signals = [...intent.genres, ...intent.themes, ...intent.mood, ...intent.actors, ...intent.keywords];
  const matchedSignals = signals.filter((signal) => searchable.includes(normalize(signal))).length;
  const titleMatch = intent.keywords.some((keyword) => normalize(movie.title).includes(normalize(keyword)));
  const actorMatch = intent.actors.filter((actor) => movie.cast.some((name) => normalize(name).includes(normalize(actor)))).length;
  const releaseMatch = intent.releasePreference && searchable.includes(normalize(intent.releasePreference)) ? 1 : 0;
  return matchedSignals + actorMatch * 2 + (titleMatch ? 3 : 0) + releaseMatch;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let body: Record<string, unknown>;
    try {
      body = (rawBody ? JSON.parse(rawBody) : {}) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (!query || query.length > 240) {
      return NextResponse.json({ error: "Enter a search query of 240 characters or fewer." }, { status: 400 });
    }

    const intent = await analyzeSearchIntent(query);
    const liveJikanShows = await getJikanAnime(24, shows);
    const liveShows = await getFrameShows(24, shows);
    const liveMovies = await getFrameMovies(36, movies);
    const catalog = [
      ...liveMovies,
      ...liveJikanShows.filter((show) => !liveMovies.some((movie) => movie.slug === show.slug)),
      ...liveShows.filter((show) => !liveJikanShows.some((anime) => anime.slug === show.slug) && !liveMovies.some((movie) => movie.slug === show.slug)),
    ];
    const results = catalog
      .map((item) => ({ item, score: scoreMovie(item, intent) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(({ item }) => item);

    return NextResponse.json({ intent, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to search with AI right now.";
    const safeProviderError = /not configured|empty search intent|malformed search intent|invalid search intent/.test(message);
    return NextResponse.json(
      { error: safeProviderError ? message : "Unable to search with AI right now." },
      { status: safeProviderError ? 503 : 500 }
    );
  }
}
