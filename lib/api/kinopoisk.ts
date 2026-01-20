// API layer for working with Kinopoisk Unofficial API
import { APIError, RateLimitError, handleAPIError } from '@/lib/utils/errors';
import { SearchResult } from '@/lib/types/game';

// Kinopoisk types
export interface KinopoiskFilm {
  kinopoiskId: number;
  imdbId: string | null;
  nameRu: string | null;
  nameEn: string | null;
  nameOriginal: string | null;
  posterUrl: string;
  posterUrlPreview: string;
  coverUrl: string | null;
  logoUrl: string | null;
  reviewsCount: number;
  ratingKinopoisk: number | null;
  ratingKinopoiskVoteCount: number | null;
  ratingImdb: number | null;
  ratingImdbVoteCount: number | null;
  webUrl: string;
  year: number | null;
  filmLength: number | null;
  slogan: string | null;
  description: string | null;
  shortDescription: string | null;
  type: 'FILM' | 'VIDEO' | 'TV_SERIES' | 'MINI_SERIES' | 'TV_SHOW';
  ratingMpaa: string | null;
  ratingAgeLimits: string | null;
  countries: Array<{ country: string }>;
  genres: Array<{ genre: string }>;
  startYear: number | null;
  endYear: number | null;
  serial: boolean | null;
  shortFilm: boolean | null;
  completed: boolean | null;
}

export interface KinopoiskFilmSearchItem {
  kinopoiskId: number;
  imdbId: string | null;
  nameRu: string | null;
  nameEn: string | null;
  nameOriginal: string | null;
  countries: Array<{ country: string }>;
  genres: Array<{ genre: string }>;
  ratingKinopoisk: number | null;
  ratingImdb: number | null;
  year: number | null;
  type: 'FILM' | 'TV_SHOW' | 'VIDEO' | 'MINI_SERIES' | 'TV_SERIES' | 'UNKNOWN';
  posterUrl: string;
  posterUrlPreview: string;
}

export interface KinopoiskImage {
  imageUrl: string;
  previewUrl: string;
}

export interface KinopoiskImagesResponse {
  total: number;
  totalPages: number;
  items: KinopoiskImage[];
}

export interface KinopoiskFilmSearchResponse {
  total: number;
  totalPages: number;
  items: KinopoiskFilmSearchItem[];
}

export interface KinopoiskGenre {
  id: number;
  genre: string;
}

export interface KinopoiskCountry {
  id: number;
  country: string;
}

export interface KinopoiskFiltersResponse {
  genres: KinopoiskGenre[];
  countries: KinopoiskCountry[];
}

// Filters for movies/TV series
export interface KinopoiskFilters {
  genres?: number[];
  countries?: number[];
  order?: 'RATING' | 'NUM_VOTE' | 'YEAR';
  type?: 'FILM' | 'TV_SHOW' | 'TV_SERIES' | 'MINI_SERIES' | 'ALL';
  ratingFrom?: number;
  ratingTo?: number;
  yearFrom?: number;
  yearTo?: number;
  keyword?: string;
}

// Kinopoisk config
const KINOPOISK_CONFIG = {
  BASE_URL: 'https://kinopoiskapiunofficial.tech',
  API_KEY: process.env.NEXT_PUBLIC_KINOPOISK_API_KEY || '',
} as const;

// Check if API key is set
if (!KINOPOISK_CONFIG.API_KEY) {
  console.warn('Kinopoisk API key is not set. Please set NEXT_PUBLIC_KINOPOISK_API_KEY environment variable.');
}

// Module-level caching for rate limiting
let lastRequestTime = 0;
const RATE_LIMIT_MS = 50; // Kinopoisk has rate limit of 20 req/sec

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
        'X-API-KEY': KINOPOISK_CONFIG.API_KEY,
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
    
    if (response.status === 401) {
      throw new APIError('Invalid Kinopoisk API key', 401);
    }
    
    if (response.status === 404) {
      throw new APIError('Content not found', 404);
    }
    
    if (!response.ok) {
      throw new APIError(`Kinopoisk API error: ${response.status}`, response.status);
    }
    
    return response;
  } catch (error) {
    throw handleAPIError(error);
  }
}

// Shuffle array function (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Build query parameters based on filters
 */
