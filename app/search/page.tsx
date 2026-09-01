import { Frame } from "@/components/frame";
import { SearchPanel } from "@/components/search";
import { news } from "@/lib/content";
import { getFrameNews } from "@/lib/services/providers/guardian";
import { animeFallback, getJikanAnime } from "@/lib/services/providers/jikan";
export default async function Search() {
  const initialShows = await getJikanAnime(24, animeFallback);
  const initialMovies = initialShows;
  const initialNews = await getFrameNews(12, news);
  return <Frame active="Search"><SearchPanel initialShows={initialShows} initialMovies={initialMovies} initialNews={initialNews} /></Frame>;
}
