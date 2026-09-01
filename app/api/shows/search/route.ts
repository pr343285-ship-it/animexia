import { NextResponse } from "next/server";
import { searchJikanAnime } from "@/lib/services/providers/jikan";
import { showSearchResultsToFrame, searchTvMazeShows } from "@/lib/services/providers/tvmaze";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > 120) return NextResponse.json({ results: [] }, { status: 400 });

  try {
    const animeResults = await searchJikanAnime(query, 8);
    if (animeResults.length > 0) return NextResponse.json({ results: animeResults });
  } catch {
    // Fall through to TVmaze when Jikan is unavailable.
  }

  try {
    const results = await searchTvMazeShows(query);
    return NextResponse.json({ results: showSearchResultsToFrame(results) });
  } catch {
    return NextResponse.json({ results: [], error: "Show search is temporarily unavailable." }, { status: 503 });
  }
}
