// utils/cleanupUtils.ts
import { signOut } from 'next-auth/react';
import { deleteToken } from 'firebase/messaging';
import { getMessagingIfSupported } from '@/lib/firebase';

// Disconnects socket without hooks
export function disconnectSocket() {
  try {
    const socket = (window as any).__socket_instance__;
    if (socket?.connected) {
      console.log('[Cleanup] Disconnecting socket...');
      socket.disconnect();
      delete (window as any).__socket_instance__;
      console.log('[Cleanup] Socket disconnected');
    }
  } catch (error) {
    console.error('[Cleanup] Error disconnecting socket:', error);
  }
}

// Clear localStorage without hooks
export function clearLocalStorage() {
  try {
    const keysToRemove = [
      'notification-store',
      'fcm-token',
      'last-notification-check',
      'notification-permissions',
    ];

    keysToRemove.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`[Cleanup] Removed localStorage key: ${key}`);
      }
    });
  } catch (error) {
    console.error('[Cleanup] Error clearing localStorage:', error);
  }
}

// Delete FCM token without hooks
export async function deleteLocalFcmToken() {
  try {
    const messaging = await getMessagingIfSupported();
    if (messaging) {
      await deleteToken(messaging);
      console.log('[Cleanup] Local FCM token deleted');
    }
  } catch (error) {
    console.error('[Cleanup] Error deleting FCM token:', error);
  }
}

// Complete cleanup for non-hook usage
export async function performCleanupForNonHooks() {
  console.log('[Cleanup] Starting cleanup for non-hook context...');

  try {
    disconnectSocket();
    clearLocalStorage();
    await deleteLocalFcmToken();

    console.log('[Cleanup] Non-hook cleanup completed');
  } catch (error) {
    console.error('[Cleanup] Error during non-hook cleanup:', error);
  }
}

// Signout with cleanup for non-hook contexts
export async function signoutWithCleanup(options?: {
  redirect?: boolean;
  callbackUrl?: string;
}) {
  try {
    console.log('[Signout] Starting signout process...');

    // 1. Perform cleanup
    await performCleanupForNonHooks();

    // 2. NextAuth signout
    if (options?.redirect === false) {
      await signOut({ redirect: false });
      // Manual navigation ako je potrebno
      if (options?.callbackUrl && typeof window !== 'undefined') {
        window.location.href = options.callbackUrl;
      }
    } else {
      await signOut({
        redirect: true,
        callbackUrl: options?.callbackUrl ?? '/login',
      });
    }

    console.log('[Signout] Signout completed');
  } catch (error) {
    console.error('[Signout] Error during signout:', error);
    // Fallback signout
    if (options?.redirect === false) {
      await signOut({ redirect: false });
      if (options?.callbackUrl && typeof window !== 'undefined') {
        window.location.href = options.callbackUrl;
      }
    } else {
      await signOut({
        redirect: true,
        callbackUrl: options?.callbackUrl ?? '/login',
      });
    }
  }
}
