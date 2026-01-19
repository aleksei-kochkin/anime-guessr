'use client';

import { useState, useEffect } from 'react';
import { FilterConfig } from '@/lib/strategies/ContentStrategy';
import Button from '@/components/ui/Button';

interface UniversalFilterPanelProps {
  title: string;
  filterConfig: FilterConfig[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFiltersChange: (filters: Record<string, any>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dynamicOptionsLoader?: (filterId: string) => Promise<Array<{ id: number | string;[key: string]: any }>>;
}

export default function UniversalFilterPanel({
  title,
  filterConfig,
  filters,
  onFiltersChange,
  dynamicOptionsLoader,
}: UniversalFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(filters);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, Array<{ value: number | string; label: string }>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Загружаем динамические опции при монтировании
  useEffect(() => {
    const loadDynamicOptions = async () => {
      if (!dynamicOptionsLoader) return;

      setIsLoading(true);
      setLoadError(null);
      const dynamicConfigs = filterConfig.filter(f => f.type === 'dynamic-buttons');

      try {
        for (const config of dynamicConfigs) {
          try {
            const data = await dynamicOptionsLoader(config.id);
            setDynamicOptions(prev => ({
              ...prev,
              [config.id]: data.map(item => ({
                value: item.id,
                label: item[config.id === 'with_origin_country' ? 'country' : 'genre'] || String(item.id),
              })),
            }));
          } catch (error) {
            console.error(`Error loading options for ${config.id}:`, error);
            setLoadError(`Failed to load ${config.id}. Some filters may be unavailable.`);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDynamicOptions();
  }, [filterConfig, dynamicOptionsLoader]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const handleButtonMultiToggle = (filterId: string, value: string) => {
    const currentValues = localFilters[filterId] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];
    setLocalFilters({ ...localFilters, [filterId]: newValues.length > 0 ? newValues : undefined });
  };

  const handleButtonSingleToggle = (filterId: string, value: number | string) => {
    const currentValue = localFilters[filterId]?.[0];
    setLocalFilters({
      ...localFilters,
      [filterId]: currentValue === value ? undefined : [value],
    });
  };

  const handleSliderChange = (filterId: string, value: string) => {
    const numValue = value ? parseFloat(value) : 0;
    const newFilters = { ...localFilters };
    if (numValue === 0) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = numValue;
    }
    setLocalFilters(newFilters);
  };

  const handleTextChange = (filterId: string, value: string) => {
    setLocalFilters({ ...localFilters, [filterId]: value || undefined });
  };

  const handleNumberRangeChange = (filterId: string, type: 'from' | 'to', value: string) => {
    const key = type === 'from' ? `${filterId}From` : `${filterId}To`;
    setLocalFilters({
      ...localFilters,
      [key]: value ? parseInt(value) : undefined,
    });
  };

  const handleSelectChange = (filterId: string, value: string) => {
    setLocalFilters({ ...localFilters, [filterId]: value || undefined });
  };

  const renderFilter = (config: FilterConfig) => {
    switch (config.type) {
      case 'button-multi':
        return (
          <div key={config.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {config.label}
            </label>
            <div className="flex flex-wrap gap-2">
              {config.options?.map(option => (
                <Button
                  key={option.value}
                  onClick={() => handleButtonMultiToggle(config.id, String(option.value))}
                  variant={localFilters[config.id]?.includes(String(option.value)) ? 'filter-active' : 'filter'}
                  size="md"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'dynamic-buttons':
        const options = dynamicOptions[config.id] || [];

        return (
          <div key={config.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {config.label}
            </label>
            <div className="max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {options.slice(0, config.id === 'with_origin_country' ? 30 : undefined).map(option => (
                  <Button
                    key={option.value}
                    onClick={() => handleButtonSingleToggle(config.id, option.value)}
                    variant={localFilters[config.id]?.includes(option.value) ? 'filter-active' : 'filter'}
                    size="md"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'slider':
        return (
          <div key={config.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {config.label}: {localFilters[config.id] || config.min || 0} {localFilters[config.id] === undefined && '(not set)'}
            </label>
            <div className="relative">
              <input
                type="range"
                min={config.min || 0}
                max={config.max || 10}
                step={config.step || 1}
                value={localFilters[config.id] || config.min || 0}
                onChange={(e) => handleSliderChange(config.id, e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:bg-blue-700 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:bg-blue-700"
                style={{
                  background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${((localFilters[config.id] || config.min || 0) / (config.max || 10)) * 100}%, rgb(229, 231, 235) ${((localFilters[config.id] || config.min || 0) / (config.max || 10)) * 100}%, rgb(229, 231, 235) 100%)`
                }}
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={config.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {config.label}
            </label>
            <input
              type="text"
              value={localFilters[config.id] || ''}
              onChange={(e) => handleTextChange(config.id, e.target.value)}
              placeholder={config.placeholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'number-range':
        return (
          <div key={config.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {config.label}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={localFilters[`${config.id}From`] || ''}
                onChange={(e) => handleNumberRangeChange(config.id, 'from', e.target.value)}
                placeholder="From"
                className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={localFilters[`${config.id}To`] || ''}
                onChange={(e) => handleNumberRangeChange(config.id, 'to', e.target.value)}
                placeholder="To"
                className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={config.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {config.label}
            </label>
            <select
              value={localFilters[config.id] || ''}
              onChange={(e) => handleSelectChange(config.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {config.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
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
                  {title}
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

              {loadError && (
                <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/40 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    {loadError}
                  </p>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading filters...</div>
              ) : (
                filterConfig.map(config => renderFilter(config))
              )}

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
