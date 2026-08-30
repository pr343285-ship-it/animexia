import { Frame } from "@/components/frame";
import { Listing } from "@/components/listing";
import { shows } from "@/lib/content";
import Link from "next/link";
export default async function Shows({ searchParams }: { searchParams: Promise<{ category?: string }> }) { const { category } = await searchParams; const items = category ? shows.filter((x) => x.genre.toLowerCase().includes(category.toLowerCase())) : shows; return <Frame active="Shows"><div className="filter-bar"><span>Browse by</span><Link href="/shows">All</Link><Link href="/shows?category=drama">Drama</Link><Link href="/shows?category=comedy">Comedy</Link><Link href="/shows?category=thriller">Thriller</Link></div><Listing title="Shows" eyebrow="The long take" items={items} type="movie" /></Frame>; }
