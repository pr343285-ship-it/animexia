import { NextResponse } from "next/server";
import { news } from "@/lib/content";
import { searchGuardianNews } from "@/lib/services/providers/guardian";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > 160) return NextResponse.json({ results: [] }, { status: 400 });
  try {
    return NextResponse.json({ results: await searchGuardianNews(query) });
  } catch {
    const normalized = query.toLowerCase();
    return NextResponse.json({
      results: news.filter((item) => `${item.title} ${item.category} ${item.description ?? ""}`.toLowerCase().includes(normalized)),
    });
  }
}
