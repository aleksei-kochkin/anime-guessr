// Server-side utilities for cookies (for Server Components only)
import { cookies } from 'next/headers';

export const COOKIE_NAMES = {
  CONTENT_TYPE: 'content-type',
  ANIME_FILTERS: 'anime-filters',
  MOVIE_FILTERS: 'movie-filters',
  TV_SERIES_FILTERS: 'tv-series-filters',
} as const;

// Server-side чтение cookies
export async function getContentTypeCookie() {
  const cookieStore = await cookies();
  const contentType = cookieStore.get(COOKIE_NAMES.CONTENT_TYPE)?.value;
  
  if (contentType === 'anime' || contentType === 'movie' || contentType === 'tv') {
    return contentType;
  }
  return 'anime'; // default
}

export async function getAnimeFiltersCookie() {
  const cookieStore = await cookies();
  const animeFilters = cookieStore.get(COOKIE_NAMES.ANIME_FILTERS)?.value;
  
  try {
    return animeFilters ? JSON.parse(animeFilters) : {};
  } catch {
    return {};
  }
}

export async function getMovieFiltersCookie() {
  const cookieStore = await cookies();
  const movieFilters = cookieStore.get(COOKIE_NAMES.MOVIE_FILTERS)?.value;
  
  try {
    return movieFilters ? JSON.parse(movieFilters) : {};
  } catch {
    return {};
  }
}

export async function getTVSeriesFiltersCookie() {
  const cookieStore = await cookies();
  const tvSeriesFilters = cookieStore.get(COOKIE_NAMES.TV_SERIES_FILTERS)?.value;
  
  try {
    return tvSeriesFilters ? JSON.parse(tvSeriesFilters) : {};
  } catch {
    return {};
  }
}
