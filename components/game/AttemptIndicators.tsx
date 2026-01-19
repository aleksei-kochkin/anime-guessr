'use client';

interface AttemptIndicatorsProps {
  maxAttempts: number;
  currentImageIndex: number;
  unlockedImagesCount: number;
  attempts: number;
  onImageSelect: (index: number) => void;
}

export default function AttemptIndicators({
  maxAttempts,
  currentImageIndex,
  unlockedImagesCount,
  attempts,
  onImageSelect,
}: AttemptIndicatorsProps) {
  return (
    <div className="flex justify-center items-center gap-2">
      {Array.from({ length: maxAttempts }).map((_, index) => {
        const isUnlocked = index < unlockedImagesCount;
        const isCurrent = index === currentImageIndex;
        const isUsed = index < attempts;
        const isActive = index === attempts && attempts < maxAttempts;

        return (
          <button
            key={index}
            onClick={() => isUnlocked && onImageSelect(index)}
            disabled={!isUnlocked}
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all ${
              isUnlocked ? 'cursor-pointer' : 'cursor-default'
            } ${
              isUsed
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
  );
}
