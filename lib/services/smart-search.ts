import { getGeminiClient } from "./gemini";

export type SearchIntent = {
  contentType: "movie" | "show" | "both";
  genres: string[];
  themes: string[];
  mood: string[];
  actors: string[];
  releasePreference: string;
  keywords: string[];
};

const intentSchema = {
  type: "object",
  properties: {
    contentType: { type: "string", enum: ["movie", "show", "both"] },
    genres: { type: "array", items: { type: "string" } },
    themes: { type: "array", items: { type: "string" } },
    mood: { type: "array", items: { type: "string" } },
    actors: { type: "array", items: { type: "string" } },
    releasePreference: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
  },
  required: ["contentType", "genres", "themes", "mood", "actors", "releasePreference", "keywords"],
};

function cleanList(value: unknown, limit: number) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, 60))
        .filter(Boolean)
        .slice(0, limit)
    : [];
}

function isIntent(value: unknown): value is SearchIntent {
  if (!value || typeof value !== "object") return false;
  const intent = value as Record<string, unknown>;
  return intent.contentType === "movie" || intent.contentType === "show" || intent.contentType === "both";
}

export async function analyzeSearchIntent(query: string): Promise<SearchIntent> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze this entertainment search query and return only JSON matching the schema. Do not recommend titles or invent catalog records. Extract practical matching signals. Query: ${query}`,
          },
        ],
      },
    ],
    config: { responseMimeType: "application/json", responseSchema: intentSchema },
  });
  const raw = response.text?.trim();
  if (!raw) throw new Error("Gemini returned an empty search intent.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini returned malformed search intent.");
  }
  if (!isIntent(parsed)) throw new Error("Gemini returned invalid search intent.");

  return {
    contentType: parsed.contentType,
    genres: cleanList(parsed.genres, 5),
    themes: cleanList(parsed.themes, 6),
    mood: cleanList(parsed.mood, 4),
    actors: cleanList(parsed.actors, 8),
    releasePreference: typeof parsed.releasePreference === "string" ? parsed.releasePreference.trim().slice(0, 80) : "",
    keywords: cleanList(parsed.keywords, 8),
  };
}
