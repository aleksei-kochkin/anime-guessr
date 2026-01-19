'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchAnimeSuggestions } from '@/lib/actions/anime';
import { AnimeSearchResult, AnimeFilters } from '@/lib/types/anime';
import { GAME_CONFIG, UI_TEXT } from '@/lib/constants/game';
import Button from '@/components/ui/Button';

interface AnswerInputProps {
  onSubmit: (answer: string, animeId?: number) => void;
  disabled: boolean;
  filters?: AnimeFilters;
}

export default function AnswerInput({ onSubmit, disabled, filters }: AnswerInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<AnimeSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (input.trim().length < GAME_CONFIG.SEARCH_MIN_LENGTH) {
        setSuggestions([]);
        return;
      }

      try {
        const results = await fetchAnimeSuggestions(input, filters);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, GAME_CONFIG.SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer);
  }, [input, filters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled) {
      onSubmit(input.trim()); // Пустой ответ = пропуск попытки
      setInput('');
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelectSuggestion = (id: number, name: string, russian: string) => {
    const selectedName = russian || name;
    setInput('');
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    // Сразу отправляем ответ с ID
    onSubmit(selectedName, id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      handleSelectSuggestion(selected.id, selected.name, selected.russian);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={UI_TEXT.PLACEHOLDER}
          disabled={disabled}
          className="w-full px-3 py-2 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />

        <Button
          type="submit"
          disabled={disabled}
          variant="primary"
          size="sm"
          className="absolute right-1.5 top-1/2 -translate-y-1/2"
        >
          {input.trim() ? UI_TEXT.SUBMIT : 'Skip'}
        </Button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((anime, index) => (
            <button
              key={anime.id}
              onClick={() => handleSelectSuggestion(anime.id, anime.name, anime.russian)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer ${index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {anime.russian || anime.name}
              </div>
              {anime.russian && anime.name !== anime.russian && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {anime.name}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
