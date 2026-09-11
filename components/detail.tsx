import Link from "next/link";
import type { Movie, NewsItem } from "@/lib/mock-data";
import { AISummary } from "./ai-summary";
import { MovieCard, NewsCard } from "./cards";
import { Recommendations } from "./recommendations";
import { movies, news, shows } from "@/lib/content";

function youtubeEmbedUrl(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    const id = url.hostname === "youtu.be"
      ? url.pathname.slice(1)
      : url.pathname.includes("/embed/")
        ? url.pathname.split("/embed/")[1]
        : url.searchParams.get("v");
    return id ? `https://www.youtube-nocookie.com/embed/${id.split(/[?&]/)[0]}` : undefined;
  } catch {
    return undefined;
  }
}

export function Detail({ item, kind }: { item: Movie | NewsItem; kind: "movie" | "show" | "news" }) {
  const movie = "cast" in item;
  const related = movie ? (kind === "show" ? shows : movies).filter((x) => x.slug !== item.slug).slice(0, 3) : news.filter((x) => x.slug !== item.slug).slice(0, 3);
  const meta = movie ? `${item.releaseDate}${item.rating ? ` · ★ ${item.rating}` : ""}` : item.published;
  const trailerEmbed = movie && item.trailer ? youtubeEmbedUrl(item.trailer) : undefined;

  return (
    <article className="detail-page section">
      <Link className="back-link" href={kind === "news" ? "/news" : `/${kind === "show" ? "shows" : "movies"}`}>
        ← Back to {kind === "news" ? "news" : kind === "show" ? "anime" : "anime movies"}
      </Link>

      <div className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,10,15,.95), rgba(8,10,15,.35)), url("${item.image}")` }}>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {movie ? (
              item.genre.split(" · ").map((g) => (
                <Link
                  key={g}
                  href={`/anime?genre=${encodeURIComponent(g.trim().toLowerCase())}`}
                  className="glass-genre-pill"
                >
                  <span>#</span>
                  {g.trim()}
                </Link>
              ))
            ) : (
              <span className="section-label">{item.category}</span>
            )}
          </div>
          <h1>{item.title}</h1>
          <p className="detail-meta">{meta}</p>
        </div>
      </div>

      <div className="detail-copy">
        <div>
          <span className="section-label">The story</span>
          <h2>{movie ? "Synopsis" : "The edit"}</h2>
          <p>{movie ? item.synopsis : item.excerpt ?? item.description}</p>
          {!movie && "url" in item && item.url ? <p><a className="text-link" href={item.url} target="_blank" rel="noreferrer">Read the full story at {item.source ?? "the original source"} ↗</a></p> : null}
        </div>

        {movie && (
          <div>
            <span className="section-label">On screen</span>
            <h2>Cast</h2>
            <p>{item.cast.join(" · ")}</p>
            {item.director || item.runtime || item.externalId ? (
              <p className="detail-credits">
                {item.director ? `Directed by ${item.director}` : ""}
                {item.director && item.runtime ? " · " : ""}
                {item.runtime ? `${item.runtime} min` : ""}
                {(item.director || item.runtime) && item.externalId ? " · " : ""}
                {item.externalId ? `Wikidata ${item.externalId}` : ""}
              </p>
            ) : null}
          </div>
        )}

        {kind === "show" && "cast" in item && (item.seasons || item.episodes) ? (
          <div className="trailer">
            <span>▦</span>
            <p>{item.seasons ? `${item.seasons} seasons` : ""}{item.seasons && item.episodes ? " · " : ""}{item.episodes ? `${item.episodes} episodes` : ""}</p>
          </div>
        ) : movie && trailerEmbed ? (
          <div className="trailer">
            <iframe
              title={`${item.title} official trailer`}
              src={trailerEmbed}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <p className="mt-3 text-center">
              <a className="text-link" href={item.trailer} target="_blank" rel="noreferrer">
                Open official trailer ↗
              </a>
            </p>
          </div>
        ) : (
          <div className="trailer trailer--unavailable">
            <div className="trailer-fallback-content">
              <span className="trailer-icon">🎬</span>
              <p className="trailer-title">Official trailer unavailable</p>
              <p className="trailer-subtitle">Explore synopsis and cast in the ANIMEXIA catalog</p>
            </div>
          </div>
        )}
      </div>

      {movie ? (
        <AISummary
          title={item.title}
          genre={item.genre}
          synopsis={item.synopsis}
          releaseDate={item.releaseDate}
          rating={item.rating}
          cast={item.cast}
        />
      ) : null}

      {movie ? (
        <Recommendations
          title={item.title}
          genre={item.genre}
          synopsis={item.synopsis}
          releaseDate={item.releaseDate}
          rating={item.rating}
          cast={item.cast}
        />
      ) : null}

      <section className="section related">
        <span className="section-label">Keep exploring</span>
        <h2>Related {kind === "news" ? "stories" : "titles"}</h2>
        <div className={kind === "news" ? "news-grid" : "movie-grid"}>
          {related.map((x, i) =>
            kind === "news" ? <NewsCard key={x.slug} item={x as NewsItem} /> : <MovieCard key={x.slug} movie={x as Movie} index={i} />
          )}
        </div>
      </section>
    </article>
  );
}
