'use client';

import { UI_TEXT } from '@/lib/constants/game';
import Button from '@/components/ui/Button';

interface ResultDisplayProps {
  isCorrect: boolean;
  correctName: string;
  correctRussian: string;
  animeUrl: string;
  onNext: () => void;
  attempts: number;
  maxAttempts: number;
}

export default function ResultDisplay({
  isCorrect,
  correctName,
  correctRussian,
  animeUrl,
  onNext,
  attempts,
  maxAttempts,
}: ResultDisplayProps) {
  const pointsEarned = isCorrect ? maxAttempts - attempts : 0;
  return (
    <div className={`w-full max-w-md mx-auto p-4 rounded-lg shadow-lg transition-all duration-300 animate-scaleIn ${isCorrect
      ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
      : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
      }`}>
      <div className="text-center space-y-3">
        <div className="text-3xl font-bold">
          {isCorrect ? '✓' : '✗'}
        </div>

        <div>
          <h3 className={`text-lg font-bold ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            }`}>
            {isCorrect ? UI_TEXT.CORRECT : UI_TEXT.WRONG}
          </h3>
          {isCorrect && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              Guessed on attempt {attempts + 1}! +{pointsEarned} points
            </p>
          )}
          {!isCorrect && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              Used all {maxAttempts} attempts
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{UI_TEXT.CORRECT_ANSWER}</p>
          <p className="text-base font-bold text-gray-900 dark:text-white">
            {correctRussian || correctName}
          </p>
          {correctRussian && correctName !== correctRussian && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {correctName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <a
            href={animeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="md" fullWidth className="border-2 border-gray-300 dark:border-gray-600 h-full">
              {UI_TEXT.VIEW_DETAILS}
            </Button>
          </a>

          <Button onClick={onNext} variant="primary" size="md" fullWidth>
            {UI_TEXT.NEXT}
          </Button>
        </div>
      </div>
    </div>
  );
}
