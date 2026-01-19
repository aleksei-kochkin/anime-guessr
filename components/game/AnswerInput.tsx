'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchContentSuggestions } from '@/lib/actions/anime';
import { SearchResult, ContentType } from '@/lib/types/game';
import { GAME_CONFIG, UI_TEXT } from '@/lib/constants/game';
import { ContentStrategyFactory } from '@/lib/strategies';
import { getErrorMessage } from '@/lib/utils/errors';
import Button from '@/components/ui/Button';

interface AnswerInputProps {
  onSubmit: (answer: string, contentId?: number) => void;
  disabled: boolean;
  contentType: ContentType;
}

export default function AnswerInput({ onSubmit, disabled, contentType }: AnswerInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get strategy for current content type
  const strategy = ContentStrategyFactory.getStrategy(contentType);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (input.trim().length < GAME_CONFIG.SEARCH_MIN_LENGTH) {
        setSuggestions([]);
        setSearchError(null);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const results = await fetchContentSuggestions(input, contentType);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        const errorMessage = getErrorMessage(error);
        setSearchError(errorMessage || 'Failed to fetch suggestions');
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, GAME_CONFIG.SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer);
  }, [input, contentType]);

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
      setSearchError(null);
    }
  };

  const handleSelectSuggestion = (id: number, name: string, secondaryName: string) => {
    const selectedName = secondaryName || name;
    setInput('');
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setSearchError(null);
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
      handleSelectSuggestion(selected.id, selected.name, selected.secondaryName);
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
          placeholder={strategy.placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        />

        {isSearching && (
          <div className="absolute right-20 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

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

      {/* Search Error Display */}
      {searchError && (
        <div className="mt-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/40 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            {searchError}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            You can still type manually and submit.
          </p>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleSelectSuggestion(item.id, item.name, item.secondaryName)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer ${index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {item.secondaryName || item.name}
              </div>
              {item.secondaryName && item.name !== item.secondaryName && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.name}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
