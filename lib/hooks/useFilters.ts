// Hook for managing filters
import { useState, useEffect, useRef } from 'react';
import { ContentType } from '@/lib/types/game';
import { setClientCookie, getClientCookie, COOKIE_NAMES } from '@/lib/utils/cookies-client';

interface UseFiltersProps {
  contentType: ContentType;
  onFiltersChanged: () => void;
}

// Helper function to load filters from cookies (client-side only)
function loadFiltersFromCookie(cookieName: string): Record<string, unknown> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  try {
    const cookieValue = getClientCookie(cookieName);
    if (cookieValue) {
      return JSON.parse(cookieValue);
    }
  } catch (error) {
    console.error(`Error loading filters from cookie ${cookieName}:`, error);
  }
  return {};
}

// Get cookie name based on content type
function getCookieNameForType(contentType: ContentType): string {
  switch (contentType) {
    case 'anime':
      return COOKIE_NAMES.ANIME_FILTERS;
    case 'movie':
      return COOKIE_NAMES.MOVIE_FILTERS;
    case 'tv':
      return COOKIE_NAMES.TV_SERIES_FILTERS;
  }
}

export function useFilters({ contentType, onFiltersChanged }: UseFiltersProps) {
  // Start with empty filters to match SSR
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const prevContentType = useRef<ContentType>(contentType);

  // Load filters from cookies after mount and when contentType changes
  useEffect(() => {
    // Use microtask to defer setState and avoid cascading renders warning
    queueMicrotask(() => {
      const cookieName = getCookieNameForType(contentType);
      const loadedFilters = loadFiltersFromCookie(cookieName);
      setFilters(loadedFilters);
      prevContentType.current = contentType;
    });
  }, [contentType]);

  // Universal handler for current content type
  const handleFiltersChange = async (newFilters: Record<string, unknown>) => {
    const cookieName = getCookieNameForType(contentType);
    
    // Update filters immediately for responsive UI
    setFilters(newFilters);
    
    // Save to cookie
    setClientCookie(cookieName, JSON.stringify(newFilters));
    
    // Notify that filters changed
    onFiltersChanged();
  };

  return {
    filters,
    handleFiltersChange,
  };
}
