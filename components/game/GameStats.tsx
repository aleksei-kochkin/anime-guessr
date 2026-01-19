'use client';

import { UI_TEXT } from '@/lib/constants/game';

interface GameStatsProps {
  round: number;
  score: number;
  correctRounds: number;
  className?: string;
}

export default function GameStats({ round, score, correctRounds, className = '' }: GameStatsProps) {
  // Accuracy = процент правильно угаданных раундов
  const accuracy = round > 0 ? Math.round((correctRounds / round) * 100) : 0;

  return (
    <div className={`flex justify-center items-center gap-6 ${className}`}>
      <div className="text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{UI_TEXT.STATS.ROUND}</div>
        <div className="text-xl font-bold text-gray-900 dark:text-white">{round}</div>
      </div>

      <div className="w-px bg-gray-300 dark:bg-gray-700" />

      <div className="text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{UI_TEXT.STATS.SCORE}</div>
        <div className="text-xl font-bold text-green-600 dark:text-green-400">{score}</div>
      </div>

      <div className="w-px bg-gray-300 dark:bg-gray-700" />

      <div className="text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{UI_TEXT.STATS.ACCURACY}</div>
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{accuracy}%</div>
      </div>
    </div>
  );
}
