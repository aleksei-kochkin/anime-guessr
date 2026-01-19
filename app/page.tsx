import { fetchRandomContent } from '@/lib/actions/anime';
import GameContainer from '@/components/game/GameContainer';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { UI_TEXT } from '@/lib/constants/game';
import { getErrorMessage } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let initialContent;
  let error: string | null = null;

  try {
    // Все настройки читаются из cookies внутри server action
    initialContent = await fetchRandomContent();
  } catch (err) {
    console.error('Failed to fetch initial content:', err);
    error = getErrorMessage(err) || UI_TEXT.ERRORS.FETCH_ANIME;
  }

  if (error || !initialContent) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md animate-fadeIn">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            {UI_TEXT.TITLE}
          </h1>
          <ErrorMessage message={error || UI_TEXT.ERRORS.GENERIC} />
        </div>
      </div>
    );
  }

  return <GameContainer initialAnime={initialContent} />;
}
