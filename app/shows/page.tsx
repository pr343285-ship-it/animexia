import { Frame } from "@/components/frame";
import { Listing } from "@/components/listing";
import { animeFallback, getJikanAnime } from "@/lib/services/providers/jikan";
import Link from "next/link";
export default async function Shows({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const items = await getJikanAnime(24, animeFallback);
  const filtered = category ? items.filter((x) => x.genre.toLowerCase().includes(category.toLowerCase())) : items;
  return <Frame active="Anime"><div className="filter-bar"><span>Browse by</span><Link href="/shows">All</Link><Link href="/shows?category=action">Action</Link><Link href="/shows?category=fantasy">Fantasy</Link><Link href="/shows?category=adventure">Adventure</Link></div><Listing title="Anime" eyebrow="The ANIMEXIA catalog" items={filtered} type="movie" /></Frame>;
}
