import { NextResponse } from "next/server";
import { movies } from "@/lib/content";
import { searchJikanAnime } from "@/lib/services/providers/jikan";
import { searchWikidataMovies } from "@/lib/services/providers/wikidata";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > 120) return NextResponse.json({ results: [] }, { status: 400 });

  try {
    const animeResults = await searchJikanAnime(query, 8);
    if (animeResults.length > 0) return NextResponse.json({ results: animeResults });
  } catch {
    // Fall through to the movie provider when Jikan is unavailable.
  }

  try {
    return NextResponse.json({ results: await searchWikidataMovies(query) });
  } catch {
    const results = movies.filter((movie) => movie.title.toLowerCase().includes(query.toLowerCase()));
    return NextResponse.json({ results });
  }
}
