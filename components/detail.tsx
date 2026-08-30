import Link from "next/link";
import type { Movie, NewsItem } from "@/lib/mock-data";
import { MovieCard, NewsCard } from "./cards";
import { movies, news, shows } from "@/lib/content";

export function Detail({ item, kind }: { item: Movie | NewsItem; kind: "movie" | "show" | "news" }) {
  const movie = "cast" in item;
  const related = movie ? (kind === "show" ? shows : movies).filter((x) => x.slug !== item.slug).slice(0, 3) : news.filter((x) => x.slug !== item.slug).slice(0, 3);
  const meta = movie ? `${item.releaseDate}${item.rating ? ` · ★ ${item.rating}` : ""}` : item.published;
  return <article className="detail-page section"><Link className="back-link" href={kind === "news" ? "/news" : `/${kind === "show" ? "shows" : "movies"}`}>← Back to {kind === "news" ? "news" : kind === "show" ? "shows" : "movies"}</Link><div className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,10,15,.95), rgba(8,10,15,.35)), url("${item.image}")` }}><div><span className="section-label">{movie ? item.genre : item.category}</span><h1>{item.title}</h1><p className="detail-meta">{meta}</p></div></div><div className="detail-copy"><div><span className="section-label">The story</span><h2>{movie ? "Synopsis" : "The edit"}</h2><p>{movie ? item.synopsis : item.description}</p></div>{movie && <div><span className="section-label">On screen</span><h2>Cast</h2><p>{item.cast.join(" · ")}</p></div>}<div className="trailer"><span>▶</span><p>Trailer placeholder</p></div></div><section className="section related"><span className="section-label">Keep exploring</span><h2>Related {kind === "news" ? "stories" : "titles"}</h2><div className={kind === "news" ? "news-grid" : "movie-grid"}>{related.map((x, i) => kind === "news" ? <NewsCard key={x.slug} item={x as NewsItem} /> : <MovieCard key={x.slug} movie={x as Movie} index={i} />)}</div></section></article>;
}
