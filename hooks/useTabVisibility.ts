import { useNotificationStore } from '@/store/notificationStore';
import { useEffect } from 'react';

export function useTabVisibility() {
  const setTabFocused = useNotificationStore((state) => state.setTabFocused);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setTabFocused(!document.hidden);
    };

    const handleFocus = () => setTabFocused(true);
    const handleBlur = () => setTabFocused(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [setTabFocused]);
}