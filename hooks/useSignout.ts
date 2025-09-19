import { signOut } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCleanup } from './useCleanup';
import { useFcm } from './useFcm';
import { useRouter } from 'next/navigation';

export function useSignout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { performCompleteCleanup } = useCleanup();
  const { deleteLocalFcmToken } = useFcm();

  const performSignout = async (options?: { 
    redirect?: boolean;
    callbackUrl?: string;
  }) => {
    try {
      console.log('[Signout] Starting signout process...');
      
      // 1. Cleanup sve ressurse (predaj FCM delete funkciju)
      await performCompleteCleanup(deleteLocalFcmToken);
      
      // 2. Clear React Query cache
      queryClient.clear();
      
      // 3. NextAuth signout
      if (options?.redirect === false) {
        await signOut({ redirect: false });
        if (options?.callbackUrl) {
          router.push(options.callbackUrl);
        }
      } else {
        await signOut({ 
          redirect: true,
          callbackUrl: options?.callbackUrl ?? '/login'
        });
      }
      
      console.log('[Signout] Signout completed');
    } catch (error) {
      console.error('[Signout] Error during signout:', error);
      // Fallback signout čak i ako cleanup ne uspe
      if (options?.redirect === false) {
        await signOut({ redirect: false });
        if (options?.callbackUrl) {
          router.push(options.callbackUrl);
        }
      } else {
        await signOut({ 
          redirect: true,
          callbackUrl: options?.callbackUrl ?? '/login'
        });
      }
    }
  };

  return { signout: performSignout };
}