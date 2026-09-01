"use client";

import { type FormEvent, useMemo, useState } from "react";
import { MovieCard, NewsCard } from "./cards";
import type { Movie } from "@/lib/mock-data";
import type { NewsItem } from "@/lib/mock-data";

export function SearchPanel({ initialShows, initialMovies, initialNews }: { initialShows: Movie[]; initialMovies: Movie[]; initialNews: NewsItem[] }) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [mode, setMode] = useState<"keyword" | "ai">("keyword");
  const [aiResults, setAiResults] = useState<Movie[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSearched, setAiSearched] = useState(false);
  const [remoteShows, setRemoteShows] = useState<Movie[]>(initialShows);
  const [remoteMovies, setRemoteMovies] = useState<Movie[]>(initialMovies);
  const [remoteNews, setRemoteNews] = useState<NewsItem[]>(initialNews);

  const keywordResults = useMemo(() => {
    const q = submittedQuery.toLowerCase().trim();
    if (!q) return { movies: [], shows: [], news: [] };
    const match = (item: { title: string; genre?: string; category?: string; synopsis?: string; cast?: string[] }) =>
      `${item.title} ${item.genre ?? ""} ${item.category ?? ""} ${item.synopsis ?? ""} ${item.cast?.join(" ") ?? ""}`.toLowerCase().includes(q);
    return { movies: remoteMovies.filter(match), shows: remoteShows.filter(match), news: remoteNews.filter(match) };
  }, [remoteMovies, remoteShows, remoteNews, submittedQuery]);

  async function runAiSearch(nextQuery: string) {
    if (!nextQuery) {
      setAiSearched(false);
      setAiError("");
      return;
    }

    setAiLoading(true);
    setAiSearched(true);
    setAiError("");
    try {
      const response = await fetch("/api/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: nextQuery }),
      });
      const payload = (await response.json()) as { results?: Movie[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to search with AI right now.");
      setAiResults(Array.isArray(payload.results) ? payload.results : []);
    } catch (error) {
      setAiResults([]);
      setAiError(error instanceof Error ? error.message : "Unable to search with AI right now.");
    } finally {
      setAiLoading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextQuery = query.trim();
    setSubmittedQuery(nextQuery);
    if (mode === "keyword" && nextQuery) {
      try {
        const [showResponse, movieResponse, newsResponse] = await Promise.all([
          fetch(`/api/shows/search?q=${encodeURIComponent(nextQuery)}`),
          fetch(`/api/movies/search?q=${encodeURIComponent(nextQuery)}`),
          fetch(`/api/news/search?q=${encodeURIComponent(nextQuery)}`),
        ]);
        const showPayload = (await showResponse.json()) as { results?: Movie[] };
        const moviePayload = (await movieResponse.json()) as { results?: Movie[] };
        const newsPayload = (await newsResponse.json()) as { results?: NewsItem[] };
        if (showResponse.ok && Array.isArray(showPayload.results)) setRemoteShows(showPayload.results);
        if (movieResponse.ok && Array.isArray(moviePayload.results)) setRemoteMovies(moviePayload.results);
        if (newsResponse.ok && Array.isArray(newsPayload.results)) setRemoteNews(newsPayload.results);
      } catch {
        setRemoteShows(initialShows);
        setRemoteMovies(initialMovies);
        setRemoteNews(initialNews);
      }
    }
    if (mode === "ai") void runAiSearch(nextQuery);
    else {
      setAiSearched(false);
      setAiError("");
    }
  }

  const keywordMovies = [...keywordResults.movies, ...keywordResults.shows];
  const hasKeywordResults = keywordMovies.length > 0 || keywordResults.news.length > 0;

  return (
    <section className="section page-section">
      <span className="section-label">The archive</span>
      <h1 className="page-title">Search ANIMEXIA.</h1>
      <form className="smart-search-form" onSubmit={submit}>
        <input
          className="search-input"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={mode === "ai" ? "Try “dark fantasy anime”…" : "Search anime, series and updates…"}
          aria-label="Search anime, series and updates"
        />
        <button className="button button--light smart-search-submit" type="submit" disabled={!query.trim() || aiLoading}>
          {aiLoading ? "Searching..." : "Search"}
        </button>
      </form>
      <div className="search-modes" role="group" aria-label="Search mode">
        <button type="button" className={mode === "keyword" ? "search-mode search-mode--active" : "search-mode"} onClick={() => setMode("keyword")}>
          Keyword search
        </button>
        <button type="button" className={mode === "ai" ? "search-mode search-mode--active" : "search-mode"} onClick={() => setMode("ai")}>
          ✨ Smart Search
        </button>
      </div>

      {mode === "ai" && <p className="search-hint">Describe a mood, genre, theme, or favorite actor. Smart Search matches only titles in the ANIMEXIA catalog.</p>}
      {mode === "ai" && aiError && <div className="empty-state search-error"><p>{aiError}</p><button className="button button--ghost" type="button" onClick={() => void runAiSearch(submittedQuery)}>Retry</button></div>}
      {mode === "ai" && aiSearched && !aiLoading && !aiError && aiResults.length === 0 && <div className="empty-state"><p>No smart matches for “{submittedQuery}”.</p></div>}

      {mode === "ai" && aiResults.length > 0 && (
        <>
          <h2 className="results-title">Smart matches</h2>
          <div className="movie-grid">{aiResults.map((item, i) => <MovieCard key={item.slug} movie={item} index={i} />)}</div>
        </>
      )}
      {mode === "keyword" && submittedQuery && (
        <>
          <h2 className="results-title">Anime results</h2>
          <div className="movie-grid">{keywordMovies.map((item, i) => <MovieCard key={item.slug} movie={item} index={i} />)}</div>
          <h2 className="results-title">News</h2>
          <div className="news-grid">{keywordResults.news.map((item) => <NewsCard key={item.slug} item={item} />)}</div>
          {!hasKeywordResults && <div className="empty-state"><p>No results for “{submittedQuery}”.</p></div>}
        </>
      )}
    </section>
  );
}
