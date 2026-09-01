import { getGeminiClient } from "./gemini";

export type RecommendationRequest = {
  title: string;
  genre: string;
  synopsis: string;
  releaseDate?: string;
  rating?: string | number;
  cast?: string[];
};

export type RecommendationCandidate = {
  title: string;
  reason: string;
  confidence?: number;
};

export type RecommendationResult = {
  recommendations: RecommendationCandidate[];
};

const recommendationSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      title: { type: "string" },
      reason: { type: "string" },
      confidence: { type: "number" },
    },
    required: ["title", "reason"],
  },
};

function isCandidate(value: unknown): value is RecommendationCandidate {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.reason === "string" &&
    candidate.reason.trim().length > 0 &&
    (candidate.confidence === undefined ||
      (typeof candidate.confidence === "number" && Number.isFinite(candidate.confidence)))
  );
}

export async function generateMovieRecommendations(
  payload: RecommendationRequest
): Promise<RecommendationResult> {
  const ai = getGeminiClient();
  const cast = payload.cast?.length ? payload.cast.slice(0, 6).join(", ") : "featured ensemble cast";
  const releaseDate = payload.releaseDate ?? "release information unavailable";
  const rating = payload.rating ? `Rating: ${payload.rating}.` : "";
  const prompt = `Recommend up to 3 movies from a known catalog based on this movie. Return only a JSON array of objects with title, reason, and optional confidence from 0 to 1. Do not invent titles, franchises, links, URLs, or metadata. Prefer well-known feature films with similar themes, tone, genre, or audience. Keep each reason under 20 words. Movie: ${payload.title}. Genre: ${payload.genre}. Release: ${releaseDate}. ${rating} Synopsis: ${payload.synopsis}. Cast: ${cast}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: recommendationSchema,
    },
  });

  const raw = response.text?.trim();
  if (!raw) throw new Error("Gemini returned an empty recommendation response.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini returned malformed recommendation data.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini returned an invalid recommendation list.");
  }

  return {
    recommendations: parsed
      .filter(isCandidate)
      .slice(0, 3)
      .map((candidate) => ({
        title: candidate.title.trim().slice(0, 120),
        reason: candidate.reason.trim().slice(0, 240),
        ...(candidate.confidence === undefined
          ? {}
          : { confidence: Math.max(0, Math.min(1, candidate.confidence)) }),
      })),
  };
}
