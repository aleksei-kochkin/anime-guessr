// Client-side utilities for cookies (for Client Components)

export const COOKIE_NAMES = {
  CONTENT_TYPE: 'content-type',
  ANIME_FILTERS: 'anime-filters',
  MOVIE_FILTERS: 'movie-filters',
  TV_SERIES_FILTERS: 'tv-series-filters',
} as const;

// Client-side cookie operations
export function setClientCookie(name: string, value: string, days: number = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function getClientCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
