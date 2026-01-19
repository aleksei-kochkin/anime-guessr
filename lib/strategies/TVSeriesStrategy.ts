// Strategy for TV series
import { BaseContentStrategy, FilterConfig } from './ContentStrategy';
import { getAvailableGenres, POPULAR_COUNTRIES } from '@/lib/api/tmdb';

export class TVSeriesStrategy extends BaseContentStrategy {
  readonly type = 'tv' as const;
  readonly displayName = 'TV Series';
  readonly questionText = 'What TV series is this?';
  readonly placeholder = 'Enter TV series name...';
  readonly filterConfig: FilterConfig[] = [
    {
      id: 'vote_average.gte',
      label: 'Minimum Rating',
      type: 'slider',
      min: 0,
      max: 10,
      step: 0.5,
    },
    {
      id: 'first_air_date.gte',
      label: 'First Air Date From (YYYY-MM-DD)',
      type: 'text',
      placeholder: 'e.g., 2020-01-01',
    },
    {
      id: 'first_air_date.lte',
      label: 'First Air Date To (YYYY-MM-DD)',
      type: 'text',
      placeholder: 'e.g., 2024-12-31',
    },
    {
      id: 'with_origin_country',
      label: 'Country',
      type: 'dynamic-buttons',
    },
    {
      id: 'with_genres',
      label: 'Genre',
      type: 'dynamic-buttons',
    },
  ];
  
  getDynamicOptionsLoader = () => {
    return async (filterId: string) => {
      if (filterId === 'with_origin_country') {
        return POPULAR_COUNTRIES.map(c => ({
          id: c.id,
          value: c.id,
          label: c.name,
          country: c.name,
        }));
      }
      
      if (filterId === 'with_genres') {
        const genres = await getAvailableGenres('tv');
        return genres.map(g => ({
          id: g.id,
          value: g.id,
          label: g.name,
          genre: g.name,
        }));
      }
      
      return [];
    };
  };
}
