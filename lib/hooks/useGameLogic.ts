// Hook for managing game logic
import { useState, useEffect, useMemo } from 'react';
import { fetchRandomContent, verifyAnswer } from '@/lib/actions/anime';
import { GameContent, ContentType } from '@/lib/types/game';
import { getErrorMessage } from '@/lib/utils/errors';

const MAX_ATTEMPTS = 6;

interface UseGameLogicProps {
  initialAnime: GameContent;
  initialContentType: ContentType;
}

export function useGameLogic({ initialAnime, initialContentType }: UseGameLogicProps) {
  const [currentAnime, setCurrentAnime] = useState<GameContent>(initialAnime);
  const [contentType, setContentType] = useState<ContentType>(initialContentType);
  const [attempts, setAttempts] = useState(0);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [round, setRound] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnime, setIsLoadingAnime] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Load statistics from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('anime-stats');
    if (savedStats) {
      try {
        const stats = JSON.parse(savedStats);
        setScore(stats.score || 0);
        setRound(stats.round || 1);
        setCorrectRounds(stats.correctRounds || 0);
      } catch (e) {
        console.error('Failed to parse saved stats:', e);
      }
    }
  }, []);

  // Save statistics
  useEffect(() => {
    localStorage.setItem('anime-stats', JSON.stringify({ score, round, correctRounds }));
  }, [score, round, correctRounds]);

  // All available images
  const availableImages = useMemo(() => {
    if (currentAnime.screenshots.length > 0) {
      return currentAnime.screenshots.slice(0, MAX_ATTEMPTS);
    }
    return [currentAnime.image];
  }, [currentAnime]);

  // Number of unlocked images
  const unlockedImagesCount = Math.min(attempts + 1, availableImages.length);

  // Current displayed image
  const displayImage = useMemo(() => {
    const imageIndex = Math.min(selectedImageIndex, unlockedImagesCount - 1);
    return availableImages[imageIndex];
  }, [availableImages, selectedImageIndex, unlockedImagesCount]);

  // Show new screenshot on new attempt
  useEffect(() => {
    if (attempts > 0 && attempts < MAX_ATTEMPTS) {
      setSelectedImageIndex(attempts);
    }
  }, [attempts]);

  // Preload next screenshot
  useEffect(() => {
    const nextIndex = unlockedImagesCount;
    if (nextIndex < availableImages.length && nextIndex < MAX_ATTEMPTS) {
      const img = new Image();
      img.src = availableImages[nextIndex];
    }
  }, [availableImages, unlockedImagesCount]);

  const handleSubmitAnswer = async (answer: string, contentId?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const correct = await verifyAnswer(
        answer,
        currentAnime.id,
        currentAnime.name,
        currentAnime.secondaryName,
        contentId,
        contentType
      );

      if (correct) {
        const pointsEarned = MAX_ATTEMPTS - attempts;
        setScore(prev => prev + pointsEarned);
        setCorrectRounds(prev => prev + 1);
        setIsCorrect(true);
      } else {
        setWrongAnswers(prev => [...prev, answer]);
        setAttempts(prev => prev + 1);
        setIsCorrect(false);

        if (attempts + 1 >= MAX_ATTEMPTS) {
          setIsRoundComplete(true);
        }
      }

      if (correct || attempts + 1 >= MAX_ATTEMPTS) {
        setIsRoundComplete(true);
      }
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to verify answer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setAttempts(MAX_ATTEMPTS);
    setIsRoundComplete(true);
    setIsCorrect(false);
  };

  const handleNextRound = async () => {
    setIsLoadingAnime(true);
    setError(null);

    try {
      const newContent = await fetchRandomContent(contentType);
      setCurrentAnime(newContent);
      setAttempts(0);
      setIsRoundComplete(false);
      setIsCorrect(null);
      setWrongAnswers([]);
      setRound(prev => prev + 1);
      setSelectedImageIndex(0);
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to load next round');
    } finally {
      setIsLoadingAnime(false);
    }
  };

  const loadNewContent = async (newContentType?: ContentType) => {
    setIsLoadingAnime(true);
    setError(null);

    try {
      const newContent = await fetchRandomContent(newContentType || contentType);
      setCurrentAnime(newContent);
      setAttempts(0);
      setIsRoundComplete(false);
      setIsCorrect(null);
      setWrongAnswers([]);
      setSelectedImageIndex(0);
      // Don't increment round
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to load content');
    } finally {
      setIsLoadingAnime(false);
    }
  };

  const handleRestart = () => {
    // Reset only statistics
    setScore(0);
    setRound(1);
    setCorrectRounds(0);
    localStorage.removeItem('anime-stats');
  };

  return {
    // State
    currentAnime,
    contentType,
    attempts,
    isRoundComplete,
    isCorrect,
    wrongAnswers,
    score,
    correctRounds,
    round,
    isLoading,
    isLoadingAnime,
    error,
    selectedImageIndex,
    availableImages,
    unlockedImagesCount,
    displayImage,
    MAX_ATTEMPTS,
    
    // Setters
    setContentType,
    setSelectedImageIndex,
    setError,
    
    // Handlers
    handleSubmitAnswer,
    handleSkip,
    handleNextRound,
    handleRestart,
    loadNewContent,
  };
}
