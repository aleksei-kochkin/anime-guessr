'use client';

import { useState, useEffect } from 'react';
import { AnimeFilters } from '@/lib/types/anime';
import { FILTER_OPTIONS } from '@/lib/constants/game';
import Button from '@/components/ui/Button';

interface FilterPanelProps {
  filters: AnimeFilters;
  onFiltersChange: (filters: AnimeFilters) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<AnimeFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleToggleKind = (kind: string) => {
    const currentKinds = localFilters.kind || [];
    const newKinds = currentKinds.includes(kind)
      ? currentKinds.filter(k => k !== kind)
      : [...currentKinds, kind];
    setLocalFilters({ ...localFilters, kind: newKinds.length > 0 ? newKinds : undefined });
  };

  const handleToggleStatus = (status: string) => {
    const currentStatuses = localFilters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    setLocalFilters({ ...localFilters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleToggleRating = (rating: string) => {
    const currentRatings = localFilters.rating || [];
    const newRatings = currentRatings.includes(rating)
      ? currentRatings.filter(r => r !== rating)
      : [...currentRatings, rating];
    setLocalFilters({ ...localFilters, rating: newRatings.length > 0 ? newRatings : undefined });
  };

  const handleSeasonChange = (value: string) => {
    setLocalFilters({ ...localFilters, season: value || undefined });
  };

  const handleScoreChange = (value: string) => {
    const score = value ? parseFloat(value) : 0;
    // Если score === 0, удаляем фильтр (не применяем)
    const newFilters = { ...localFilters };
    if (score === 0) {
      delete newFilters.score;
    } else {
      newFilters.score = score;
    }
    setLocalFilters(newFilters);
  };

  const handleDurationChange = (value: string) => {
    setLocalFilters({ ...localFilters, duration: value || undefined });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const emptyFilters: AnimeFilters = {};
    setLocalFilters(emptyFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant={hasActiveFilters ? 'primary' : 'ghost'}
        size="lg"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="bg-white text-blue-600 rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {Object.keys(filters).length}
            </span>
          )}
        </span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-[calc(100vw-1rem)] sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Anime Filters
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.kind.map(option => (
                    <Button
                      key={option.value}
                      onClick={() => handleToggleKind(option.value)}
                      variant={localFilters.kind?.includes(option.value) ? 'filter-active' : 'filter'}
                      size="md"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.status.map(option => (
                    <Button
                      key={option.value}
                      onClick={() => handleToggleStatus(option.value)}
                      variant={localFilters.status?.includes(option.value) ? 'filter-active' : 'filter'}
                      size="md"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age Rating
                </label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_OPTIONS.rating.map(option => (
                    <Button
                      key={option.value}
                      onClick={() => handleToggleRating(option.value)}
                      variant={localFilters.rating?.includes(option.value) ? 'filter-active' : 'filter'}
                      size="md"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Season Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Season (e.g., &quot;2020_2024&quot;, &quot;summer_2023&quot;)
                </label>
                <input
                  type="text"
                  value={localFilters.season || ''}
                  onChange={(e) => handleSeasonChange(e.target.value)}
                  placeholder="e.g., 2020_2024"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Score Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Score: {localFilters.score || 0} {localFilters.score === undefined && '(not set)'}
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="9"
                    step="1"
                    value={localFilters.score || 0}
                    onChange={(e) => handleScoreChange(e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:bg-blue-700 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:bg-blue-700"
                    style={{
                      background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${((localFilters.score || 0) / 9) * 100}%, rgb(229, 231, 235) ${((localFilters.score || 0) / 10) * 100}%, rgb(229, 231, 235) 100%)`
                    }}
                  />
                </div>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Episode Duration
                </label>
                <select
                  value={localFilters.duration || ''}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Any</option>
                  {FILTER_OPTIONS.duration.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleReset} variant="secondary" size="lg" fullWidth>
                  Reset
                </Button>
                <Button onClick={handleApply} variant="primary" size="lg" fullWidth>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
