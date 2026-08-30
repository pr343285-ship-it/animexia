import { MovieCard, NewsCard } from "./cards";
import type { Movie, NewsItem } from "@/lib/mock-data";

export function Listing({ title, eyebrow, items, type }: { title: string; eyebrow: string; items: (Movie | NewsItem)[]; type: "movie" | "news" }) {
  return <section className="section page-section"><span className="section-label">{eyebrow}</span><h1 className="page-title">{title}</h1><div className={type === "news" ? "news-grid" : "movie-grid"}>{items.map((item, index) => type === "news" ? <NewsCard key={item.slug} item={item as NewsItem} /> : <MovieCard key={item.slug} movie={item as Movie} index={index} />)}</div>{items.length === 0 && <div className="empty-state">Nothing found in the Frame archive.</div>}</section>;
}
