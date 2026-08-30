import { notFound } from "next/navigation";
import { Detail } from "@/components/detail";
import { Frame } from "@/components/frame";
import { findShow, shows } from "@/lib/content";
export function generateStaticParams() { return shows.map(({ slug }) => ({ slug })); }
export default async function ShowDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = findShow(slug); if (!item) notFound(); return <Frame active="Shows"><Detail item={item} kind="show" /></Frame>; }
