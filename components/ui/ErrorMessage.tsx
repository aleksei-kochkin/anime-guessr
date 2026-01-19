import Button from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-6 text-center animate-fadeIn">
      <div className="text-red-700 dark:text-red-400 mb-2 text-4xl">⚠️</div>
      <p className="text-red-700 dark:text-red-400 mb-4 font-medium">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="lg">
          Try Again
        </Button>
      )}
    </div>
  );
}
