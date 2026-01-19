// Hook for managing filters
import { useState } from 'react';
import { ContentType } from '@/lib/types/game';
import { AnimeFilters } from '@/lib/api/shikimori';
import { setClientCookie, COOKIE_NAMES } from '@/lib/utils/cookies-client';

interface UseFiltersProps {
  contentType: ContentType;
  onFiltersChanged: () => void;
}

export function useFilters({ contentType, onFiltersChanged }: UseFiltersProps) {
  const [animeFilters, setAnimeFilters] = useState<AnimeFilters>({});
  const [movieFilters, setMovieFilters] = useState<Record<string, unknown>>({});
  const [tvSeriesFilters, setTVSeriesFilters] = useState<Record<string, unknown>>({});

  const handleAnimeFiltersChange = async (newFilters: AnimeFilters) => {
    setAnimeFilters(newFilters);
    setClientCookie(COOKIE_NAMES.ANIME_FILTERS, JSON.stringify(newFilters));

    // Notify that filters changed
    if (contentType === 'anime') {
      onFiltersChanged();
    }
  };

  const handleMovieFiltersChange = async (newFilters: Record<string, unknown>) => {
    setMovieFilters(newFilters);
    setClientCookie(COOKIE_NAMES.MOVIE_FILTERS, JSON.stringify(newFilters));

    // Notify that filters changed
    if (contentType === 'movie') {
      onFiltersChanged();
    }
  };

  const handleTVSeriesFiltersChange = async (newFilters: Record<string, unknown>) => {
    setTVSeriesFilters(newFilters);
    setClientCookie(COOKIE_NAMES.TV_SERIES_FILTERS, JSON.stringify(newFilters));

    // Notify that filters changed
    if (contentType === 'tv') {
      onFiltersChanged();
    }
  };

  return {
    animeFilters,
    movieFilters,
    tvSeriesFilters,
    handleAnimeFiltersChange,
    handleMovieFiltersChange,
    handleTVSeriesFiltersChange,
  };
}
