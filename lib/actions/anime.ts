'use server';

// Server Actions для игры
import { getRandomAnime, searchAnime, checkAnswer } from '@/lib/api/shikimori';
import { GameAnime, AnimeSearchResult, AnimeFilters } from '@/lib/types/anime';

export async function fetchRandomAnime(filters?: AnimeFilters): Promise<GameAnime> {
  try {
    const anime = await getRandomAnime(filters);
    return anime;
  } catch (error) {
    console.error('Error fetching random anime:', error);
    throw new Error('Failed to fetch anime. Please try again.');
  }
}

export async function fetchAnimeSuggestions(query: string): Promise<AnimeSearchResult[]> {
  try {
    const results = await searchAnime(query);
    return results;
  } catch (error) {
    console.error('Error searching anime:', error);
    return [];
  }
}

export async function verifyAnswer(
  userAnswer: string,
  correctId: number,
  correctName: string,
  correctRussian: string,
  userAnswerId?: number
): Promise<boolean> {
  // Если есть ID из suggestions - проверяем напрямую (100% точность)
  if (userAnswerId !== undefined) {
    return userAnswerId === correctId;
  }
  
  // Иначе проверяем по названию (для ручного ввода)
  return checkAnswer(userAnswer, correctName, correctRussian);
}
