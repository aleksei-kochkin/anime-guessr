// Factory for creating content strategies
import { ContentType } from '@/lib/types/game';
import { ContentStrategy } from './ContentStrategy';
import { AnimeStrategy } from './AnimeStrategy';
import { MovieStrategy } from './MovieStrategy';
import { TVSeriesStrategy } from './TVSeriesStrategy';

/**
 * Content strategy factory (Factory Pattern)
 */
export class ContentStrategyFactory {
  private static strategies: Map<ContentType, ContentStrategy> = new Map();
  
  /**
   * Get strategy for content type
   */
  static getStrategy(type: ContentType): ContentStrategy {
    // Cache strategies
    if (!this.strategies.has(type)) {
      this.strategies.set(type, this.createStrategy(type));
    }
    
    return this.strategies.get(type)!;
  }
  
  /**
   * Create new strategy
   */
  private static createStrategy(type: ContentType): ContentStrategy {
    switch (type) {
      case 'anime':
        return new AnimeStrategy();
      case 'movie':
        return new MovieStrategy();
      case 'tv':
        return new TVSeriesStrategy();
      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  }
  
  /**
   * Get all available content types
   */
  static getAvailableTypes(): ContentType[] {
    return ['anime', 'movie', 'tv'];
  }
  
  /**
   * Get all strategies
   */
  static getAllStrategies(): ContentStrategy[] {
    return this.getAvailableTypes().map(type => this.getStrategy(type));
  }
}