function buildFilterParams(filters?: KinopoiskFilters): Record<string, string> {
  const params: Record<string, string> = {};
  
  if (!filters) return params;
  
  // Genres (only one genre supported)
  if (filters.genres && filters.genres.length > 0) {
    params.genres = filters.genres[0].toString();
  }
  
  // Countries (only one country supported)
  if (filters.countries && filters.countries.length > 0) {
    params.countries = filters.countries[0].toString();
  }
  
  // Order/sort
  if (filters.order) {
    params.order = filters.order;
  } else {
    params.order = 'RATING';
  }
  
  // Type
  if (filters.type && filters.type !== 'ALL') {
    params.type = filters.type;
  }
  
  // Rating filters
  if (filters.ratingFrom !== undefined) {
    params.ratingFrom = filters.ratingFrom.toString();
  }
  
  if (filters.ratingTo !== undefined) {
    params.ratingTo = filters.ratingTo.toString();
  }
  
  // Year filters
  if (filters.yearFrom !== undefined) {
    params.yearFrom = filters.yearFrom.toString();
  }
  
  if (filters.yearTo !== undefined) {
    params.yearTo = filters.yearTo.toString();
  }
  
  // Keyword
  if (filters.keyword) {
    params.keyword = filters.keyword;
  }
  
  return params;
}

/**
 * Convert UI filters to Kinopoisk API filters
 */
export function normalizeFilters(filters: Record<string, unknown>, contentType: 'movie' | 'tv' = 'movie'): KinopoiskFilters {
  const normalized: KinopoiskFilters = {};
  
  // Set type based on content type
  if (contentType === 'movie') {
    normalized.type = 'FILM';
  } else {
    normalized.type = 'TV_SERIES';
  }
  
  // Allow override if ALL is specified
  if (filters.type === 'ALL') {
    normalized.type = 'ALL';
  }
  
  // Handle countries - convert to number array
  if (filters.countries && Array.isArray(filters.countries)) {
    normalized.countries = filters.countries.map((c: unknown) => Number(c));
  }
  
  // Handle genres - convert to number array
  if (filters.genres && Array.isArray(filters.genres)) {
    normalized.genres = filters.genres.map((g: unknown) => Number(g));
  }
  
  // Handle rating filters
  if (filters.ratingFrom !== undefined) {
    normalized.ratingFrom = Number(filters.ratingFrom);
  }
  
  if (filters.ratingTo !== undefined) {
    normalized.ratingTo = Number(filters.ratingTo);
  }
  
  // Handle year filters
  if (filters.yearFrom !== undefined) {
    normalized.yearFrom = Number(filters.yearFrom);
  }
  
  if (filters.yearTo !== undefined) {
    normalized.yearTo = Number(filters.yearTo);
  }
  
  // Handle keyword
  if (filters.keyword && typeof filters.keyword === 'string') {
    normalized.keyword = filters.keyword;
  }
  
  return normalized;
}

/**
 * Get list of available genres and countries
 */
export async function getAvailableFilters(): Promise<KinopoiskFiltersResponse> {
  try {
    const url = `${KINOPOISK_CONFIG.BASE_URL}/api/v2.2/films/filters`;
    const response = await rateLimitedFetch(url, true);
    const data: KinopoiskFiltersResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching filters:', error);
    return { genres: [], countries: [] };
  }
}

/**
 * Get list of available genres
 */
