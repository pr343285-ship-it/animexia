import { Frame } from "@/components/frame";
import { Listing } from "@/components/listing";
import { animeFallback, getJikanAnime } from "@/lib/services/providers/jikan";
import Link from "next/link";

const GENRES = [
  { label: "All", value: "" },
  { label: "Action", value: "action" },
  { label: "Adventure", value: "adventure" },
  { label: "Fantasy", value: "fantasy" },
  { label: "Sci-Fi", value: "sci-fi" },
  { label: "Shounen", value: "shounen" },
  { label: "Supernatural", value: "supernatural" },
  { label: "Comedy", value: "comedy" },
  { label: "Romance", value: "romance" },
  { label: "Mystery", value: "mystery" },
  { label: "Drama", value: "drama" },
];

export default async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; genre?: string; category?: string }>;
}) {
  const params = await searchParams;
  const rawGenre = params.genre ?? params.category ?? "";
  const genre = rawGenre.trim();
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const items = await getJikanAnime(24, page === 1 ? animeFallback : [], page, genre);
  const hasNextPage = items.length === 24;

  const title = genre
    ? `${genre.charAt(0).toUpperCase() + genre.slice(1)} Anime`
    : "Anime";
  const eyebrow = genre
    ? `Filtered by genre: ${genre}`
    : "The ANIMEXIA catalog";

  const prevHref = genre
    ? `/anime?genre=${encodeURIComponent(genre)}&page=${page - 1}`
    : `/anime?page=${page - 1}`;
  const nextHref = genre
    ? `/anime?genre=${encodeURIComponent(genre)}&page=${page + 1}`
    : `/anime?page=${page + 1}`;

  const filterSlot = (
    <div className="genre-filter-container">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GENRES.map((g) => {
          const isActive = (!genre && g.value === "") || (genre.toLowerCase() === g.value.toLowerCase());
          const href = g.value ? `/anime?genre=${encodeURIComponent(g.value)}` : "/anime";
          return (
            <Link
              key={g.label}
              href={href}
              className={`genre-filter-pill ${isActive ? "genre-filter-pill--active" : ""}`}
            >
              {g.label}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <Frame active="Anime">
      <Listing title={title} eyebrow={eyebrow} items={items} type="movie" filterSlot={filterSlot} />
      <nav className="catalog-pagination" aria-label="Anime catalog pagination">
        {page > 1 ? (
          <Link className="button button--ghost" href={prevHref}>
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        <span aria-current="page">Page {page}</span>
        {hasNextPage ? (
          <Link className="button button--ghost" href={nextHref}>
            Next →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </Frame>
  );
}
