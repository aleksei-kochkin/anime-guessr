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
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
