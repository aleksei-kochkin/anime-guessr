// Strategy for anime
import { BaseContentStrategy, FilterConfig } from './ContentStrategy';

// Anime-specific filter options
const ANIME_FILTER_OPTIONS = {
  kind: [
    { value: 'tv', label: 'TV' },
    { value: 'movie', label: 'Movie' },
    { value: 'ova', label: 'OVA' },
    { value: 'ona', label: 'ONA' },
    { value: 'special', label: 'Special' },
    { value: 'music', label: 'Music' },
  ],
  status: [
    { value: 'released', label: 'Released' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'anons', label: 'Announced' },
  ],
  duration: [
    { value: 'S', label: 'Short (<10 min)' },
    { value: 'D', label: 'Medium (<30 min)' },
    { value: 'F', label: 'Full (>30 min)' },
  ],
  rating: [
    { value: 'g', label: 'G - All Ages' },
    { value: 'pg', label: 'PG - Children' },
    { value: 'pg_13', label: 'PG-13 - Teens 13+' },
    { value: 'r', label: 'R - 17+' },
    { value: 'r_plus', label: 'R+ - Mild Nudity' },
  ],
} as const;

export class AnimeStrategy extends BaseContentStrategy {
  readonly type = 'anime' as const;
  readonly displayName = 'Anime';
  readonly questionText = 'What anime is this?';
  readonly placeholder = 'Enter anime name...';
  readonly filterConfig: FilterConfig[] = [
    {
      id: 'kind',
      label: 'Type',
      type: 'button-multi',
      options: ANIME_FILTER_OPTIONS.kind.map(o => ({ value: o.value, label: o.label })),
    },
    {
      id: 'status',
      label: 'Status',
      type: 'button-multi',
      options: ANIME_FILTER_OPTIONS.status.map(o => ({ value: o.value, label: o.label })),
    },
    {
      id: 'rating',
      label: 'Age Rating',
      type: 'button-multi',
      options: ANIME_FILTER_OPTIONS.rating.map(o => ({ value: o.value, label: o.label })),
    },
    {
      id: 'season',
      label: 'Season (e.g., "2020_2024", "summer_2023")',
      type: 'text',
      placeholder: 'e.g., 2020_2024',
    },
    {
      id: 'score',
      label: 'Minimum Score',
      type: 'slider',
      min: 0,
      max: 9,
      step: 1,
    },
    {
      id: 'duration',
      label: 'Episode Duration',
      type: 'select',
      options: [
        { value: '', label: 'Any' },
        ...ANIME_FILTER_OPTIONS.duration.map(o => ({ value: o.value, label: o.label })),
      ],
    },
  ];
}