export async function getAvailableGenres(): Promise<KinopoiskGenre[]> {
  try {
    const filters = await getAvailableFilters();
    return filters.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

/**
 * Get list of available countries
 */
export async function getAvailableCountries(): Promise<KinopoiskCountry[]> {
  try {
    const filters = await getAvailableFilters();
    return filters.countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

/**
 * Get images (stills/screenshots) for a film
 */
async function getImages(id: number, type: 'STILL' | 'POSTER' = 'STILL'): Promise<string[]> {
  try {
    const url = `${KINOPOISK_CONFIG.BASE_URL}/api/v2.2/films/${id}/images?type=${type}&page=1`;
    const response = await rateLimitedFetch(url);
    const data: KinopoiskImagesResponse = await response.json();
    
    // Return image URLs
    return data.items
      .map(img => img.imageUrl)
      .filter(url => url); // Remove empty URLs
  } catch (error) {
    console.error(`Error fetching images for film ${id}:`, error);
    return [];
  }
}

/**
 * Get random film/TV series with enough screenshots
 */
export async function getRandomContent(
  contentType: 'movie' | 'tv' = 'movie',
  filters?: KinopoiskFilters
): Promise<{
  id: number;
  name: string;
  secondaryName: string;
  image: string;
  screenshots: string[];
  url: string;
}> {
  const MIN_SCREENSHOTS = 6;
  const MAX_RETRIES = 10;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Random page (Kinopoisk has max 5 pages per query, max 100 films)
      const randomPage = Math.floor(Math.random() * 5) + 1;
      
      // Merge filters with type based on contentType
      const contentFilters: KinopoiskFilters = {
        ...filters,
        type: contentType === 'movie' ? 'FILM' : 'TV_SERIES',
      };
      
      const filterParams = buildFilterParams(contentFilters);
      const params = new URLSearchParams({
        ...filterParams,
        page: randomPage.toString(),
      });
      
      const discoverUrl = `${KINOPOISK_CONFIG.BASE_URL}/api/v2.2/films?${params}`;
      const response = await rateLimitedFetch(discoverUrl, false);
      const data: KinopoiskFilmSearchResponse = await response.json();
      
      if (data.items.length === 0) {
        throw new APIError('No content found', 404);
      }
      
      // Shuffle results and check each
      const shuffledResults = shuffleArray(data.items);
      
      for (const item of shuffledResults) {
        try {
          const images = await getImages(item.kinopoiskId);
          
          if (images.length >= MIN_SCREENSHOTS) {
            const shuffledScreenshots = shuffleArray(images).slice(0, MIN_SCREENSHOTS);
            
            const name = item.nameRu || item.nameEn || item.nameOriginal || 'Unknown';
            const originalName = item.nameOriginal || item.nameEn || item.nameRu || 'Unknown';
            const image = item.posterUrl || shuffledScreenshots[0];
            
            return {
              id: item.kinopoiskId,
              name: name,
              secondaryName: originalName,
              image: image,
              screenshots: shuffledScreenshots,
              url: `https://www.kinopoisk.ru/film/${item.kinopoiskId}/`,
            };
          }
          
          console.log(`Film ${item.kinopoiskId} has only ${images.length} images, checking next...`);
        } catch (error) {
          console.error(`Error fetching images for film ${item.kinopoiskId}:`, error);
          continue;
        }
      }
      
      console.log(`No suitable content in batch ${attempt + 1}/${MAX_RETRIES}, retrying...`);
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        throw handleAPIError(error);
      }
      console.error(`Error fetching content batch (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
    }
  }
  
  throw new APIError('Failed to find content with enough images', 404);
}

/**
 * Search films/TV series by query
 */
export async function searchContent(
  query: string,
  contentType: 'movie' | 'tv' = 'movie',
  filters?: KinopoiskFilters
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  try {
    // Merge filters with keyword and set type based on contentType
    const searchFilters: KinopoiskFilters = {
      ...filters,
      keyword: query.trim(),
      type: contentType === 'movie' ? 'FILM' : 'TV_SERIES',
    };
    
    // Build filter params using the same function as getRandomContent
    const filterParams = buildFilterParams(searchFilters);
    const params = new URLSearchParams({
      ...filterParams,
      page: '1',
    });
    
    // Use /api/v2.2/films which supports both keyword and filters
    const url = `${KINOPOISK_CONFIG.BASE_URL}/api/v2.2/films?${params}`;
    const response = await rateLimitedFetch(url);
    const data: KinopoiskFilmSearchResponse = await response.json();
    
    const results = data.items || [];
    
    return results.slice(0, 10).map(item => {
      const name = item.nameRu || item.nameEn || item.nameOriginal || 'Unknown';
      const originalName = item.nameOriginal || item.nameEn || item.nameRu || 'Unknown';
      
      return {
        id: item.kinopoiskId,
        name: name,
        secondaryName: originalName,
        image: item.posterUrlPreview || item.posterUrl || '',
        contentType: contentType,
      };
    });
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

/**
 * Check answer for film/TV series
 */
export function checkAnswer(userAnswer: string, correctName: string, correctOriginalName: string): boolean {
  const normalizedAnswer = userAnswer.toLowerCase().trim();
  const normalizedName = correctName.toLowerCase().trim();
  const normalizedOriginalName = correctOriginalName.toLowerCase().trim();
  
  // Check exact match
  if (normalizedAnswer === normalizedName || normalizedAnswer === normalizedOriginalName) {
    return true;
  }
  
  // Check partial match (70% of length)
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
