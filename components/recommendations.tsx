"use client";

import { useState } from "react";
import type { Movie } from "@/lib/mock-data";
import { MovieCard } from "./cards";

type Recommendation = {
  movie: Movie;
  reason: string;
  confidence?: number;
};

export function Recommendations({
  title,
  genre,
  synopsis,
  releaseDate,
  rating,
  cast,
}: {
  title: string;
  genre: string;
  synopsis: string;
  releaseDate?: string;
  rating?: string | number;
  cast?: string[];
}) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState("");

  async function handleRequest() {
    setLoading(true);
    setRequested(true);
    setError("");

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, genre, synopsis, releaseDate, rating, cast }),
      });
      const payload = (await response.json()) as { recommendations?: Recommendation[]; error?: string };

      if (!response.ok) throw new Error(payload.error ?? "Unable to generate recommendations.");
      setRecommendations(Array.isArray(payload.recommendations) ? payload.recommendations : []);
    } catch (requestError) {
      setRecommendations([]);
      setError(requestError instanceof Error ? requestError.message : "Unable to generate recommendations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="recommendations" aria-live="polite">
      <div className="recommendations__header">
        <div>
          <span className="section-label">Personalized discovery</span>
          <h2>✨ You Might Also Like</h2>
        </div>
        <button className="button button--ghost" type="button" onClick={handleRequest} disabled={loading}>
          {loading ? "Finding titles..." : requested ? "Try again" : "Find similar movies"}
        </button>
      </div>

      {loading ? <p className="recommendations__message">Curating a few nearby worlds...</p> : null}
      {error ? <p className="recommendations__message recommendations__message--error">{error}</p> : null}
      {!loading && !error && requested && recommendations.length === 0 ? (
        <p className="recommendations__message">No matches found in the ANIMEXIA catalog yet. Try again later.</p>
      ) : null}

      {recommendations.length > 0 ? (
        <div className="recommendations__grid">
          {recommendations.map((recommendation, index) => (
            <div className="recommendation-card" key={recommendation.movie.slug}>
              <MovieCard movie={recommendation.movie} index={index} compact />
              <p>{recommendation.reason}</p>
              {recommendation.confidence !== undefined ? (
                <span className="recommendation-card__confidence">
                  {Math.round(recommendation.confidence * 100)}% relevance
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
