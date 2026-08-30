import { featuredMovie, latestNews, latestUpdates, popularShows, trendingMovies, upcomingMovies, type Movie, type NewsItem, type Update } from "./mock-data";

export const movies = [featuredMovie, ...trendingMovies, ...upcomingMovies];
export const shows = popularShows;
export const news = latestNews;
export const updates = latestUpdates;

export function findMovie(slug: string): Movie | undefined { return movies.find((item) => item.slug === slug); }
export function findShow(slug: string): Movie | undefined { return shows.find((item) => item.slug === slug); }
export function findNews(slug: string): NewsItem | undefined { return news.find((item) => item.slug === slug); }
export function findUpdate(slug: string): Update | undefined { return updates.find((item) => item.slug === slug); }
