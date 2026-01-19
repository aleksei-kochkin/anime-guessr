import { fetchRandomAnime } from '@/lib/actions/anime';
import GameContainer from '@/components/game/GameContainer';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { UI_TEXT } from '@/lib/constants/game';
import { getErrorMessage } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let initialAnime;
  let error: string | null = null;

  try {
    initialAnime = await fetchRandomAnime();
  } catch (err) {
    console.error('Failed to fetch initial anime:', err);
    error = getErrorMessage(err) || UI_TEXT.ERRORS.FETCH_ANIME;
  }

  if (error || !initialAnime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md animate-fadeIn">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            {UI_TEXT.TITLE}
          </h1>
          <ErrorMessage 
            message={error || UI_TEXT.ERRORS.GENERIC} 
            onRetry={() => window.location.reload()} 
          />
        </div>
      </div>
    );
  }

  return <GameContainer initialAnime={initialAnime} />;
}
