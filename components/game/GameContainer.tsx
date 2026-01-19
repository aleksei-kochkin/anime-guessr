'use client';

import { useState, useMemo, useEffect } from 'react';
import { fetchRandomAnime, verifyAnswer } from '@/lib/actions/anime';
import { GameAnime } from '@/lib/types/anime';
import { UI_TEXT } from '@/lib/constants/game';
import { getErrorMessage } from '@/lib/utils/errors';
import AnimeImage from './AnimeImage';
import AnswerInput from './AnswerInput';
import ResultDisplay from './ResultDisplay';
import GameStats from './GameStats';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';

interface GameContainerProps {
  initialAnime: GameAnime;
}

export default function GameContainer({ initialAnime }: GameContainerProps) {
  const [currentAnime, setCurrentAnime] = useState<GameAnime>(initialAnime);
  const [attempts, setAttempts] = useState(0); // Количество использованных попыток (0-5)
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0); // Количество правильно угаданных раундов
  const [round, setRound] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Текущий просматриваемый скриншот

  const MAX_ATTEMPTS = 6;

  // Все доступные изображения (текущие раскрытые)
  const availableImages = useMemo(() => {
    return currentAnime.screenshots.length > 0
      ? currentAnime.screenshots
      : [currentAnime.image];
  }, [currentAnime]);

  // Количество раскрытых изображений
  const unlockedImagesCount = Math.min(attempts + 1, availableImages.length);

  // Показываем изображение в зависимости от выбранного индекса
  const displayImage = useMemo(() => {
    const imageIndex = Math.min(selectedImageIndex, unlockedImagesCount - 1);
    return availableImages[imageIndex];
  }, [availableImages, selectedImageIndex, unlockedImagesCount]);

  // При новой попытке автоматически показываем новый скриншот
  useEffect(() => {
    if (attempts > 0 && attempts < MAX_ATTEMPTS) {
      setSelectedImageIndex(attempts);
    }
  }, [attempts]);

  const handleSubmitAnswer = async (answer: string, animeId?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const correct = await verifyAnswer(
        answer,
        currentAnime.id,
        currentAnime.name,
        currentAnime.russian,
        animeId
      );

      if (correct) {
        // Правильный ответ - завершаем раунд
        setIsCorrect(true);
        setIsRoundComplete(true);
        setCorrectRounds(prev => prev + 1);
        // Очки зависят от количества попыток: 6 за первую, 5 за вторую и т.д.
        const points = MAX_ATTEMPTS - attempts;
        setScore(prev => prev + points);
      } else {
        // Неправильный ответ
        setWrongAnswers(prev => [...prev, answer]);
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          // Попытки закончились - завершаем раунд
          setIsCorrect(false);
          setIsRoundComplete(true);
        }
      }
    } catch (err) {
      console.error('Error verifying answer:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextRound = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newAnime = await fetchRandomAnime();
      setCurrentAnime(newAnime);
      setIsRoundComplete(false);
      setIsCorrect(null);
      setAttempts(0);
      setWrongAnswers([]);
      setSelectedImageIndex(0);
      setRound(prev => prev + 1);
    } catch (err) {
      console.error('Error fetching new anime:', err);
      setError(getErrorMessage(err) || UI_TEXT.ERRORS.FETCH_ANIME);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-4 px-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <header className="text-center space-y-2 animate-fadeIn">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {UI_TEXT.TITLE}
          </h1>
          <GameStats round={round} score={score} correctRounds={correctRounds} />
        </header>

        {/* Error Display */}
        {error && (
          <ErrorMessage message={error} onRetry={handleNextRound} />
        )}

        {/* Loading State */}
        {isLoading && !currentAnime && (
          <div className="text-center py-6 animate-fadeIn">
            <LoadingSpinner size="lg" className="mx-auto" />
            <p className="mt-3 text-gray-600 dark:text-gray-400">{UI_TEXT.LOADING.ANIME}</p>
          </div>
        )}

        {/* Game Content */}
        {currentAnime && !error && (
          <div className="grid grid-cols-[minmax(150px,250px)_1fr_minmax(150px,250px)] gap-8 animate-fadeIn items-start w-full px-4">
            {/* Left Column - Previous Attempts */}
            <div className="space-y-2">
              {wrongAnswers.length > 0 && (
                <>
                  <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                    Previous Attempts
                  </h3>
                  <div className="space-y-1">
                    {wrongAnswers.map((answer, index) => (
                      <div
                        key={index}
                        className="px-2 py-1 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded text-xs text-center border border-red-200 dark:border-red-900/30"
                      >
                        {answer || '(skipped)'}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Center Column - Main Game */}
            <div className="space-y-3 w-full">
              {/* Anime Image */}
              <AnimeImage
                src={displayImage}
                alt="Guess this anime"
              />

              {/* Attempts indicator with navigation */}
              <div className="flex justify-center items-center gap-2">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => {
                  const isUnlocked = index < unlockedImagesCount;
                  const isCurrent = index === selectedImageIndex;
                  const isUsed = index < attempts;
                  const isActive = index === attempts && !isRoundComplete;

                  return (
                    <button
                      key={index}
                      onClick={() => isUnlocked && setSelectedImageIndex(index)}
                      disabled={!isUnlocked}
                      className={`w-3 h-3 rounded-full transition-all cursor-pointer ${isUsed
                        ? isCurrent
                          ? 'bg-red-500 ring-2 ring-red-400 dark:ring-red-600 scale-125'
                          : 'bg-red-500 hover:scale-125 hover:ring-2 hover:ring-red-400 dark:hover:ring-red-600'
                        : isActive
                          ? isCurrent
                            ? 'bg-blue-500 ring-2 ring-blue-400 dark:ring-blue-600 scale-125'
                            : 'bg-blue-500 scale-125 hover:ring-2 hover:ring-blue-400 dark:hover:ring-blue-600'
                          : 'bg-gray-300 dark:bg-gray-600 opacity-50'
                        }`}
                      title={isUnlocked ? `Screenshot ${index + 1}${isCurrent ? ' (viewing)' : ''}` : 'Locked'}
                    />
                  );
                })}
              </div>

              {/* Answer Input or Result */}
              {!isRoundComplete ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {UI_TEXT.QUESTION}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Attempt {attempts + 1} of {MAX_ATTEMPTS}{unlockedImagesCount > 1 ? ` • Viewing screenshot ${selectedImageIndex + 1}` : ''}
                    </p>
                  </div>

                  <AnswerInput
                    onSubmit={handleSubmitAnswer}
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <ResultDisplay
                  isCorrect={isCorrect!}
                  correctName={currentAnime.name}
                  correctRussian={currentAnime.russian}
                  animeUrl={currentAnime.url}
                  onNext={handleNextRound}
                  attempts={attempts}
                  maxAttempts={MAX_ATTEMPTS}
                />
              )}
            </div>

            {/* Right Column - Empty for symmetry */}
            <div></div>
          </div>
        )}

        {/* Instructions */}
        {!isRoundComplete && !error && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto animate-fadeIn">
            <p>You have {MAX_ATTEMPTS} attempts • Each attempt unlocks a new screenshot • Click dots to switch • Points: {MAX_ATTEMPTS - attempts}</p>
          </div>
        )}
      </div>
    </div>
  );
}
