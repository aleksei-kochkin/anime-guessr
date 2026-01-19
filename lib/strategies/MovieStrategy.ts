// Strategy for movies
import { BaseContentStrategy, FilterConfig } from './ContentStrategy';
import { getAvailableGenres, POPULAR_COUNTRIES } from '@/lib/api/tmdb';

export class MovieStrategy extends BaseContentStrategy {
  readonly type = 'movie' as const;
  readonly displayName = 'Movies';
  readonly questionText = 'What movie is this?';
  readonly placeholder = 'Enter movie name...';
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
      id: 'primary_release_date.gte',
      label: 'Release Date From (YYYY-MM-DD)',
      type: 'text',
      placeholder: 'e.g., 2020-01-01',
    },
    {
      id: 'primary_release_date.lte',
      label: 'Release Date To (YYYY-MM-DD)',
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
        const genres = await getAvailableGenres('movie');
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
