import { notFound } from "next/navigation";
import { Detail } from "@/components/detail";
import { Frame } from "@/components/frame";
import { findShow, shows } from "@/lib/content";
import { animeToMovie, fetchJikanAnimeBySlug } from "@/lib/services/providers/jikan";
import { fetchTvMazeShowByName, toFrameShow } from "@/lib/services/providers/tvmaze";
export function generateStaticParams() { return shows.map(({ slug }) => ({ slug })); }
export default async function ShowDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallback = findShow(slug);
  let item = fallback;
  try {
    const lookupName = fallback?.title ?? slug.replace(/-/g, " ");
    const liveAnime = await fetchJikanAnimeBySlug(slug);
    if (liveAnime) item = animeToMovie(liveAnime);
    else {
      const live = await fetchTvMazeShowByName(lookupName);
      if (live) item = toFrameShow(live);
    }
  } catch {
    item = fallback;
  }
  if (!item) notFound();
  return <Frame active="Shows"><Detail item={item} kind="show" /></Frame>;
}
