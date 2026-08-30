import type { CSSProperties } from "react";
import type { Movie, NewsItem, Update } from "@/lib/mock-data";

export function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: string }) {
  return <div className="section-heading"><div><span className="section-label">{eyebrow}</span><h2>{title}</h2></div>{action && <a className="text-link" href="#discover">{action}<span aria-hidden="true">↗</span></a>}</div>;
}

export function MovieCard({ movie, index, compact = false }: { movie: Movie; index: number; compact?: boolean }) {
  return <a aria-label={`View details for ${movie.title}`} className={`movie-card ${compact ? "movie-card--compact" : ""}`} href={`/${movie.category === "Shows" ? "shows" : "movies"}/${movie.slug}`} style={{ "--card-accent": movie.accent, "--delay": `${index * 80}ms` } as CSSProperties}>
    <div className="movie-card__image" style={{ backgroundImage: `linear-gradient(180deg, transparent 35%, rgba(6, 8, 13, .88) 100%), url("${movie.image}")` }}>{movie.badge && <span className="movie-card__badge">{movie.badge}</span>}{movie.rating && <span className="movie-card__rating">★ {movie.rating}</span>}<span className="movie-card__play">+</span></div>
    <div className="movie-card__info"><div><h3>{movie.title}</h3><p>{movie.genre}</p></div><span className="movie-card__year">{movie.releaseDate}</span></div>
  </a>;
}

export function ContentCard({ item }: { item: Update }) {
  return <a aria-label={`Read: ${item.title}`} className="content-card" href={`/news/${item.slug}`}><div className="content-card__image" style={{ backgroundImage: `url("${item.image}")` }} /><div className="content-card__copy"><span className="section-label">{item.category}</span><h3>{item.title}</h3><span className="content-card__read">{item.readTime}<span aria-hidden="true">↗</span></span></div></a>;
}

export function NewsCard({ item }: { item: NewsItem }) {
  return <a aria-label={`Read news: ${item.title}`} className="news-card" href={`/news/${item.slug}`}><div className="news-card__image" style={{ backgroundImage: `url("${item.image}")` }} /><div className="news-card__copy"><span className="section-label">{item.category}</span><h3>{item.title}</h3><div className="news-card__meta"><span>{item.published}</span><span>{item.readTime}</span></div></div></a>;
}

export function EmptyState({ label }: { label: string }) {
  return <div className="empty-state"><span className="section-label">Frame archive</span><p>No {label} to show yet.</p></div>;
}
