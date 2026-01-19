// API layer для работы с Shikimori API
import { ShikimoriAnime, ShikimoriScreenshot, AnimeSearchResult, GameAnime } from '@/lib/types/anime';
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

async function rateLimitedFetch(url: string): Promise<Response> {
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
      next: { revalidate: GAME_CONFIG.CACHE_DURATION },
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

export async function getRandomAnime(): Promise<GameAnime> {
  try {
    // Получаем случайную страницу из топ аниме
    const page = Math.floor(Math.random() * GAME_CONFIG.ANIME_PAGES) + 1;
    const limit = GAME_CONFIG.ANIME_PER_PAGE;
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...SHIKIMORI_CONFIG.DEFAULT_PARAMS,
    });
    
    const url = `${SHIKIMORI_CONFIG.BASE_URL}/animes?${params}`;
    
    const response = await rateLimitedFetch(url);
    const animes: ShikimoriAnime[] = await response.json();
    
    if (animes.length === 0) {
      throw new APIError('No anime found', 404);
    }
    
    // Выбираем случайное аниме из списка
    const randomAnime = animes[Math.floor(Math.random() * animes.length)];
    
    // Получаем скриншоты для этого аниме
    const screenshotsUrl = `${SHIKIMORI_CONFIG.BASE_URL}/animes/${randomAnime.id}/screenshots`;
    const screenshotsResponse = await rateLimitedFetch(screenshotsUrl);
    const screenshots: ShikimoriScreenshot[] = await screenshotsResponse.json();
    
    return {
      id: randomAnime.id,
      name: randomAnime.name,
      russian: randomAnime.russian,
      image: getFullImageUrl(randomAnime.image.original),
      screenshots: screenshots.map(s => getFullImageUrl(s.original)),
      url: `https://shikimori.one${randomAnime.url}`,
    };
  } catch (error) {
    throw handleAPIError(error);
  }
}

export async function searchAnime(query: string): Promise<AnimeSearchResult[]> {
  if (!query || query.trim().length < GAME_CONFIG.SEARCH_MIN_LENGTH) {
    return [];
  }
  
  try {
    const params = new URLSearchParams({
      search: query,
      limit: GAME_CONFIG.MAX_SUGGESTIONS.toString(),
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
