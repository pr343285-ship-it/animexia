import { notFound } from "next/navigation";
import { Detail } from "@/components/detail";
import { Frame } from "@/components/frame";
import { findMovie, movies } from "@/lib/content";
export function generateStaticParams() { return movies.map(({ slug }) => ({ slug })); }
export default async function MovieDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const item = findMovie(slug); if (!item) notFound(); return <Frame active="Movies"><Detail item={item} kind="movie" /></Frame>; }
