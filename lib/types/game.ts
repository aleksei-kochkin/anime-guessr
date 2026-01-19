// Common game types used across the application

// Content type discriminator
export type ContentType = 'anime' | 'movie' | 'tv';

// Universal content structure for the game
export interface GameContent {
  id: number;
  name: string;
  secondaryName: string; // russian for anime, originalName for movies/TV series
  image: string;
  screenshots: string[];
  url: string;
  contentType?: ContentType;
}

// Universal search result structure
export interface SearchResult {
  id: number;
  name: string;
  secondaryName: string; // russian for anime, originalName for movies/TV series
  image: string;
  contentType: ContentType;
}
