import Link from "next/link";
import type { Anime } from "@/lib/services/providers/types";
import { animeToMovie } from "@/lib/services/providers/jikan";
import { MovieCard } from "./cards";
import { AISummary } from "./ai-summary";
import { Recommendations } from "./recommendations";

function date(value?: string) {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function youtubeEmbedUrl(value: string) {
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

export function AnimeDetail({ item, related }: { item: Anime; related: Anime[] }) {
  const trailerEmbedUrl = item.trailerUrl ? youtubeEmbedUrl(item.trailerUrl) : undefined;
  return (
    <article className="detail-page section">
      <Link className="back-link" href="/anime">← Back to anime</Link>
      <div className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,10,15,.95), rgba(8,10,15,.35)), url("${item.backdrop?.url ?? item.poster?.url ?? ""}")` }}>
        <div>
          <span className="section-label">{item.type ?? "Anime"} · {item.status ?? "Status unavailable"}</span>
          <h1>{item.title}</h1>
          {item.japaneseTitle && <p className="detail-meta">{item.japaneseTitle}</p>}
          <p className="detail-meta">{item.score ? `★ ${item.score.toFixed(1)}` : "Score unavailable"}{item.rank ? ` · Rank #${item.rank}` : ""}{item.popularity ? ` · Popularity #${item.popularity}` : ""}</p>
        </div>
      </div>
      <div className="detail-copy">
        <div>
          <span className="section-label">The story</span>
          <h2>Synopsis</h2>
          <p>{item.synopsis}</p>
          <div className="flex flex-wrap gap-2">{item.genres.map((genre) => <span className="search-mode" key={genre}>{genre}</span>)}</div>
        </div>
        <div>
          <span className="section-label">Production</span>
          <h2>Anime details</h2>
          <p>{item.episodes ? `${item.episodes} episodes` : "Episode count unavailable"} · Aired {date(item.airedFrom)}{item.airedTo ? ` – ${date(item.airedTo)}` : ""}</p>
          <p className="detail-credits">{item.studios.length ? `Studio: ${item.studios.join(" · ")}` : "Studio information unavailable"}{item.source ? ` · Source: ${item.source}` : ""}</p>
        </div>
        {item.trailerUrl && trailerEmbedUrl ? <div className="trailer"><iframe title={`${item.title} official trailer`} src={trailerEmbedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /><p><a className="text-link" href={item.trailerUrl} target="_blank" rel="noreferrer">Open official trailer ↗</a></p></div> : <div className="trailer"><span>▶</span><p>Official trailer unavailable</p></div>}
      </div>
      {item.characters.length > 0 && <section className="section"><span className="section-label">Cast</span><h2>Characters</h2><p>{item.characters.map((character) => `${character.name}${character.role ? ` (${character.role})` : ""}`).join(" · ")}</p></section>}
      <AISummary title={item.title} genre={item.genres.join(" · ")} synopsis={item.synopsis} releaseDate={date(item.airedFrom)} rating={item.score?.toFixed(1)} cast={item.characters.map((character) => character.name)} />
      <Recommendations title={item.title} genre={item.genres.join(" · ")} synopsis={item.synopsis} releaseDate={date(item.airedFrom)} rating={item.score?.toFixed(1)} cast={item.characters.map((character) => character.name)} />
      <section className="section related"><span className="section-label">Keep exploring</span><h2>Related anime</h2><div className="movie-grid">{related.map((anime, index) => <MovieCard key={anime.id} movie={animeToMovie(anime)} index={index} />)}</div></section>
    </article>
  );
}
