// API layer for working with TMDB (The Movie Database) API
import { APIError, RateLimitError, handleAPIError } from '@/lib/utils/errors';

// TMDB types
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  overview: string;
  original_language: string;
  popularity: number;
}

export interface TMDBTVSeries {
  id: number;
  name: string;
  original_name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  overview: string;
  original_language: string;
  popularity: number;
  origin_country: string[];
}

export interface TMDBImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface TMDBImagesResponse {
  id: number;
  backdrops: TMDBImage[];
  logos: TMDBImage[];
  posters: TMDBImage[];
}

export interface TMDBDiscoverResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenresResponse {
  genres: TMDBGenre[];
}

// Filters for movies/TV series - matches TMDB API specification
export interface TMDBFilters {
  with_genres?: number[]; // Genre IDs (comma separated in API)
  with_origin_country?: string; // ISO 3166-1 code
  'vote_average.gte'?: number; // 0-10
  'vote_average.lte'?: number; // 0-10
  'primary_release_date.gte'?: string; // YYYY-MM-DD for movies
  'primary_release_date.lte'?: string; // YYYY-MM-DD for movies
  'first_air_date.gte'?: string; // YYYY-MM-DD for TV
  'first_air_date.lte'?: string; // YYYY-MM-DD for TV
  sort_by?: 'popularity.desc' | 'popularity.asc' | 'vote_average.desc' | 'vote_average.asc' | 'primary_release_date.desc' | 'primary_release_date.asc';
  with_original_language?: string; // ISO 639-1 code
}

// TMDB config
const TMDB_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY || '',
} as const;

// Check if API key is set
if (!TMDB_CONFIG.API_KEY) {
  console.warn('TMDB API key is not set. Please set NEXT_PUBLIC_TMDB_API_KEY environment variable.');
}

