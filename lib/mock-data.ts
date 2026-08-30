export type Movie = {
  slug: string;
  title: string;
  genre: string;
  releaseDate: string;
  rating?: string;
  image: string;
  accent: string;
  badge?: string;
  synopsis: string;
  cast: string[];
  trailer?: string;
  category?: string;
};

export type Update = {
  slug: string;
  category: string;
  title: string;
  readTime: string;
  image: string;
  description?: string;
};

export type NewsItem = Update & {
  published: string;
};

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

export const featuredMovie: Movie = {
  slug: "the-quiet-between",
  title: "The Quiet Between",
  genre: "Mystery · Drama",
  releaseDate: "In theaters October 18",
  rating: "Editor's pick",
  image: image("photo-1500534623283-312aade485b7"),
  accent: "#e38b60",
  badge: "Frame premiere",
  synopsis: "A cartographer returns to the coast where she grew up and finds a mystery hidden in the tide.",
  cast: ["Mara Voss", "Eli Bennett", "Nia Cole"],
  category: "Movies",
};

export const trendingMovies: Movie[] = [
  { slug: "the-wild-robot", title: "The Wild Robot", genre: "Adventure · Animation", releaseDate: "Now streaming", rating: "8.9", image: image("photo-1534447677768-be436bb09401"), accent: "#e38b60", badge: "Trending #1", synopsis: "A robot learns the language of a wild island and the meaning of home.", cast: ["Lupita Nyong'o", "Pedro Pascal"], category: "Movies" },
  { slug: "dune-part-two", title: "Dune: Part Two", genre: "Sci-fi · Epic", releaseDate: "Now streaming", rating: "9.1", image: image("photo-1500534623283-312aade485b7"), accent: "#c9955c", synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge.", cast: ["Timothée Chalamet", "Zendaya"], category: "Movies" },
  { slug: "past-lives", title: "Past Lives", genre: "Drama · Romance", releaseDate: "2023", rating: "8.7", image: image("photo-1489599849927-2ee91cede3ba"), accent: "#889aab", synopsis: "Two childhood friends reunite and reckon with the lives they chose.", cast: ["Greta Lee", "Teo Yoo"], category: "Movies" },
  { slug: "the-substance", title: "The Substance", genre: "Horror · Satire", releaseDate: "Now in cinemas", rating: "8.4", image: image("photo-1485846234645-a62644f84728"), accent: "#d46e79", synopsis: "A fading star discovers a mysterious way to become a better version of herself.", cast: ["Demi Moore", "Margaret Qualley"], category: "Movies" },
];

export const upcomingMovies: Movie[] = [
  { slug: "mickey-17", title: "Mickey 17", genre: "Sci-fi · Thriller", releaseDate: "April 18, 2025", image: image("photo-1440404653325-ab127d49abc1"), accent: "#a7b8c6", badge: "Coming soon", synopsis: "An expendable worker on a distant world refuses to stay dead.", cast: ["Robert Pattinson", "Naomi Ackie"], category: "Movies" },
  { slug: "the-last-showgirl", title: "The Last Showgirl", genre: "Drama", releaseDate: "January 10, 2025", image: image("photo-1503095396549-807759245b35"), accent: "#dc9b8c", synopsis: "A veteran performer searches for her next act when the curtain falls.", cast: ["Pamela Anderson", "Jamie Lee Curtis"], category: "Movies" },
  { slug: "nosferatu", title: "Nosferatu", genre: "Gothic · Horror", releaseDate: "December 25, 2024", image: image("photo-1518709268805-4e9042af9f23"), accent: "#8b91a3", synopsis: "A gothic romance summons an ancient shadow to a small European town.", cast: ["Lily-Rose Depp", "Nicholas Hoult"], category: "Movies" },
];

export const popularShows: Movie[] = [
  { slug: "shogun", title: "Shōgun", genre: "Historical drama", releaseDate: "Season 1 · 10 episodes", rating: "9.2", image: image("photo-1578926288207-a90a5366759d"), accent: "#bf8f75", synopsis: "An English pilot enters a dangerous struggle for power in feudal Japan.", cast: ["Hiroyuki Sanada", "Anna Sawai"], category: "Shows" },
  { slug: "the-bear", title: "The Bear", genre: "Comedy · Drama", releaseDate: "Season 3 · 10 episodes", rating: "8.8", image: image("photo-1552566626-52f8b828add9"), accent: "#db9c52", synopsis: "A young chef returns home to run his family's sandwich shop.", cast: ["Jeremy Allen White", "Ayo Edebiri"], category: "Shows" },
  { slug: "ripley", title: "Ripley", genre: "Crime · Thriller", releaseDate: "Limited series", rating: "8.1", image: image("photo-1524985069026-dd778a71c7b4"), accent: "#8d9fa2", synopsis: "A grifter is drawn into a world of wealth, privilege and deception.", cast: ["Andrew Scott", "Dakota Fanning"], category: "Shows" },
];

export const latestUpdates: Update[] = [
  { slug: "quiet-revolution-production-design", category: "The craft", title: "Inside the quiet revolution of production design", readTime: "6 min read", image: image("photo-1489599849927-2ee91cede3ba"), description: "The artists building worlds that feel lived in." },
  { slug: "12-films-of-the-year", category: "On screen", title: "The 12 films that made our year so far", readTime: "8 min read", image: image("photo-1485846234645-a62644f84728"), description: "A halfway roll call of the year's essential cinema." },
  { slug: "next-generation-filmmakers", category: "The people", title: "A conversation with the next generation of filmmakers", readTime: "5 min read", image: image("photo-1500534623283-312aade485b7"), description: "Meet the voices reshaping the frame." },
];

export const latestNews: NewsItem[] = [
  { slug: "festival-oscar-buzz", category: "Industry", title: "The festival titles already generating Oscar buzz", readTime: "4 min read", published: "2 hours ago", image: image("photo-1489599849927-2ee91cede3ba"), description: "The early conversation from the world's biggest festivals." },
  { slug: "most-anticipated-trailers", category: "Trailers", title: "A first look at the season's most anticipated stories", readTime: "3 min read", published: "Yesterday", image: image("photo-1485846234645-a62644f84728"), description: "New footage, new worlds and plenty to look forward to." },
  { slug: "intimate-filmmaking", category: "The people", title: "Why intimate filmmaking is having a major moment", readTime: "7 min read", published: "2 days ago", image: image("photo-1503095396549-807759245b35"), description: "Small stories are making a very large impression." },
];
