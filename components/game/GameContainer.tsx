'use client';

import { useState } from 'react';
import { GameContent, ContentType } from '@/lib/types/game';
import { ContentStrategyFactory } from '@/lib/strategies';
import { useGameLogic } from '@/lib/hooks/useGameLogic';
import { useFilters } from '@/lib/hooks/useFilters';
import { setClientCookie, COOKIE_NAMES } from '@/lib/utils/cookies-client';
import AnimeImage from './AnimeImage';
import AttemptIndicators from './AttemptIndicators';
import AnswerInput from './AnswerInput';
import ResultDisplay from './ResultDisplay';
import GameStats from './GameStats';
import UniversalFilterPanel from './UniversalFilterPanel';
import ContentTypeSelector from './ContentTypeSelector';
import ErrorMessage from '../ui/ErrorMessage';

interface GameContainerProps {
  initialAnime: GameContent;
}

export default function GameContainer({ initialAnime }: GameContainerProps) {
  // Get strategy for current content type
  const [strategy, setStrategy] = useState(() =>
    ContentStrategyFactory.getStrategy(initialAnime.contentType || 'anime')
  );

  // Use hook for game logic
  const gameLogic = useGameLogic({
    initialAnime,
    initialContentType: strategy.type,
  });

  // Use hook for filters
  const filtersLogic = useFilters({
    contentType: gameLogic.contentType,
    onFiltersChanged: () => {
      gameLogic.loadNewContent();
    },
  });

  // Content type change handler
  const handleContentTypeChange = async (newType: ContentType) => {
    try {
      const newStrategy = ContentStrategyFactory.getStrategy(newType);
      setStrategy(newStrategy);
      gameLogic.setContentType(newType);
      setClientCookie(COOKIE_NAMES.CONTENT_TYPE, newType);

      // Load new content without incrementing round
      await gameLogic.loadNewContent(newType);
    } catch (error) {
      console.error('Error changing content type:', error);
      // Error will be displayed via gameLogic.error state
    }
  };

  // Image selection handler
  const handleImageSelect = (index: number) => {
    if (index < gameLogic.unlockedImagesCount) {
      gameLogic.setSelectedImageIndex(index);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-2 sm:py-4 px-2 sm:px-4 relative">
      <div className="max-w-7xl mx-auto space-y-2 sm:space-y-4">
        {/* Header */}
        <header className="text-center space-y-2 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {strategy.displayName} Guessr
            </h1>
            <ContentTypeSelector
              contentType={gameLogic.contentType}
              onChange={handleContentTypeChange}
              disabled={gameLogic.isLoadingAnime || gameLogic.isLoading}
            />
            <UniversalFilterPanel
              title={strategy.getFilterPanelTitle()}
              filterConfig={strategy.filterConfig}
              filters={
                gameLogic.contentType === 'anime'
                  ? filtersLogic.animeFilters
                  : gameLogic.contentType === 'movie'
                    ? filtersLogic.movieFilters
                    : filtersLogic.tvSeriesFilters
              }
              onFiltersChange={
                gameLogic.contentType === 'anime'
                  ? filtersLogic.handleAnimeFiltersChange
                  : gameLogic.contentType === 'movie'
                    ? filtersLogic.handleMovieFiltersChange
                    : filtersLogic.handleTVSeriesFiltersChange
              }
              dynamicOptionsLoader={strategy.getDynamicOptionsLoader?.()}
            />
          </div>
          <GameStats round={gameLogic.round} score={gameLogic.score} correctRounds={gameLogic.correctRounds} />
        </header>

        {/* Error Display */}
        {gameLogic.error && (
          <ErrorMessage message={gameLogic.error} onRetry={gameLogic.handleNextRound} />
        )}

        {/* Game Content */}
        {!gameLogic.error && (
          <div className="flex flex-col lg:grid lg:grid-cols-[minmax(150px,250px)_1fr_minmax(150px,250px)] gap-4 lg:gap-8 animate-fadeIn items-start w-full px-2 sm:px-4">
            {/* Left Column - Previous Attempts */}
            <div className="hidden lg:block space-y-2">
              {gameLogic.wrongAnswers.length > 0 && (
                <>
                  <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                    Previous Attempts
                  </h3>
                  <div className="space-y-1">
                    {gameLogic.wrongAnswers.map((answer, index) => (
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
            <div className="space-y-2 sm:space-y-3 w-full">
              {/* Image */}
              <AnimeImage
                src={gameLogic.displayImage}
                alt={strategy.questionText}
              />

              {/* Attempt indicators */}
              <AttemptIndicators
                maxAttempts={gameLogic.MAX_ATTEMPTS}
                currentImageIndex={gameLogic.selectedImageIndex}
                unlockedImagesCount={gameLogic.unlockedImagesCount}
                attempts={gameLogic.attempts}
                onImageSelect={handleImageSelect}
              />

              {/* Answer Input or Result */}
              {!gameLogic.isRoundComplete ? (
                <div className="space-y-2 sm:space-y-3">
                  <div className="text-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {strategy.questionText}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Attempt {gameLogic.attempts + 1} of {gameLogic.MAX_ATTEMPTS}
                      {gameLogic.unlockedImagesCount > 1 ? ` • Viewing screenshot ${gameLogic.selectedImageIndex + 1}` : ''}
                    </p>
                  </div>

                  <AnswerInput
                    onSubmit={gameLogic.handleSubmitAnswer}
                    disabled={gameLogic.isLoading}
                    contentType={gameLogic.contentType}
                  />

                  {/* Mobile Previous Attempts */}
                  {gameLogic.wrongAnswers.length > 0 && (
                    <div className="lg:hidden space-y-1">
                      <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                        Previous Attempts
                      </h3>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {gameLogic.wrongAnswers.map((answer, index) => (
                          <div
                            key={index}
                            className="px-2 py-1 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded text-xs border border-red-200 dark:border-red-900/30"
                          >
                            {answer || '(skipped)'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ResultDisplay
                  isCorrect={gameLogic.isCorrect || false}
                  correctName={gameLogic.currentAnime.name}
                  correctRussian={gameLogic.currentAnime.secondaryName}
                  animeUrl={gameLogic.currentAnime.url}
                  onNext={gameLogic.handleNextRound}
                  attempts={gameLogic.attempts}
                  maxAttempts={gameLogic.MAX_ATTEMPTS}
                  viewDetailsButtonText={strategy.viewDetailsButtonText}
                />
              )}
            </div>

            {/* Right Column - Empty for symmetry */}
            <div className="hidden lg:block"></div>
          </div>
        )}

        {/* Instructions */}
        {!gameLogic.isRoundComplete && !gameLogic.error && (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto animate-fadeIn px-2">
            <p className="hidden sm:block">
              You have {gameLogic.MAX_ATTEMPTS} attempts • Each attempt unlocks a new screenshot • Click dots to switch • Points: {gameLogic.MAX_ATTEMPTS - gameLogic.attempts}
            </p>
            <p className="sm:hidden">Attempt {gameLogic.attempts + 1}/{gameLogic.MAX_ATTEMPTS} • Points: {gameLogic.MAX_ATTEMPTS - gameLogic.attempts}</p>
          </div>
        )}

        {/* Reset Stats Button - Bottom Right */}
        <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-40">
          <button
            onClick={gameLogic.handleRestart}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-400 transition-all duration-200 cursor-pointer opacity-50 hover:opacity-100 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
            title="Reset statistics"
          >
            Reset Stats
          </button>
        </div>
      </div>

      {/* Loading Bar */}
      {gameLogic.isLoadingAnime && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 sm:h-1.5 bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div className="h-full shadow-lg shadow-blue-500/50 animate-loading-bar" />
        </div>
      )}
    </div>
  );
}
