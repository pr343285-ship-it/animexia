import { GoogleGenAI } from "@google/genai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  return new GoogleGenAI({ apiKey });
}

export type MovieSummaryRequest = {
  title: string;
  genre: string;
  synopsis: string;
  releaseDate?: string;
  rating?: string | number;
  cast?: string[];
};

export type MovieSummaryResult = {
  summary: string;
};

export async function generateMovieSummary(payload: MovieSummaryRequest): Promise<MovieSummaryResult> {
  const ai = getGeminiClient();
  const cast = payload.cast?.length ? payload.cast.slice(0, 6).join(", ") : "featured ensemble cast";
  const releaseDate = payload.releaseDate ?? "upcoming release";
  const rating = payload.rating ? `Rating: ${payload.rating}.` : "";

  const prompt = `Write a vivid, original, and concise movie summary in 3 to 5 sentences for a cinematic entertainment site. Keep it engaging and accessible for fans. Use this information: Title: ${payload.title}. Genre: ${payload.genre}. Release date: ${releaseDate}. ${rating} Synopsis: ${payload.synopsis}. Cast: ${cast}. Write in a polished, editorial tone without spoilers or marketing fluff.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const summary = response.text?.trim();

  if (!summary) {
    throw new Error("Gemini returned an empty response.");
  }

  return { summary };
}
