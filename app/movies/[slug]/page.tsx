import { notFound } from "next/navigation";
import { Detail } from "@/components/detail";
import { Frame } from "@/components/frame";
import { findMovie, movies } from "@/lib/content";
import { animeToMovie, fetchJikanAnimeBySlug } from "@/lib/services/providers/jikan";
import { fetchWikidataMovieBySlug } from "@/lib/services/providers/wikidata";
export function generateStaticParams() { return movies.map(({ slug }) => ({ slug })); }
export default async function MovieDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const fallback = findMovie(slug); let item = fallback; try { const liveAnime = await fetchJikanAnimeBySlug(slug); if (liveAnime) item = animeToMovie(liveAnime); else { const live = await fetchWikidataMovieBySlug(slug); if (live) item = live; } } catch { item = fallback; } if (!item) notFound(); return <Frame active="Movies"><Detail item={item} kind="movie" /></Frame>; }
