import { notFound } from "next/navigation";
import { Detail } from "@/components/detail";
import { Frame } from "@/components/frame";
import { findNews, news } from "@/lib/content";
export function generateStaticParams() { return news.map(({ slug }) => ({ slug })); }
export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = findNews(slug); if (!item) notFound(); return <Frame active="News"><Detail item={item} kind="news" /></Frame>; }
