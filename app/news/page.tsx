import { Frame } from "@/components/frame";
import { Listing } from "@/components/listing";
import { news } from "@/lib/content";
export default function News() { return <Frame active="News"><Listing title="News" eyebrow="The daily edit" items={news} type="news" /></Frame>; }
