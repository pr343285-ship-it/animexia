import { NextResponse } from "next/server";
import { generateMovieSummary } from "@/lib/services/gemini";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const genre = typeof body.genre === "string" ? body.genre.trim() : "";
    const synopsis = typeof body.synopsis === "string" ? body.synopsis.trim() : "";
    const releaseDate = typeof body.releaseDate === "string" ? body.releaseDate.trim() : undefined;
    const rating = typeof body.rating === "number" || typeof body.rating === "string" ? body.rating : undefined;
    const cast = Array.isArray(body.cast)
      ? body.cast.filter((value): value is string => typeof value === "string").slice(0, 6)
      : [];

    if (!title || !genre || !synopsis) {
      return NextResponse.json({ error: "Missing movie title, genre, or synopsis." }, { status: 400 });
    }

    const result = await generateMovieSummary({ title, genre, synopsis, releaseDate, rating, cast });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate the summary right now.";
    const status = message.includes("not configured") || message.includes("empty response") ? 503 : 500;

    console.error("AI summary generation failed:", error);

    return NextResponse.json(
      {
        error:
          message.includes("not configured") || message.includes("empty response")
            ? message
            : "Unable to generate the summary right now.",
      },
      { status }
    );
  }
}
