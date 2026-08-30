import { Frame } from "@/components/frame";
import { Listing } from "@/components/listing";
import { movies } from "@/lib/content";
import Link from "next/link";
export default async function Movies({ searchParams }: { searchParams: Promise<{ category?: string }> }) { const { category } = await searchParams; const items = category ? movies.filter((x) => x.genre.toLowerCase().includes(category.toLowerCase())) : movies; return <Frame active="Movies"><div className="filter-bar"><span>Browse by</span><Link href="/movies">All</Link><Link href="/movies?category=drama">Drama</Link><Link href="/movies?category=sci-fi">Sci-fi</Link><Link href="/movies?category=horror">Horror</Link></div><Listing title="Movies" eyebrow="The big screen" items={items} type="movie" /></Frame>; }
