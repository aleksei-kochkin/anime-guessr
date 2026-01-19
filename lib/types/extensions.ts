// Типы для будущих расширений

/**
 * Типы для системы таймера
 */
export interface TimerConfig {
  enabled: boolean;
  duration: number; // в секундах
  penalty: number; // штраф за неправильный ответ
}

/**
 * Типы для системы подсказок
 */
export interface Hint {
  type: 'genre' | 'year' | 'studio' | 'episodes';
  content: string;
  cost: number; // стоимость в очках
}

/**
 * Расширенная статистика игрока
 */
export interface ExtendedGameStats {
  totalRounds: number;
  correctAnswers: number;
  wrongAnswers: number;
  streak: number; // текущая серия правильных ответов
  bestStreak: number; // лучшая серия
  averageTime: number; // среднее время ответа
  hintsUsed: number;
  totalScore: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * История игры
 */
export interface GameHistory {
  id: string;
  animeId: number;
  animeName: string;
  animeRussian: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
}

/**
 * Настройки игры
 */
export interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  timer: TimerConfig;
  hintsEnabled: boolean;
  soundEnabled: boolean;
  showRomaji: boolean; // показывать romanized названия
  preferredLanguage: 'en' | 'ru' | 'both';
}

/**
 * Достижения
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

/**
 * Мультиплеер комната
 */
export interface MultiplayerRoom {
  id: string;
  name: string;
  host: string;
  players: Player[];
  maxPlayers: number;
  currentRound: number;
  totalRounds: number;
  status: 'waiting' | 'playing' | 'finished';
}

/**
 * Игрок в мультиплеере
 */
export interface Player {
  id: string;
  name: string;
  score: number;
  avatar?: string;
  isReady: boolean;
}

/**
 * Таблица лидеров
 */
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  accuracy: number;
  gamesPlayed: number;
  timestamp: Date;
}
