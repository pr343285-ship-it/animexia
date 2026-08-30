import { ContentCard, MovieCard, NewsCard, SectionHeader } from "@/components/cards";
import Link from "next/link";
import {
  featuredMovie,
  latestUpdates,
  latestNews,
  popularShows,
  trendingMovies,
  upcomingMovies,
} from "@/lib/mock-data";

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

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero__backdrop" />
        <div className="hero__glow" />
        <div className="site-shell relative z-10">
          <header className="site-header">
            <Link href="/" className="brand" aria-label="Frame homepage">
              <span className="brand__mark">F</span>
              <span>FRAME<span className="brand__dot">.</span></span>
            </Link>
            <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
              <a className="nav-link nav-link--active" href="#discover">Discover</a>
              <a className="nav-link" href="#trending">Trending</a>
              <a className="nav-link" href="#updates">Updates</a>
              <a className="nav-link" href="#news">News</a>
              <a className="nav-link" href="#shows">Shows</a>
            </nav>
            <div className="flex items-center gap-3">
              <a href="#search" className="icon-button" aria-label="Search movies">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
              </a>
              <a href="#newsletter" className="header-cta">Join Frame</a>
              <details className="relative md:hidden">
                <summary className="icon-button list-none" aria-label="Open navigation menu">
                  <span className="sr-only">Menu</span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
                </summary>
                <nav className="mobile-nav" aria-label="Mobile navigation">
                  <a href="#discover">Discover</a><a href="#trending">Trending</a><a href="#updates">Updates</a><a href="#news">News</a><a href="#shows">Shows</a>
                </nav>
              </details>
            </div>
          </header>

          <div className="hero__content" id="discover">
            <div className="hero__eyebrow"><span className="eyebrow-line" /> {featuredMovie.badge} <span className="eyebrow-year">{featuredMovie.releaseDate}</span></div>
            <h1>{featuredMovie.title}<br /><em>staying with you.</em></h1>
            <p className="hero__description">{featuredMovie.genre} · {featuredMovie.rating}. A considered guide to the films, series and people shaping what comes next.</p>
            <div className="flex flex-wrap items-center gap-3">
              <a className="button button--light" href="#trending"><PlayIcon /> Explore the picks</a>
              <a className="button button--ghost" href="#updates">Read the latest <ArrowIcon /></a>
            </div>
          </div>
          <div className="hero__meta"><span>01 / 04</span><span className="hero__progress"><i /></span><span>Watchlist spotlight</span></div>
        </div>
      </section>

      <div className="site-shell">
        <section className="section" id="trending">
          <SectionHeader eyebrow="The conversation" title="Trending now" action="View all" />
          <div className="movie-grid">{trendingMovies.map((movie, index) => <MovieCard key={movie.title} movie={movie} index={index} />)}</div>
        </section>

        <section className="section section--updates" id="updates">
          <SectionHeader eyebrow="From the frame" title="Latest updates" action="All stories" />
          <div className="updates-grid">{latestUpdates.map((item) => <ContentCard key={item.title} item={item} />)}</div>
        </section>

        <section className="section section--news" id="news">
          <SectionHeader eyebrow="The daily edit" title="Entertainment news" action="All news" />
          <div className="news-grid">{latestNews.map((item) => <NewsCard key={item.title} item={item} />)}</div>
        </section>

        <section className="section" id="shows">
          <div className="split-heading">
            <SectionHeader eyebrow="Mark your calendar" title="Coming soon" />
            <p className="section-intro">A first look at the films we cannot wait to see on the big screen.</p>
          </div>
          <div className="movie-grid movie-grid--upcoming">{upcomingMovies.map((movie, index) => <MovieCard key={movie.title} movie={movie} index={index} />)}</div>
        </section>

        <section className="section section--shows">
          <SectionHeader eyebrow="Binge-worthy" title="Popular shows" action="Explore series" />
          <div className="show-grid">{popularShows.map((movie, index) => <MovieCard key={movie.title} movie={movie} index={index} compact />)}</div>
        </section>

        <section className="newsletter" id="newsletter">
          <div><span className="section-label">The weekly cut</span><h2>Good stories,<br /><em>in your inbox.</em></h2></div>
          <div className="newsletter__form"><p>A thoughtful round-up of what to watch, read and look forward to.</p><div className="newsletter__input"><span>your@email.com</span><button type="button" aria-label="Subscribe to newsletter"><ArrowIcon /></button></div><small>By subscribing, you agree to our terms. No noise, ever.</small></div>
        </section>
        <footer className="site-footer"><Link href="/" className="brand"><span className="brand__mark">F</span><span>FRAME<span className="brand__dot">.</span></span></Link><span>Culture in motion.</span><span>© 2024 Frame Journal</span></footer>
      </div>
    </main>
  );
}
