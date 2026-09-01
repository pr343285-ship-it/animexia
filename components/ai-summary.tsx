"use client";

import { useState } from "react";

export function AISummary({
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
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function handleRequest() {
    setLoading(true);
    setError("");
    setSummary("");

    try {
      const response = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, genre, synopsis, releaseDate, rating, cast }),
      });

      const payload = (await response.json()) as { summary?: string; error?: string };

      if (!response.ok || !payload.summary) {
        throw new Error(payload.error ?? "Unable to generate the summary.");
      }

      setSummary(payload.summary);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to generate the summary.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="ai-summary" aria-live="polite">
      <div className="ai-summary__header">
        <div>
          <span className="section-label">AI spotlight</span>
          <h2>AI Summary</h2>
        </div>
        <button className="button button--ghost ai-summary__button" type="button" onClick={handleRequest} disabled={loading}>
          {loading ? "Generating..." : "Generate summary"}
        </button>
      </div>

      {error ? <p className="ai-summary__message ai-summary__message--error">{error}</p> : null}

      {summary ? <p className="ai-summary__message">{summary}</p> : null}

      {!summary && !error && !loading ? (
        <p className="ai-summary__placeholder">Get a quick, original editorial summary for this title.</p>
      ) : null}
    </section>
  );
}
