'use server';

// Server Actions для игры
import { getRandomAnime, searchAnime, checkAnswer } from '@/lib/api/shikimori';
import { getRandomTVShow, searchTVShows, checkTVShowAnswer } from '@/lib/api/tmdb';
import { GameAnime, SearchResult, AnimeFilters, ContentType } from '@/lib/types/anime';

export async function fetchRandomContent(contentType: ContentType, filters?: AnimeFilters): Promise<GameAnime> {
  try {
    if (contentType === 'tv') {
      const tvShow = await getRandomTVShow();
      return {
        id: tvShow.id,
        name: tvShow.name,
        russian: tvShow.originalName, // используем originalName как вторичное имя
        image: tvShow.image,
        screenshots: tvShow.screenshots,
        url: tvShow.url,
        contentType: 'tv',
      };
    } else {
      const anime = await getRandomAnime(filters);
      return {
        ...anime,
        contentType: 'anime',
      };
    }
  } catch (error) {
    console.error(`Error fetching random ${contentType}:`, error);
    throw new Error(`Failed to fetch ${contentType === 'tv' ? 'TV show' : 'anime'}. Please try again.`);
  }
}

// Совместимость с существующим кодом
export async function fetchRandomAnime(filters?: AnimeFilters): Promise<GameAnime> {
  return fetchRandomContent('anime', filters);
}

export async function fetchContentSuggestions(
  query: string,
  contentType: ContentType,
  filters?: AnimeFilters
): Promise<SearchResult[]> {
  try {
    if (contentType === 'tv') {
      const results = await searchTVShows(query);
      return results.map(show => ({
        id: show.id,
        name: show.name,
        secondaryName: show.originalName,
        image: show.image,
        contentType: 'tv' as ContentType,
      }));
    } else {
      const results = await searchAnime(query, filters);
      return results.map(anime => ({
        id: anime.id,
        name: anime.name,
        secondaryName: anime.russian,
        image: anime.image,
        contentType: 'anime' as ContentType,
      }));
    }
  } catch (error) {
    console.error(`Error searching ${contentType}:`, error);
    return [];
  }
}

// Совместимость с существующим кодом
export async function fetchAnimeSuggestions(query: string, filters?: AnimeFilters): Promise<SearchResult[]> {
  return fetchContentSuggestions(query, 'anime', filters);
}

export async function verifyAnswer(
  userAnswer: string,
  correctId: number,
  correctName: string,
  correctSecondaryName: string,
  userAnswerId?: number,
  contentType: ContentType = 'anime'
): Promise<boolean> {
  // Если есть ID из suggestions - проверяем напрямую (100% точность)
  if (userAnswerId !== undefined) {
    return userAnswerId === correctId;
  }
  
  // Иначе проверяем по названию (для ручного ввода)
  if (contentType === 'tv') {
    return checkTVShowAnswer(userAnswer, correctName, correctSecondaryName);
  } else {
    return checkAnswer(userAnswer, correctName, correctSecondaryName);
  }
}
