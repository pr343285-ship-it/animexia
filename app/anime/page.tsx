import { Frame } from "@/components/frame";
import { Listing } from "@/components/listing";
import { animeFallback, getJikanAnime } from "@/lib/services/providers/jikan";

export default async function AnimePage() {
  const items = await getJikanAnime(24, animeFallback);
  return <Frame active="Anime"><Listing title="Anime" eyebrow="The ANIMEXIA catalog" items={items} type="movie" /></Frame>;
}
