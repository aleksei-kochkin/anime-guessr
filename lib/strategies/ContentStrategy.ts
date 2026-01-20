// Strategies for different content types
import { ContentType, GameContent, SearchResult } from '@/lib/types/game';

// Filter configuration types
export type FilterType = 'button-multi' | 'button-single' | 'slider' | 'text' | 'number-range' | 'select' | 'dynamic-buttons';

export interface FilterOption {
  value: string | number;
  label: string;
}

// Dynamic filter option with strict typing
export interface DynamicFilterOption {
  id: number | string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  dynamicLoader?: () => Promise<FilterOption[]>; // For dynamic loading of options
}

/**
 * Base strategy interface for different content types
 * (Strategy Pattern)
 */
export interface ContentStrategy {
  readonly type: ContentType;
  readonly displayName: string;
  readonly questionText: string;
  readonly placeholder: string;
  readonly viewDetailsButtonText: string;
  readonly filterConfig: FilterConfig[];
  
  /**
   * Dynamic options loader for filters (if needed)
   */
  getDynamicOptionsLoader?: () => (filterId: string) => Promise<DynamicFilterOption[]>;
  
  /**
   * Get filter panel title
   */
  getFilterPanelTitle(): string;
  
  /**
   * Get random content with filters
   */
  getRandomContent(filters: Record<string, unknown>): Promise<Omit<GameContent, 'contentType'>>;
  
  /**
   * Search content by query with filters
   */
  searchContent(query: string, filters: Record<string, unknown>): Promise<SearchResult[]>;
  
  /**
   * Check if user answer is correct
   */
  checkAnswer(userAnswer: string, correctName: string, correctSecondaryName: string): boolean;
}

/**
 * Base class for all strategies
 */
export abstract class BaseContentStrategy implements ContentStrategy {
  abstract readonly type: ContentType;
  abstract readonly displayName: string;
  abstract readonly questionText: string;
  abstract readonly placeholder: string;
  abstract readonly viewDetailsButtonText: string;
  abstract readonly filterConfig: FilterConfig[];
  
  getDynamicOptionsLoader?: () => (filterId: string) => Promise<DynamicFilterOption[]>;
  
  getFilterPanelTitle(): string {
    return `${this.displayName} Filters`;
  }
  
  abstract getRandomContent(filters: Record<string, unknown>): Promise<Omit<GameContent, 'contentType'>>;
  abstract searchContent(query: string, filters: Record<string, unknown>): Promise<SearchResult[]>;
  abstract checkAnswer(userAnswer: string, correctName: string, correctSecondaryName: string): boolean;
}
