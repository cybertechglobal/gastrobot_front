// hooks/useCleanup.ts
import { useNotificationStore } from '@/store/notificationStore';
import { useCallback } from 'react';

export function useCleanup() {
  const clearNotifications = useNotificationStore(state => state.clearAll);

  const disconnectSocket = useCallback(() => {
    try {
      // Get existing socket instance without creating new one
      const socket = (window as any).__socket_instance__;
      if (socket?.connected) {
        console.log('[Cleanup] Disconnecting socket...');
        socket.disconnect();
        // Clear the reference
        delete (window as any).__socket_instance__;
        console.log('[Cleanup] Socket disconnected');
      }
    } catch (error) {
      console.error('[Cleanup] Error disconnecting socket:', error);
    }
  }, []);

  const clearLocalStorage = useCallback(() => {
    try {
      // Lista ključeva koje treba obrisati
      const keysToRemove = [
        'notification-store',
        'fcm-token',
        'last-notification-check',
        'notification-permissions',
        // Dodaj ostale custom ključeve koje koristiš
      ];

      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`[Cleanup] Removed localStorage key: ${key}`);
        }
      });
    } catch (error) {
      console.error('[Cleanup] Error clearing localStorage:', error);
    }
  }, []);

  const clearCachedData = useCallback(() => {
    try {
      // Clear any cached API responses, images, etc.
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            if (cacheName.includes('user-specific') || cacheName.includes('notifications')) {
              caches.delete(cacheName);
              console.log(`[Cleanup] Cleared cache: ${cacheName}`);
            }
          });
        });
      }
    } catch (error) {
      console.error('[Cleanup] Error clearing cached data:', error);
    }
  }, []);

  const performCompleteCleanup = useCallback(async (fcmDeleteFunction?: () => Promise<void>) => {
    console.log('[Cleanup] Starting complete cleanup...');
    
    try {
      // 1. Disconnect socket if connected
      disconnectSocket();
      
      // 3. Delete local FCM token (passed from component that has access to useFcm)
      if (fcmDeleteFunction) {
        await fcmDeleteFunction();
      }
      
      // 4. Clear notification store
      clearNotifications();
      
      // 5. Clear localStorage
      clearLocalStorage();
      
      // 6. Clear cached data
      clearCachedData();
      
      console.log('[Cleanup] Complete cleanup finished successfully');
    } catch (error) {
      console.error('[Cleanup] Error during complete cleanup:', error);
    }
  }, [disconnectSocket, clearNotifications, clearLocalStorage, clearCachedData]);

  return {
    disconnectSocket,
    clearNotifications,
    clearLocalStorage,
    clearCachedData,
    performCompleteCleanup,
  };
}