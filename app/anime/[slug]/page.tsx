import { notFound } from "next/navigation";
import { Frame } from "@/components/frame";
import { AnimeDetail } from "@/components/anime-detail";
import { animeFallback, fallbackToAnime, fetchJikanAnimeBySlug, fetchJikanAnime, type Anime } from "@/lib/services/providers/jikan";

export async function generateStaticParams() {
  try {
    const items = await fetchJikanAnime(12);
    return items.map((item) => ({ slug: item.slug }));
  } catch {
    return animeFallback.map((item) => ({ slug: item.slug }));
  }
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let item: Anime | undefined;
  try {
    item = await fetchJikanAnimeBySlug(slug);
  } catch {
    item = undefined;
  }
  if (!item) {
    const fallback = animeFallback.find((anime) => anime.slug === slug);
    if (fallback) item = fallbackToAnime(fallback);
  }
  if (!item) notFound();
  const related = await fetchJikanAnime(6).then((items) => items.filter((anime) => anime.id !== item.id).slice(0, 3)).catch(() => []);
  return <Frame active="Anime"><AnimeDetail item={item} related={related} /></Frame>;
}
