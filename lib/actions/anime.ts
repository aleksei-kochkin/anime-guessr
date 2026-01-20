'use server';

import { GameContent, ContentType, SearchResult } from '@/lib/types/game';
import { ContentStrategyFactory } from '@/lib/strategies';
import { getContentTypeCookie, getAnimeFiltersCookie, getMovieFiltersCookie, getTVSeriesFiltersCookie } from '@/lib/utils/cookies-server';

/**
 * Get filters for the specified content type from cookies
 */
async function getFiltersForContentType(type: ContentType): Promise<Record<string, unknown>> {
  switch (type) {
    case 'movie':
      return await getMovieFiltersCookie();
    case 'tv':
      return await getTVSeriesFiltersCookie();
    case 'anime':
    default:
      return await getAnimeFiltersCookie();
  }
}

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
    // Get strategy for content type
    const strategy = ContentStrategyFactory.getStrategy(type);
    
    // Read filters from cookies
    const filters = await getFiltersForContentType(type);
    
    // Get random content using strategy
    const content = await strategy.getRandomContent(filters);
    
    return {
      ...content,
      contentType: type,
    };
  } catch (error) {
    console.error(`Error fetching random ${type}:`, error);
    throw new Error(`Failed to fetch content. Please try again.`);
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
    // Get strategy for content type
    const strategy = ContentStrategyFactory.getStrategy(type);
    
    // Read filters from cookies
    const filters = await getFiltersForContentType(type);
    
    // Search content using strategy (already includes contentType)
    return await strategy.searchContent(query, filters);
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
  
  // Otherwise check by name using strategy (for manual input)
  const strategy = ContentStrategyFactory.getStrategy(contentType);
  return strategy.checkAnswer(userAnswer, correctName, correctSecondaryName);
}
