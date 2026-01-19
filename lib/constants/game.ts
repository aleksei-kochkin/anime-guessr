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
  
  // Данные
  ANIME_PAGES: 10, // Количество страниц для выборки случайного аниме
  ANIME_PER_PAGE: 50, // Количество аниме на странице
} as const;

export const SHIKIMORI_CONFIG = {
  BASE_URL: 'https://shikimori.one/api',
  USER_AGENT: 'anime-guessr',
  
  // Параметры запросов
  DEFAULT_PARAMS: {
    kind: 'tv',
    status: 'released',
    order: 'popularity',
  },
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
