import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { UI_TEXT } from '@/lib/constants/game';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md animate-fadeIn">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
          {UI_TEXT.TITLE}
        </h1>
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {UI_TEXT.LOADING.ANIME}
          </p>
        </div>
      </div>
    </div>
  );
}
