import { Frame } from "@/components/frame";
import { Listing } from "@/components/listing";
import { news } from "@/lib/content";
import { getFrameNews } from "@/lib/services/providers/guardian";
export default async function News() { const items = await getFrameNews(12, news); return <Frame active="News"><Listing title="News" eyebrow="The daily edit" items={items} type="news" /></Frame>; }
