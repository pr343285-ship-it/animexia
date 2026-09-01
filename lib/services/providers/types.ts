export type MediaImage = {
  url: string;
  source: string;
  license?: string;
};

export type CastMember = {
  name: string;
  character?: string;
  image?: MediaImage;
};

export type Genre = string;

export type AnimeCharacter = {
  name: string;
  role?: string;
  image?: MediaImage;
};

export type Anime = {
  id: string;
  slug: string;
  title: string;
  japaneseTitle?: string;
  synopsis: string;
  type?: string;
  status?: string;
  episodes?: number;
  score?: number;
  rank?: number;
  popularity?: number;
  year?: number;
  airedFrom?: string;
  airedTo?: string;
  genres: Genre[];
  studios: string[];
  poster?: MediaImage;
  backdrop?: MediaImage;
  trailerUrl?: string;
  characters: AnimeCharacter[];
  source?: string;
  providerId: string;
  season?: string;
  externalUrl?: string;
};

export type Show = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  genres: Genre[];
  rating?: number;
  premiereDate?: string;
  image?: MediaImage;
  cast: CastMember[];
  seasons?: number;
  episodes?: number;
};

export type SearchResult = {
  id: string;
  title: string;
  slug: string;
  type: "show" | "movie";
  image?: MediaImage;
};
