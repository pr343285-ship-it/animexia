"use client";
import { useMemo, useState } from "react";
import { MovieCard, NewsCard } from "./cards";
import { movies, news, shows } from "@/lib/content";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => { const q = query.toLowerCase().trim(); if (!q) return { movies: [], shows: [], news: [] }; const match = (x: { title: string; genre?: string; category?: string }) => `${x.title} ${x.genre ?? ""} ${x.category ?? ""}`.toLowerCase().includes(q); return { movies: movies.filter(match), shows: shows.filter(match), news: news.filter(match) }; }, [query]);
  return <section className="section page-section"><span className="section-label">The archive</span><h1 className="page-title">Search Frame.</h1><input className="search-input" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search films, shows and stories…" aria-label="Search films, shows and stories" />{query && <><h2 className="results-title">Movies & shows</h2><div className="movie-grid">{[...results.movies, ...results.shows].map((item, i) => <MovieCard key={item.slug} movie={item} index={i} />)}</div><h2 className="results-title">News</h2><div className="news-grid">{results.news.map((item) => <NewsCard key={item.slug} item={item} />)}</div>{!results.movies.length && !results.shows.length && !results.news.length && <div className="empty-state">No results for “{query}”.</div>}</>}</section>;
}
