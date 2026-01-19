// Strategies for different content types
import { ContentType } from '@/lib/types/game';

// Filter configuration types
export type FilterType = 'button-multi' | 'button-single' | 'slider' | 'text' | 'number-range' | 'select' | 'dynamic-buttons';

export interface FilterOption {
  value: string | number;
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
  readonly filterConfig: FilterConfig[];
  
  /**
   * Dynamic options loader for filters (if needed)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDynamicOptionsLoader?: () => (filterId: string) => Promise<Array<{ id: number | string; [key: string]: any }>>;
  
  /**
   * Get filter panel title
   */
  getFilterPanelTitle(): string;
}

/**
 * Base class for all strategies
 */
export abstract class BaseContentStrategy implements ContentStrategy {
  abstract readonly type: ContentType;
  abstract readonly displayName: string;
  abstract readonly questionText: string;
  abstract readonly placeholder: string;
  abstract readonly filterConfig: FilterConfig[];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDynamicOptionsLoader?: () => (filterId: string) => Promise<Array<{ id: number | string; [key: string]: any }>>;
  
  getFilterPanelTitle(): string {
    return `${this.displayName} Filters`;
  }
}
