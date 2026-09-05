import { Frame } from "@/components/frame";
import { Listing } from "@/components/listing";
import { animeFallback, getJikanAnime } from "@/lib/services/providers/jikan";
import Link from "next/link";

export default async function AnimePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const items = await getJikanAnime(24, page === 1 ? animeFallback : [], page);
  const hasNextPage = items.length === 24;

  return (
    <Frame active="Anime">
      <Listing title="Anime" eyebrow="The ANIMEXIA catalog" items={items} type="movie" />
      <nav className="catalog-pagination" aria-label="Anime catalog pagination">
        {page > 1 ? <Link className="button button--ghost" href={`/anime?page=${page - 1}`}>Previous</Link> : <span />}
        <span aria-current="page">Page {page}</span>
        {hasNextPage ? <Link className="button button--ghost" href={`/anime?page=${page + 1}`}>Next</Link> : <span />}
      </nav>
    </Frame>
  );
}
