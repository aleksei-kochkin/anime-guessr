'use server';

import { getRandomAnime, searchAnime, checkAnswer } from '@/lib/api/shikimori';
import { getRandomContent, searchContent, checkAnswer as checkTMDBAnswer, normalizeFilters } from '@/lib/api/tmdb';
import { GameContent, ContentType, SearchResult } from '@/lib/types/game';
import { getContentTypeCookie, getAnimeFiltersCookie, getMovieFiltersCookie, getTVSeriesFiltersCookie } from '@/lib/utils/cookies-server';

/**
 * Get random content (anime, movie or TV series)
 * Reads settings from cookies
 */
export async function fetchRandomContent(
  contentType?: ContentType,
): Promise<GameContent> {
  // If type not provided, read from cookies
  const type = contentType || await getContentTypeCookie();
  
  try {
    if (type === 'movie') {
      // Read movie filters from cookies and normalize them
      const rawFilters = await getMovieFiltersCookie();
      const movieFilters = normalizeFilters(rawFilters, 'movie');
      const film = await getRandomContent('movie', movieFilters);
      return {
        ...film,
        contentType: type,
      };
    }
    
    if (type === 'tv') {
      // Read TV series filters from cookies and normalize them
      const rawFilters = await getTVSeriesFiltersCookie();
      const tvSeriesFilters = normalizeFilters(rawFilters, 'tv');
      const film = await getRandomContent('tv', tvSeriesFilters);
      return {
        ...film,
        contentType: type,
      };
    }
    
    // Read anime filters from cookies
    const animeFilters = await getAnimeFiltersCookie();
    const anime = await getRandomAnime(animeFilters);
    return {
      ...anime,
      contentType: 'anime',
    };
  } catch (error) {
    console.error(`Error fetching random ${type}:`, error);
    const contentLabel = type === 'movie' ? 'movie' : type === 'tv' ? 'TV series' : 'anime';
    throw new Error(`Failed to fetch ${contentLabel}. Please try again.`);
  }
}

/**
 * Search content by query
 * Reads settings from cookies
 */
export async function fetchContentSuggestions(
  query: string,
  contentType?: ContentType,
): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  // If type not provided, read from cookies
  const type = contentType || await getContentTypeCookie();

  try {
    if (type === 'movie') {
      // Read movie filters from cookies and normalize them
      const rawFilters = await getMovieFiltersCookie();
      const movieFilters = normalizeFilters(rawFilters, 'movie');
      const results = await searchContent(query, 'movie', movieFilters);
      return results.map(film => ({
        ...film,
        contentType: type,
      }));
    }
    
    if (type === 'tv') {
      // Read TV series filters from cookies and normalize them
      const rawFilters = await getTVSeriesFiltersCookie();
      const tvSeriesFilters = normalizeFilters(rawFilters, 'tv');
      const results = await searchContent(query, 'tv', tvSeriesFilters);
      return results.map(film => ({
        ...film,
        contentType: type,
      }));
    }

    // Read anime filters from cookies
    const animeFilters = await getAnimeFiltersCookie();
    const results = await searchAnime(query, animeFilters);
    return results; // searchAnime now returns SearchResult[] with contentType
  } catch (error) {
    console.error(`Error searching ${type}:`, error);
    return [];
  }
}

/**
 * Verify user answer
 */
export async function verifyAnswer(
  userAnswer: string,
  correctId: number,
  correctName: string,
  correctSecondaryName: string,
  userAnswerId?: number,
  contentType: ContentType = 'anime'
): Promise<boolean> {
  // If ID from suggestions - check directly (100% accuracy)
  if (userAnswerId !== undefined) {
    return userAnswerId === correctId;
  }
  
  // Otherwise check by name (for manual input)
  if (contentType !== 'anime') {
    return checkTMDBAnswer(userAnswer, correctName, correctSecondaryName);
  }
  
  return checkAnswer(userAnswer, correctName, correctSecondaryName);
}
