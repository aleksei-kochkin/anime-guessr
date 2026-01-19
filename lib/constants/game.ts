// Константы для игры

export const GAME_CONFIG = {
  // API настройки
  RATE_LIMIT_MS: 1000, // Минимальное время между запросами к API
  CACHE_DURATION: 3600, // Длительность кеша в секундах (1 час)
  
  // Поиск и автодополнение
  SEARCH_MIN_LENGTH: 2, // Минимальная длина для поиска
  SEARCH_DEBOUNCE_MS: 300, // Задержка для debounce поиска
  MAX_SUGGESTIONS: 10, // Максимальное количество подсказок
  
  // Проверка ответа
  MATCH_THRESHOLD: 0.7, // Минимальное совпадение для частичного match (70%)
  
  // Игра
  MAX_ATTEMPTS: 6, // Максимальное количество попыток на один раунд
  
  // UI
  IMAGE_LOAD_TIMEOUT: 10000, // Таймаут загрузки изображения
} as const;

export const SHIKIMORI_CONFIG = {
  BASE_URL: 'https://shikimori.one/api',
  USER_AGENT: 'anime-guessr',
} as const;

export const UI_TEXT = {
  TITLE: 'Anime Guessr',
  SUBTITLE: 'Guess the Anime',
  QUESTION: 'What anime is this?',
  PLACEHOLDER: 'Enter anime name...',
  SUBMIT: 'Submit',
  NEXT: 'Next Round →',
  RETRY: 'Try Again',
  VIEW_DETAILS: 'View on Shikimori',
  
  // Сообщения
  CORRECT: 'Correct!',
  WRONG: 'Wrong!',
  YOUR_ANSWER: 'Your answer:',
  CORRECT_ANSWER: 'Correct answer:',
  
  // Инструкции
  INSTRUCTIONS: [
    'Type the anime name and select from suggestions or press Enter to submit.',
    'Partial matches are accepted!',
  ],
  
  // Статистика
  STATS: {
    ROUND: 'Round',
    SCORE: 'Score',
    ACCURACY: 'Accuracy',
  },
  
  // Ошибки
  ERRORS: {
    FETCH_ANIME: 'Failed to load anime. Please try again.',
    VERIFY_ANSWER: 'Failed to verify answer.',
    NO_ANIME: 'No anime found.',
    NETWORK: 'Network error. Please check your connection.',
    GENERIC: 'Something went wrong. Please try again.',
  },
  
  // Загрузка
  LOADING: {
    ANIME: 'Loading anime...',
    VERIFYING: 'Checking answer...',
  },
} as const;

export type GameDifficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_CONFIG: Record<GameDifficulty, { minScore: string; label: string }> = {
  easy: {
    minScore: '0',
    label: 'Easy',
  },
  medium: {
    minScore: '7.0',
    label: 'Medium',
  },
  hard: {
    minScore: '8.0',
    label: 'Hard',
  },
};

// Опции для фильтров аниме
export const FILTER_OPTIONS = {
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
