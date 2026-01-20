// Strategy for TV series
import { BaseContentStrategy, FilterConfig } from './ContentStrategy';
import { 
  getAvailableGenres, 
  getAvailableCountries, 
  getRandomContent, 
  searchContent as searchKinopoisk,
  checkAnswer as checkKinopoiskAnswer,
  normalizeFilters 
} from '@/lib/api/kinopoisk';
import { GameContent, SearchResult } from '@/lib/types/game';

export class TVSeriesStrategy extends BaseContentStrategy {
  readonly type = 'tv' as const;
  readonly displayName = 'TV Series';
  readonly questionText = 'What TV series is this?';
  readonly placeholder = 'Enter TV series name...';
  readonly viewDetailsButtonText = 'View on Kinopoisk';
  readonly filterConfig: FilterConfig[] = [
    {
      id: 'ratingFrom',
      label: 'Minimum Rating',
      type: 'slider',
      min: 0,
      max: 10,
      step: 0.5,
    },
    {
      id: 'yearFrom',
      label: 'Year From',
      type: 'number-range',
      min: 1900,
      max: new Date().getFullYear(),
      placeholder: 'e.g., 2020',
    },
    {
      id: 'yearTo',
      label: 'Year To',
      type: 'number-range',
      min: 1900,
      max: new Date().getFullYear(),
      placeholder: 'e.g., 2024',
    },
    {
      id: 'countries',
      label: 'Country',
      type: 'dynamic-buttons',
    },
    {
      id: 'genres',
      label: 'Genre',
      type: 'dynamic-buttons',
    },
  ];
  
  getDynamicOptionsLoader = () => {
    return async (filterId: string) => {
      if (filterId === 'countries') {
        const countries = await getAvailableCountries();
        return countries.map(c => ({
          id: c.id,
          label: c.country,
        }));
      }
      
      if (filterId === 'genres') {
        const genres = await getAvailableGenres();
        return genres.map(g => ({
          id: g.id,
          label: g.genre,
        }));
      }
      
      return [];
    };
  };
  
  async getRandomContent(filters: Record<string, unknown>): Promise<Omit<GameContent, 'contentType'>> {
    const normalizedFilters = normalizeFilters(filters, 'tv');
    return await getRandomContent('tv', normalizedFilters);
  }
  
  async searchContent(query: string, filters: Record<string, unknown>): Promise<Array<Omit<SearchResult, 'contentType'>>> {
    const normalizedFilters = normalizeFilters(filters, 'tv');
    return await searchKinopoisk(query, 'tv', normalizedFilters);
  }
  
  checkAnswer(userAnswer: string, correctName: string, correctSecondaryName: string): boolean {
    return checkKinopoiskAnswer(userAnswer, correctName, correctSecondaryName);
  }
}
