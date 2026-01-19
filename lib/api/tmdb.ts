// API layer для работы с TMDB API
import { APIError, RateLimitError, handleAPIError } from '@/lib/utils/errors';

// Типы TMDB
export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
}

export interface TMDBImageResponse {
  id: number;
  backdrops: TMDBImage[];
  posters: TMDBImage[];
}

export interface TMDBImage {
  file_path: string;
  width: number;
  height: number;
  vote_average: number;
  vote_count: number;
}

export interface TMDBDiscoverResponse {
  page: number;
  results: TMDBTVShow[];
  total_pages: number;
  total_results: number;
}

// Конфигурация TMDB
const TMDB_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY || '',
  IMAGE_SIZE: {
    BACKDROP: 'original',
    POSTER: 'w500',
  },
} as const;

// Проверка наличия API ключа
if (!TMDB_CONFIG.API_KEY) {
  console.warn('TMDB API key is not set. Please set NEXT_PUBLIC_TMDB_API_KEY environment variable.');
}

// Кеширование на уровне модуля для rate limiting
let lastRequestTime = 0;
const RATE_LIMIT_MS = 250; // TMDB имеет лимит 40 запросов в секунду

/**
 * Формирует полный URL для изображения TMDB
 */
function getFullImageUrl(path: string | null, size: string = TMDB_CONFIG.IMAGE_SIZE.BACKDROP): string {
  if (!path) return '';
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
}

async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function rateLimitedFetch(url: string, useCache = true): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await wait(RATE_LIMIT_MS - timeSinceLastRequest);
  }
  
  lastRequestTime = Date.now();
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TMDB_CONFIG.API_KEY}`,
        'Accept': 'application/json',
      },
      ...(useCache 
        ? { next: { revalidate: 3600 } }
        : { cache: 'no-store' as RequestCache }
      ),
    });
    
    if (response.status === 429) {
      throw new RateLimitError();
    }
    
    if (!response.ok) {
      throw new APIError(`TMDB API error: ${response.status}`, response.status);
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
 * Получает случайный сериал с достаточным количеством изображений
 */
export async function getRandomTVShow(): Promise<{
  id: number;
  name: string;
  originalName: string;
  image: string;
  screenshots: string[];
  url: string;
}> {
  const MIN_SCREENSHOTS = 6;
  const MAX_RETRIES = 10;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Получаем случайную страницу из популярных сериалов
      // TMDB discover может вернуть до 500 страниц
      const randomPage = Math.floor(Math.random() * 100) + 1; // Первые 100 страниц для лучших результатов
      
      const params = new URLSearchParams({
        page: randomPage.toString(),
        sort_by: 'popularity.desc',
        'vote_count.gte': '100', // Минимум 100 голосов для качества
      });
      
      const discoverUrl = `${TMDB_CONFIG.BASE_URL}/discover/tv?${params}`;
      const response = await rateLimitedFetch(discoverUrl, false);
      const data: TMDBDiscoverResponse = await response.json();
      
      if (data.results.length === 0) {
        throw new APIError('No TV shows found', 404);
      }
      
      // Перемешиваем результаты и проверяем каждый
      const shuffledResults = shuffleArray(data.results);
      
      for (const show of shuffledResults) {
        try {
          // Получаем изображения для этого сериала
          const imagesUrl = `${TMDB_CONFIG.BASE_URL}/tv/${show.id}/images`;
          const imagesResponse = await rateLimitedFetch(imagesUrl);
          const imagesData: TMDBImageResponse = await imagesResponse.json();
          
          // Используем backdrops (горизонтальные изображения) как скриншоты
          const backdrops = imagesData.backdrops || [];
          
          if (backdrops.length >= MIN_SCREENSHOTS) {
            // Нашли подходящий сериал!
            const imageUrls = backdrops
              .slice(0, MIN_SCREENSHOTS * 2) // Берем больше для лучшего выбора
              .map(img => getFullImageUrl(img.file_path))
              .filter(url => url); // Убираем пустые URL
            
            if (imageUrls.length >= MIN_SCREENSHOTS) {
              const shuffledScreenshots = shuffleArray(imageUrls).slice(0, MIN_SCREENSHOTS);
              const posterUrl = getFullImageUrl(show.poster_path, TMDB_CONFIG.IMAGE_SIZE.POSTER);
              
              return {
                id: show.id,
                name: show.name,
                originalName: show.original_name,
                image: posterUrl || shuffledScreenshots[0], // Fallback на первый backdrop
                screenshots: shuffledScreenshots,
                url: `https://www.themoviedb.org/tv/${show.id}`,
              };
            }
          }
          
          console.log(`TV show ${show.id} has only ${backdrops.length} backdrops, checking next...`);
        } catch (error) {
          console.error(`Error fetching images for TV show ${show.id}:`, error);
          continue;
        }
      }
      
      console.log(`No suitable TV show in batch ${attempt + 1}/${MAX_RETRIES}, retrying...`);
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        throw handleAPIError(error);
      }
      console.error(`Error fetching TV show batch (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
    }
  }
  
  throw new APIError('Failed to find TV show with enough images', 404);
}

/**
 * Поиск сериалов по запросу
 */
export async function searchTVShows(query: string): Promise<Array<{
  id: number;
  name: string;
  originalName: string;
  image: string;
}>> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  try {
    const params = new URLSearchParams({
      query: query.trim(),
      page: '1',
    });
    
    const url = `${TMDB_CONFIG.BASE_URL}/search/tv?${params}`;
    const response = await rateLimitedFetch(url);
    const data: TMDBDiscoverResponse = await response.json();
    
    return data.results.slice(0, 10).map(show => ({
      id: show.id,
      name: show.name,
      originalName: show.original_name,
      image: getFullImageUrl(show.poster_path, TMDB_CONFIG.IMAGE_SIZE.POSTER),
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

/**
 * Проверка ответа для сериала
 */
export function checkTVShowAnswer(userAnswer: string, correctName: string, correctOriginalName: string): boolean {
  const normalizedAnswer = userAnswer.toLowerCase().trim();
  const normalizedName = correctName.toLowerCase().trim();
  const normalizedOriginalName = correctOriginalName.toLowerCase().trim();
  
  // Проверяем полное совпадение
  if (normalizedAnswer === normalizedName || normalizedAnswer === normalizedOriginalName) {
    return true;
  }
  
  // Проверяем частичное совпадение (70% длины)
  const minMatchLength = Math.floor(
    Math.min(normalizedName.length, normalizedOriginalName.length) * 0.7
  );
  
  if (normalizedAnswer.length >= minMatchLength) {
    if (normalizedName.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedName)) {
      return true;
    }
    if (normalizedOriginalName.includes(normalizedAnswer) || normalizedAnswer.includes(normalizedOriginalName)) {
      return true;
    }
  }
  
  return false;
}
