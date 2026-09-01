import type { Movie } from "@/lib/mock-data";

type Binding = { value?: string };
type SparqlResponse = { results?: { bindings?: Record<string, Binding>[] } };

const ENDPOINT = "https://query.wikidata.org/sparql";
const SOURCE = "Wikidata";
const PLACEHOLDER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function sparqlValue(binding: Record<string, Binding>, key: string) {
  return binding[key]?.value;
}

function toMovie(binding: Record<string, Binding>): Movie | undefined {
  const title = sparqlValue(binding, "title");
  const id = sparqlValue(binding, "item")?.split("/").pop();
  if (!title || !id) return undefined;

  const date = sparqlValue(binding, "date");
  const genres = [...new Set([sparqlValue(binding, "genre1"), sparqlValue(binding, "genre2")].filter(Boolean))];
  return {
    slug: slugify(title),
    title,
    originalTitle: sparqlValue(binding, "originalTitle"),
    genre: genres.join(" · ") || "Film",
    releaseDate: date ?? "Release date unavailable",
    rating: sparqlValue(binding, "rating"),
    voteCount: sparqlValue(binding, "votes") ? Number(sparqlValue(binding, "votes")) : undefined,
    runtime: sparqlValue(binding, "runtime") ? Number(sparqlValue(binding, "runtime")) : undefined,
    image: PLACEHOLDER,
    imageSource: `${SOURCE} metadata; ANIMEXIA neutral placeholder`,
    imageLicense: "Not a movie poster; no provider artwork used",
    accent: "#889aab",
    synopsis: "Wikidata does not consistently provide a licensed plot synopsis for this title.",
    cast: [sparqlValue(binding, "actor1"), sparqlValue(binding, "actor2")].filter((value): value is string => Boolean(value)),
    director: sparqlValue(binding, "director"),
    externalId: id,
    externalUrl: `https://www.wikidata.org/wiki/${id}`,
    category: "Movies",
  };
}

async function query(query: string, revalidate = 3600): Promise<SparqlResponse> {
  const response = await fetch(`${ENDPOINT}?query=${encodeURIComponent(query)}&format=json`, {
    next: { revalidate },
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "ANIMEXIA anime guide/1.0 (server catalog)",
    },
  });
  if (response.status === 429) throw new Error("Wikidata rate limit reached.");
  if (!response.ok) throw new Error(`Wikidata request failed with status ${response.status}.`);
  return response.json() as Promise<SparqlResponse>;
}

const listQuery = `
SELECT ?item ?title (MIN(?date) AS ?date) ?genre1 ?genre2 ?rating ?votes ?runtime ?actor1 ?actor2 ?director WHERE {
  ?item wdt:P31 wd:Q11424;
        rdfs:label ?title;
        wdt:P577 ?date.
  FILTER(LANG(?title) = "en")
  FILTER(YEAR(?date) >= 2020)
  OPTIONAL { ?item wdt:P136 ?genreOne. ?genreOne rdfs:label ?genre1. FILTER(LANG(?genre1) = "en") }
  OPTIONAL { ?item wdt:P136 ?genreTwo. ?genreTwo rdfs:label ?genre2. FILTER(LANG(?genre2) = "en") }
  OPTIONAL { ?item wdt:P444 ?rating. }
  OPTIONAL { ?item wdt:P1114 ?votes. }
  OPTIONAL { ?item wdt:P2047 ?runtime. }
  OPTIONAL { ?item wdt:P161 ?actorOne. ?actorOne rdfs:label ?actor1. FILTER(LANG(?actor1) = "en") }
  OPTIONAL { ?item wdt:P161 ?actorTwo. ?actorTwo rdfs:label ?actor2. FILTER(LANG(?actor2) = "en") }
  OPTIONAL { ?item wdt:P57 ?directorEntity. ?directorEntity rdfs:label ?director. FILTER(LANG(?director) = "en") }
}
GROUP BY ?item ?title ?genre1 ?genre2 ?rating ?votes ?runtime ?actor1 ?actor2 ?director
ORDER BY DESC(?date)
LIMIT 36
`;

export async function fetchWikidataMovies(limit = 24) {
  const data = await query(listQuery);
  return (data.results?.bindings ?? []).map(toMovie).filter((movie): movie is Movie => Boolean(movie)).slice(0, limit);
}

export async function searchWikidataMovies(title: string, limit = 12) {
  const safeTitle = title.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ");
  const data = await query(`
SELECT ?item ?title ?date ?genre1 ?genre2 ?rating ?votes ?runtime ?actor1 ?actor2 ?director WHERE {
  ?item wdt:P31 wd:Q11424;
        rdfs:label ?title.
  FILTER(LANG(?title) = "en")
  FILTER(CONTAINS(LCASE(?title), "${safeTitle.toLowerCase()}"))
  OPTIONAL { ?item wdt:P577 ?date. }
  OPTIONAL { ?item wdt:P136 ?genreEntity. ?genreEntity rdfs:label ?genre1. FILTER(LANG(?genre1) = "en") }
  OPTIONAL { ?item wdt:P444 ?rating. }
  OPTIONAL { ?item wdt:P161 ?actorEntity. ?actorEntity rdfs:label ?actor1. FILTER(LANG(?actor1) = "en") }
  OPTIONAL { ?item wdt:P57 ?directorEntity. ?directorEntity rdfs:label ?director. FILTER(LANG(?director) = "en") }
}
LIMIT ${limit}
`, 900);
  return (data.results?.bindings ?? []).map(toMovie).filter((movie): movie is Movie => Boolean(movie));
}

export async function fetchWikidataMovieBySlug(slug: string) {
  const title = slug.replace(/-/g, " ");
  const results = await searchWikidataMovies(title, 1);
  return results.find((movie) => movie.slug === slug) ?? results[0];
}

export async function getFrameMovies(limit: number, fallback: Movie[]) {
  try {
    return await fetchWikidataMovies(limit);
  } catch {
    return fallback;
  }
}
