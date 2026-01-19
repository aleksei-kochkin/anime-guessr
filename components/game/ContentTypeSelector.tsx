'use client';

import { ContentType } from '@/lib/types/game';

interface ContentTypeSelectorProps {
  contentType: ContentType;
  onChange: (type: ContentType) => void;
  disabled?: boolean;
}

export default function ContentTypeSelector({ contentType, onChange, disabled }: ContentTypeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1 gap-1">
      <button
        onClick={() => onChange('anime')}
        disabled={disabled}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          contentType === 'anime'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        Anime
      </button>
      <button
        onClick={() => onChange('movie')}
        disabled={disabled}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          contentType === 'movie'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        Movies
      </button>
      <button
        onClick={() => onChange('tv')}
        disabled={disabled}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          contentType === 'tv'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        TV Series
      </button>
    </div>
  );
}
