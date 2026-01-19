// Вспомогательные функции

/**
 * Нормализация строки для сравнения
 */
export function normalizeString(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Проверка совпадения строк (case-insensitive)
 */
export function isMatch(str1: string, str2: string): boolean {
  return normalizeString(str1) === normalizeString(str2);
}

/**
 * Проверка частичного совпадения
 */
export function isPartialMatch(
  query: string,
  target: string,
  threshold: number = 0.7
): boolean {
  const normalizedQuery = normalizeString(query);
  const normalizedTarget = normalizeString(target);
  
  const minLength = Math.floor(normalizedTarget.length * threshold);
  
  if (normalizedQuery.length < minLength) {
    return false;
  }
  
  return (
    normalizedTarget.includes(normalizedQuery) ||
    normalizedQuery.includes(normalizedTarget)
  );
}

/**
 * Форматирование счета
 */
export function formatScore(score: number, total: number): string {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  return `${score}/${total} (${percentage}%)`;
}

/**
 * Генерация случайного элемента из массива
 */
export function randomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Задержка для debounce
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Безопасный парсинг JSON
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Форматирование времени (секунды -> MM:SS)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Проверка валидности URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
