// Типы для работы с Shikimori API

export interface ShikimoriAnime {
  id: number;
  name: string;
  russian: string;
  image: {
    original: string;
    preview: string;
    x96: string;
    x48: string;
  };
  url: string;
  kind: string;
  score: string;
  status: string;
  episodes: number;
  episodes_aired: number;
  aired_on: string | null;
  released_on: string | null;
}

export interface ShikimoriScreenshot {
  original: string;
  preview: string;
}

export interface AnimeSearchResult {
  id: number;
  name: string;
  russian: string;
  image: string;
}

export interface GameAnime {
  id: number;
  name: string;
  russian: string;
  image: string;
  screenshots: string[];
  url: string;
}

export interface GameState {
  currentAnime: GameAnime | null;
  userAnswer: string;
  isAnswered: boolean;
  isCorrect: boolean | null;
  score: number;
  round: number;
  attempts: number; // Количество использованных попыток (0-6)
  maxAttempts: number; // Максимальное количество попыток
}

export interface AnimeFilters {
  kind?: string[]; // tv, movie, ova, ona, special, music
  status?: string[]; // anons, ongoing, released
  season?: string; // e.g., "2020_2024", "summer_2023"
  score?: number; // минимальный рейтинг
  duration?: string; // S (<10min), D (<30min), F (>30min)
  rating?: string[]; // g, pg, pg_13, r, r_plus, rx
  genre?: string[]; // список ID жанров
}
