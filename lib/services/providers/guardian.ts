import type { NewsItem } from "@/lib/mock-data";

type GuardianResult = {
  id?: string;
  webTitle?: string;
  webUrl?: string;
  webPublicationDate?: string;
  sectionName?: string;
  fields?: { trailText?: string; thumbnail?: string };
  tags?: Array<{ webTitle?: string }>;
};

type GuardianResponse = { response?: { status?: string; results?: GuardianResult[] } };

const API_URL = "https://content.guardianapis.com";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function stripHtml(value: string | undefined) {
  return (value ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function normalizeArticle(article: GuardianResult): NewsItem | undefined {
  if (!article.webTitle || !article.webUrl || !article.webPublicationDate) return undefined;
  const excerpt = stripHtml(article.fields?.trailText);
  return {
    slug: slugify(article.webTitle),
    category: article.sectionName ?? "Culture",
    title: article.webTitle,
    readTime: "Read on Guardian",
    published: new Date(article.webPublicationDate).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }),
    image: article.fields?.thumbnail ?? "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=85",
    description: excerpt || "Read the latest reporting and criticism from The Guardian.",
    excerpt: excerpt || "Read the full story at The Guardian.",
    source: "The Guardian",
    url: article.webUrl,
    tags: (article.tags ?? []).map((tag) => tag.webTitle).filter((tag): tag is string => Boolean(tag)).slice(0, 8),
    imageSource: article.fields?.thumbnail ? "The Guardian" : "ANIMEXIA neutral placeholder",
    imageLicense: article.fields?.thumbnail ? "Provider image; verify Guardian image terms before reuse" : "No provider image used",
    providerId: article.id,
  };
}

async function request(path: string, revalidate = 1800) {
  const apiKey = process.env.GUARDIAN_API_KEY;
  if (!apiKey) throw new Error("Guardian API key is not configured.");
  const response = await fetch(`${API_URL}${path}${path.includes("?") ? "&" : "?"}api-key=${encodeURIComponent(apiKey)}`, {
    next: { revalidate },
    headers: { Accept: "application/json", "User-Agent": "ANIMEXIA anime guide/1.0" },
  });
  if (response.status === 429) throw new Error("Guardian rate limit reached.");
  if (!response.ok) throw new Error(`Guardian request failed with status ${response.status}.`);
  const data = (await response.json()) as GuardianResponse;
  if (data.response?.status !== "ok") throw new Error("Guardian returned an invalid response.");
  return data.response.results ?? [];
}

const query = "film OR movie OR television OR streaming";

export async function fetchGuardianNews(limit = 12) {
  const results = await request(`/search?q=${encodeURIComponent(query)}&section=film, culture&order-by=newest&page-size=${limit}&show-fields=trailText,thumbnail&show-tags=keyword`);
  return results.map(normalizeArticle).filter((article): article is NewsItem => Boolean(article));
}

export async function searchGuardianNews(search: string, limit = 12) {
  const results = await request(`/search?q=${encodeURIComponent(search)}&order-by=newest&page-size=${limit}&show-fields=trailText,thumbnail&show-tags=keyword`, 900);
  return results.map(normalizeArticle).filter((article): article is NewsItem => Boolean(article));
}

export async function findGuardianArticleByTitle(title: string) {
  const results = await searchGuardianNews(`"${title}"`, 1);
  return results[0];
}

export async function getFrameNews(limit: number, fallback: NewsItem[]) {
  try {
    return await fetchGuardianNews(limit);
  } catch {
    return fallback;
  }
}
