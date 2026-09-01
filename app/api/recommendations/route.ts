import { NextResponse } from "next/server";
import { movies } from "@/lib/content";
import {
  generateMovieRecommendations,
  type RecommendationCandidate,
} from "@/lib/services/recommendations";

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isRecommendationCandidate(value: unknown): value is RecommendationCandidate {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.title === "string" && typeof candidate.reason === "string";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const genre = typeof body.genre === "string" ? body.genre.trim() : "";
    const synopsis = typeof body.synopsis === "string" ? body.synopsis.trim() : "";
    const releaseDate = typeof body.releaseDate === "string" ? body.releaseDate.trim() : undefined;
    const rating = typeof body.rating === "number" || typeof body.rating === "string" ? body.rating : undefined;
    const cast = Array.isArray(body.cast)
      ? body.cast.filter((value): value is string => typeof value === "string").slice(0, 6)
      : [];

    if (!title || !genre || !synopsis || title.length > 160 || genre.length > 160 || synopsis.length > 2000) {
      return NextResponse.json({ error: "Missing or invalid movie information." }, { status: 400 });
    }

    const result = await generateMovieRecommendations({
      title,
      genre,
      synopsis,
      releaseDate,
      rating,
      cast,
    });
    const currentTitle = normalizeTitle(title);
    const available = new Map(movies.map((movie) => [normalizeTitle(movie.title), movie]));
    const recommendations = result.recommendations
      .filter(isRecommendationCandidate)
      .map((candidate) => {
        const movie = available.get(normalizeTitle(candidate.title));
        return movie && normalizeTitle(movie.title) !== currentTitle
          ? { movie, reason: candidate.reason, confidence: candidate.confidence }
          : null;
      })
      .filter((recommendation): recommendation is NonNullable<typeof recommendation> => recommendation !== null)
      .filter((recommendation, index, list) => list.findIndex((item) => item.movie.slug === recommendation.movie.slug) === index);

    return NextResponse.json({ recommendations });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate recommendations right now.";
    const configurationError =
      message.includes("not configured") ||
      message.includes("empty recommendation") ||
      message.includes("malformed recommendation") ||
      message.includes("invalid recommendation");

    return NextResponse.json(
      { error: configurationError ? message : "Unable to generate recommendations right now." },
      { status: configurationError ? 503 : 500 }
    );
  }
}
