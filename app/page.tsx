import { MovieCard, NewsCard, SectionHeader } from "@/components/cards";
import Link from "next/link";
import {
  featuredMovie,
  latestNews,
} from "@/lib/mock-data";
import { getFrameNews } from "@/lib/services/providers/guardian";
import { animeFallback, fetchJikanAiringAnime, fetchJikanMovies, fetchJikanUpcomingAnime, animeToMovie, getJikanAnime } from "@/lib/services/providers/jikan";

export const dynamic = "force-dynamic";

function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.13-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function Home() {
  const topAnime = (await getJikanAnime(12, animeFallback)).slice(0, 6);
  const [airingAnime, upcomingAnime, animeMovies, frameNews] = await Promise.all([
    fetchJikanAiringAnime(6).then((items) => items.map(animeToMovie)).catch(() => animeFallback),
    fetchJikanUpcomingAnime(6).then((items) => items.map(animeToMovie)).catch(() => animeFallback),
    fetchJikanMovies(6).then((items) => items.map(animeToMovie)).catch(() => animeFallback),
    getFrameNews(3, latestNews),
  ]);
  const featured = topAnime[0] ?? featuredMovie;
  return (
    <main>
      <section className="hero">
        <div className="hero__backdrop" />
        <div className="hero__glow" />
        <div className="site-shell relative z-10">
          <header className="site-header">
            <Link href="/" className="brand" aria-label="ANIMEXIA homepage">
              <span className="brand__mark">A</span>
              <span>ANIMEXIA<span className="brand__dot">.</span></span>
            </Link>
            <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
              <a className="nav-link nav-link--active" href="#discover">Home</a>
              <a className="nav-link" href="#trending">Trending</a>
              <a className="nav-link" href="#updates">Updates</a>
              <a className="nav-link" href="#news">News</a>
              <a className="nav-link" href="#shows">Anime</a>
            </nav>
            <div className="flex items-center gap-3">
              <a href="/search" className="icon-button" aria-label="Search anime">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
              </a>
              <a href="#newsletter" className="header-cta">Join ANIMEXIA</a>
              <details className="relative md:hidden">
                <summary className="icon-button list-none" aria-label="Open navigation menu">
                  <span className="sr-only">Menu</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                </summary>
                <nav className="mobile-nav" aria-label="Mobile navigation">
                  <a href="#discover">Home</a><a href="#trending">Trending</a><a href="#updates">Updates</a><a href="#news">News</a><a href="#shows">Anime</a>
                </nav>
              </details>
            </div>
          </header>

          <div className="hero__content" id="discover">
            <div className="hero__eyebrow"><span className="eyebrow-line" /> Featured anime <span className="eyebrow-year">{featured.releaseDate}</span></div>
            <h1>{featured.title}<br /><em>the next obsession.</em></h1>
            <p className="hero__description">{featured.genre} · {featured.rating ?? "New"}. Anime news, premieres, and the stories shaping the next wave of the season.</p>
            <div className="flex flex-wrap items-center gap-3">
              <a className="button button--light" href="#trending"><PlayIcon /> Explore the picks</a>
              <a className="button button--ghost" href="#news">Read the latest <ArrowIcon /></a>
            </div>
          </div>
          <div className="hero__meta"><span>01 / 04</span><span className="hero__progress"><i /></span><span>Season watchlist</span></div>
        </div>
      </section>

      <div className="site-shell">
        <section className="section" id="trending">
          <SectionHeader eyebrow="The watchlist" title="Trending anime" action="View all" />
          <div className="movie-grid">{topAnime.map((movie, index) => <MovieCard key={movie.title} movie={movie} index={index} />)}</div>
        </section>

        <section className="section section--news" id="news">
          <SectionHeader eyebrow="The daily edit" title="Anime news" action="All news" />
          <div className="news-grid">{frameNews.map((item) => <NewsCard key={item.slug} item={item} />)}</div>
        </section>

        <section className="section" id="shows">
          <div className="split-heading">
            <SectionHeader eyebrow="Mark your calendar" title="Upcoming anime" />
            <p className="section-intro">A first look at the next wave of premieres, special screenings and highly anticipated drops.</p>
          </div>
          <div className="movie-grid movie-grid--upcoming">{upcomingAnime.map((movie, index) => <MovieCard key={movie.title} movie={movie} index={index} />)}</div>
        </section>

        <section className="section section--shows">
          <SectionHeader eyebrow="Binge-worthy" title="Currently airing" action="Explore anime" />
          <div className="show-grid">{airingAnime.map((movie, index) => <MovieCard key={movie.title} movie={movie} index={index} compact />)}</div>
        </section>

        <section className="section">
          <SectionHeader eyebrow="Feature-length stories" title="Anime movies" action="Explore anime" />
          <div className="movie-grid">{animeMovies.map((movie, index) => <MovieCard key={movie.title} movie={movie} index={index} />)}</div>
        </section>

        <section className="newsletter" id="newsletter">
          <div><span className="section-label">The weekly cut</span><h2>Fresh stories,<br /><em>for your queue.</em></h2></div>
          <div className="newsletter__form"><p>A thoughtful round-up of what to watch, read and look forward to in anime.</p><div className="newsletter__input"><span>your@email.com</span><button type="button" aria-label="Subscribe to ANIMEXIA updates"><ArrowIcon /></button></div><small>By subscribing, you agree to our terms. No noise, ever.</small></div>
        </section>
        <footer className="site-footer"><Link href="/" className="brand" aria-label="ANIMEXIA home"><span className="brand__mark">A</span><span>ANIMEXIA<span className="brand__dot">.</span></span></Link><span>Anime, culture and what is coming next.</span><span>© 2024 ANIMEXIA</span></footer>
      </div>
    </main>
  );
}