// Module-level caching for rate limiting
let lastRequestTime = 0;
const RATE_LIMIT_MS = 50; // TMDB has rate limit of ~40 requests per 10 seconds

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
    
    if (response.status === 401) {
      throw new APIError('Invalid TMDB API key', 401);
    }
    
    if (!response.ok) {
      throw new APIError(`TMDB API error: ${response.status}`, response.status);
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
 * Get full image URL from TMDB path
 */
export function getImageUrl(path: string | null, size: 'original' | 'w500' | 'w300' = 'original'): string {
  if (!path) return '';
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Build query parameters based on filters
 */
function buildFilterParams(filters?: TMDBFilters, contentType: 'movie' | 'tv' = 'movie'): Record<string, string> {
  const params: Record<string, string> = {
    language: 'en-US',
    include_adult: 'false',
    include_video: 'false',
  };
  
  if (!filters) return params;
  
  // Genres
  if (filters.with_genres && filters.with_genres.length > 0) {
    params.with_genres = filters.with_genres.join(',');
  }
  
  // Country (for TMDB, this should be a single country code string, not an array)
  if (filters.with_origin_country) {
    params.with_origin_country = filters.with_origin_country;
  }
  
  // Rating filters
  if (filters['vote_average.gte'] !== undefined) {
    params['vote_average.gte'] = filters['vote_average.gte'].toString();
  }
  
  if (filters['vote_average.lte'] !== undefined) {
    params['vote_average.lte'] = filters['vote_average.lte'].toString();
  }
  
  // Date filters (already in correct format from normalizeFilters)
  if (contentType === 'movie') {
    if (filters['primary_release_date.gte']) {
      params['primary_release_date.gte'] = filters['primary_release_date.gte'];
    }
    if (filters['primary_release_date.lte']) {
      params['primary_release_date.lte'] = filters['primary_release_date.lte'];
    }
  } else {
    if (filters['first_air_date.gte']) {
      params['first_air_date.gte'] = filters['first_air_date.gte'];
    }
    if (filters['first_air_date.lte']) {
      params['first_air_date.lte'] = filters['first_air_date.lte'];
    }
  }
  
  // Sort by
  if (filters.sort_by) {
    params.sort_by = filters.sort_by;
  } else {
    params.sort_by = 'vote_average.desc';
    params['vote_count.gte'] = '100'; // Ensure quality content with enough votes
  }
  
  // Language filter
  if (filters.with_original_language) {
    params.with_original_language = filters.with_original_language;
  }
  
  return params;
}

/**
 * Convert UI filters to TMDB API filters
 * Now filters use strict TMDB API field names, so minimal conversion needed
 */
export function normalizeFilters(filters: Record<string, unknown>, contentType: 'movie' | 'tv' = 'movie'): TMDBFilters {
  const normalized: TMDBFilters = {};
  
  // Handle with_origin_country - UI sends array but TMDB expects single string
  if (filters.with_origin_country && Array.isArray(filters.with_origin_country) && filters.with_origin_country.length > 0) {
    normalized.with_origin_country = String(filters.with_origin_country[0]);
  } else if (typeof filters.with_origin_country === 'string') {
    normalized.with_origin_country = filters.with_origin_country;
  }
  
  // Handle with_genres - convert to number array
  if (filters.with_genres && Array.isArray(filters.with_genres)) {
    normalized.with_genres = filters.with_genres.map((g: unknown) => Number(g));
  }
  
  // Handle vote_average.gte
  if (filters['vote_average.gte'] !== undefined) {
    normalized['vote_average.gte'] = Number(filters['vote_average.gte']);
  }
  
  // Handle vote_average.lte
  if (filters['vote_average.lte'] !== undefined) {
    normalized['vote_average.lte'] = Number(filters['vote_average.lte']);
  }
  
  // Handle date fields - pass through as-is (already in correct format)
  if (contentType === 'movie') {
    if (filters['primary_release_date.gte']) {
      normalized['primary_release_date.gte'] = String(filters['primary_release_date.gte']);
    }
    if (filters['primary_release_date.lte']) {
      normalized['primary_release_date.lte'] = String(filters['primary_release_date.lte']);
    }
  } else {
    if (filters['first_air_date.gte']) {
      normalized['first_air_date.gte'] = String(filters['first_air_date.gte']);
    }
    if (filters['first_air_date.lte']) {
      normalized['first_air_date.lte'] = String(filters['first_air_date.lte']);
    }
  }
  
  // Handle sort_by
  if (filters.sort_by && typeof filters.sort_by === 'string') {
    normalized.sort_by = filters.sort_by as TMDBFilters['sort_by'];
  }
  
  // Handle with_original_language
  if (filters.with_original_language && typeof filters.with_original_language === 'string') {
    normalized.with_original_language = filters.with_original_language;
  }
  
  return normalized;
}

/**
 * Get list of available genres
 */
export async function getAvailableGenres(contentType: 'movie' | 'tv' = 'movie'): Promise<TMDBGenre[]> {
  try {
    const endpoint = contentType === 'movie' ? 'movie' : 'tv';
    const url = `${TMDB_CONFIG.BASE_URL}/genre/${endpoint}/list?language=en-US`;
    const response = await rateLimitedFetch(url, true);
    const data: TMDBGenresResponse = await response.json();
    return data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

/**
 * List of popular countries for filtering
 * TMDB uses ISO 3166-1 codes
 */
export const POPULAR_COUNTRIES = [
  { id: 'US', name: 'United States' },
  { id: 'GB', name: 'United Kingdom' },
  { id: 'FR', name: 'France' },
  { id: 'DE', name: 'Germany' },
  { id: 'IT', name: 'Italy' },
  { id: 'ES', name: 'Spain' },
  { id: 'JP', name: 'Japan' },
  { id: 'KR', name: 'South Korea' },
  { id: 'CN', name: 'China' },
  { id: 'IN', name: 'India' },
  { id: 'RU', name: 'Russia' },
  { id: 'CA', name: 'Canada' },
  { id: 'AU', name: 'Australia' },
  { id: 'BR', name: 'Brazil' },
  { id: 'MX', name: 'Mexico' },
  { id: 'AR', name: 'Argentina' },
  { id: 'SE', name: 'Sweden' },
  { id: 'NO', name: 'Norway' },
  { id: 'DK', name: 'Denmark' },
  { id: 'NL', name: 'Netherlands' },
  { id: 'BE', name: 'Belgium' },
  { id: 'CH', name: 'Switzerland' },
  { id: 'AT', name: 'Austria' },
  { id: 'PL', name: 'Poland' },
  { id: 'TR', name: 'Turkey' },
  { id: 'TH', name: 'Thailand' },
  { id: 'HK', name: 'Hong Kong' },
  { id: 'TW', name: 'Taiwan' },
  { id: 'SG', name: 'Singapore' },
  { id: 'NZ', name: 'New Zealand' },
];

/**
 * Get images (backdrops) for a movie or TV series
 */
async function getImages(id: number, contentType: 'movie' | 'tv'): Promise<string[]> {
  try {
    const endpoint = contentType === 'movie' ? 'movie' : 'tv';
    const url = `${TMDB_CONFIG.BASE_URL}/${endpoint}/${id}/images`;
    const response = await rateLimitedFetch(url);
    const data: TMDBImagesResponse = await response.json();
    
    // Use backdrops (screenshots) for the game
    return data.backdrops
      .sort((a, b) => b.vote_average - a.vote_average) // Sort by rating
      .map(img => getImageUrl(img.file_path, 'original'))
      .filter(url => url); // Remove empty URLs
  } catch (error) {
    console.error(`Error fetching images for ${contentType} ${id}:`, error);
    return [];
  }
}

/**
 * Get random movie/TV series with enough screenshots
 */
export async function getRandomContent(
  contentType: 'movie' | 'tv' = 'movie',
  filters?: TMDBFilters
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
      // Random page (TMDB has max 500 pages per query)
      const randomPage = Math.floor(Math.random() * 20) + 1;
      
      const filterParams = buildFilterParams(filters, contentType);
      const params = new URLSearchParams({
        ...filterParams,
        page: randomPage.toString(),
      });
      
      const endpoint = contentType === 'movie' ? 'movie' : 'tv';
      const discoverUrl = `${TMDB_CONFIG.BASE_URL}/discover/${endpoint}?${params}`;
      const response = await rateLimitedFetch(discoverUrl, false);
      const data: TMDBDiscoverResponse<TMDBMovie | TMDBTVSeries> = await response.json();
      
      if (data.results.length === 0) {
        throw new APIError('No content found', 404);
      }
      
      // Shuffle results and check each
      const shuffledResults = shuffleArray(data.results);
      
      for (const item of shuffledResults) {
        try {
          const images = await getImages(item.id, contentType);
          
          if (images.length >= MIN_SCREENSHOTS) {
            const shuffledScreenshots = shuffleArray(images).slice(0, MIN_SCREENSHOTS);
            
            // Different field names for movies vs TV series
            const name = 'title' in item ? item.title : item.name;
            const originalName = 'original_title' in item ? item.original_title : item.original_name;
            const posterPath = item.poster_path || item.backdrop_path;
            const image = posterPath ? getImageUrl(posterPath, 'w500') : shuffledScreenshots[0];
            
            return {
              id: item.id,
              name: name,
              secondaryName: originalName,
              image: image,
              screenshots: shuffledScreenshots,
              url: `https://www.themoviedb.org/${contentType}/${item.id}`,
            };
          }
          
          console.log(`${contentType} ${item.id} has only ${images.length} images, checking next...`);
        } catch (error) {
          console.error(`Error fetching images for ${contentType} ${item.id}:`, error);
          continue;
        }
      }
      
      console.log(`No suitable ${contentType} in batch ${attempt + 1}/${MAX_RETRIES}, retrying...`);
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        throw handleAPIError(error);
      }
      console.error(`Error fetching ${contentType} batch (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
    }
  }
  
  throw new APIError(`Failed to find ${contentType} with enough images`, 404);
}

/**
 * Search movies/TV series by query
 */
export async function searchContent(
  query: string,
  contentType: 'movie' | 'tv' = 'movie',
  filters?: TMDBFilters
): Promise<Array<{
  id: number;
  name: string;
  secondaryName: string;
  image: string;
}>> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  try {
    const endpoint = contentType === 'movie' ? 'movie' : 'tv';
    const params = new URLSearchParams({
      query: query.trim(),
      language: 'en-US',
      page: '1',
      include_adult: 'false',
    });
    
    // Add filters if provided
    if (filters?.with_original_language) {
      params.append('language', filters.with_original_language);
    }
    
    const url = `${TMDB_CONFIG.BASE_URL}/search/${endpoint}?${params}`;
    const response = await rateLimitedFetch(url);
    const data: TMDBDiscoverResponse<TMDBMovie | TMDBTVSeries> = await response.json();
    
    return (data.results || []).slice(0, 10).map(item => {
      const name = 'title' in item ? item.title : item.name;
      const originalName = 'original_title' in item ? item.original_title : item.original_name;
      const posterPath = item.poster_path || item.backdrop_path;
      
      return {
        id: item.id,
        name: name,
        secondaryName: originalName,
        image: posterPath ? getImageUrl(posterPath, 'w300') : '',
      };
    });
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

/**
 * Check answer for movie/TV series
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
