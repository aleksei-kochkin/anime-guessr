'use client';

import Button from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorMessage({ message, onRetry, showRetry = true }: ErrorMessageProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default behavior: reload page
      window.location.reload();
    }
  };

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-6 text-center animate-fadeIn">
      <div className="text-red-700 dark:text-red-400 mb-2 text-4xl">⚠️</div>
      <p className="text-red-700 dark:text-red-400 mb-4 font-medium">{message}</p>
      {showRetry && (
        <Button onClick={handleRetry} variant="danger" size="lg">
          Try Again
        </Button>
      )}
    </div>
  );
}
