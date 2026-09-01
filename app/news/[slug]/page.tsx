import { notFound } from "next/navigation";
import { Detail } from "@/components/detail";
import { Frame } from "@/components/frame";
import { findNews, news } from "@/lib/content";
import { findGuardianArticleByTitle } from "@/lib/services/providers/guardian";
export function generateStaticParams() { return news.map(({ slug }) => ({ slug })); }
export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const fallback = findNews(slug); let item = fallback; try { if (fallback) item = (await findGuardianArticleByTitle(fallback.title)) ?? fallback; } catch { item = fallback; } if (!item) notFound(); return <Frame active="News"><Detail item={item} kind="news" /></Frame>; }
