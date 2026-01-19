// API layer для работы с Shikimori API
import { ShikimoriAnime, ShikimoriScreenshot, AnimeSearchResult, GameAnime, AnimeFilters } from '@/lib/types/anime';
import { GAME_CONFIG, SHIKIMORI_CONFIG } from '@/lib/constants/game';
import { APIError, RateLimitError, handleAPIError } from '@/lib/utils/errors';

// Кеширование на уровне модуля для rate limiting
let lastRequestTime = 0;

/**
 * Формирует полный URL для изображения (API может возвращать относительные пути)
 */
function getFullImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) {
    return url;
  }
  return `https://shikimori.one${url}`;
}

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function rateLimitedFetch(url: string, useCache = true): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < GAME_CONFIG.RATE_LIMIT_MS) {
    await wait(GAME_CONFIG.RATE_LIMIT_MS - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': SHIKIMORI_CONFIG.USER_AGENT,
      },
      ...(useCache 
        ? { next: { revalidate: GAME_CONFIG.CACHE_DURATION } }
        : { cache: 'no-store' as RequestCache }
      ),
    });
    
    if (response.status === 429) {
      throw new RateLimitError();
    }
    
    if (!response.ok) {
      throw new APIError(`Shikimori API error: ${response.status}`, response.status);
    }
    
    return response;
  } catch (error) {
    throw handleAPIError(error);
  }
}

// Функция для перемешивания массива (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Создает параметры запроса на основе фильтров
 */
function buildFilterParams(filters?: AnimeFilters): Record<string, string> {
  const params: Record<string, string> = {};
  
  if (!filters) return params;
  
  // Добавляем фильтры, если они заданы
  if (filters.kind && filters.kind.length > 0) {
    params.kind = filters.kind.join(',');
  }
  
  if (filters.status && filters.status.length > 0) {
    params.status = filters.status.join(',');
  }
  
  if (filters.season) {
    params.season = filters.season;
  }
  
  if (filters.score !== undefined && filters.score > 0) {
    params.score = filters.score.toString();
  }
  
  if (filters.duration) {
    params.duration = filters.duration;
  }
  
  if (filters.rating && filters.rating.length > 0) {
    params.rating = filters.rating.join(',');
  }
  
  if (filters.genre && filters.genre.length > 0) {
    params.genre = filters.genre.join(',');
  }
  
  return params;
}

export async function getRandomAnime(filters?: AnimeFilters): Promise<GameAnime> {
  const MIN_SCREENSHOTS = 6;
  const MAX_RETRIES = 10;
  const BATCH_SIZE = 5;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Получаем сразу 5 случайных аниме
      const filterParams = buildFilterParams(filters);
      const params = new URLSearchParams({
        order: 'random',
        limit: BATCH_SIZE.toString(),
        ...filterParams,
      });
      
      const url = `${SHIKIMORI_CONFIG.BASE_URL}/animes?${params}`;
      
      // Отключаем кеширование для random запросов
      const response = await rateLimitedFetch(url, false);
      const animes: ShikimoriAnime[] = await response.json();
      
      if (animes.length === 0) {
        throw new APIError('No anime found', 404);
      }
      
      // Проверяем каждое аниме по очереди
      for (const anime of animes) {
        try {
          // Получаем скриншоты для этого аниме
          const screenshotsUrl = `${SHIKIMORI_CONFIG.BASE_URL}/animes/${anime.id}/screenshots`;
          const screenshotsResponse = await rateLimitedFetch(screenshotsUrl);
          const screenshots: ShikimoriScreenshot[] = await screenshotsResponse.json();
          
          // Проверяем, достаточно ли скриншотов
          if (screenshots.length >= MIN_SCREENSHOTS) {
            // Нашли подходящее аниме!
            const imageUrls = screenshots.map(s => getFullImageUrl(s.original));
            const shuffledScreenshots = shuffleArray(imageUrls);
            
            return {
              id: anime.id,
              name: anime.name,
              russian: anime.russian,
              image: getFullImageUrl(anime.image.original),
              screenshots: shuffledScreenshots,
              url: `https://shikimori.one${anime.url}`,
            };
          }
          
          console.log(`Anime ${anime.id} has only ${screenshots.length} screenshots, checking next...`);
        } catch (error) {
          // Если ошибка при получении скриншотов конкретного аниме, пробуем следующее
          console.error(`Error fetching screenshots for anime ${anime.id}:`, error);
          continue;
        }
      }
      
      // Если ни одно из 5 аниме не подошло, пробуем новую партию
      console.log(`No suitable anime in batch ${attempt + 1}/${MAX_RETRIES}, retrying...`);
    } catch (error) {
      // Если это последняя попытка, пробрасываем ошибку
      if (attempt === MAX_RETRIES - 1) {
        throw handleAPIError(error);
      }
      // Иначе продолжаем попытки
      console.error(`Error fetching anime batch (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
    }
  }
  
  // Если все попытки исчерпаны
  throw new APIError('Failed to find anime with enough screenshots', 404);
}

export async function searchAnime(query: string, filters?: AnimeFilters): Promise<AnimeSearchResult[]> {
  if (!query || query.trim().length < GAME_CONFIG.SEARCH_MIN_LENGTH) {
    return [];
  }
  
  try {
    const filterParams = buildFilterParams(filters);
    const params = new URLSearchParams({
      search: query,
      limit: GAME_CONFIG.MAX_SUGGESTIONS.toString(),
      order: 'popularity',
      ...filterParams,
    });
    
    const url = `${SHIKIMORI_CONFIG.BASE_URL}/animes?${params}`;
    
    const response = await rateLimitedFetch(url);
    const animes: ShikimoriAnime[] = await response.json();
    
    return animes.map(anime => ({
      id: anime.id,
      name: anime.name,
      russian: anime.russian,
      image: getFullImageUrl(anime.image.preview),
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export function checkAnswer(userAnswer: string, correctName: string, correctRussian: string): boolean {
  const normalizedAnswer = userAnswer.toLowerCase().trim();
  const normalizedName = correctName.toLowerCase().trim();
  const normalizedRussian = correctRussian.toLowerCase().trim();
  
  // Проверяем полное совпадение
  if (normalizedAnswer === normalizedName || normalizedAnswer === normalizedRussian) {
    return true;
  }
  
  // Проверяем частичное совпадение
  const minMatchLength = Math.floor(
    Math.min(normalizedName.length, normalizedRussian.length) * GAME_CONFIG.MATCH_THRESHOLD
  );
  
  if (normalizedAnswer.length >= minMatchLength) {
    if (normalizedName.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedName)) {
      return true;
    }
    if (normalizedRussian.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedRussian)) {
      return true;
    }
  }
  
  return false;
}
