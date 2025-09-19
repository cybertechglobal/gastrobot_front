// hooks/useSocket.ts
'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getSocket } from '@/lib/socket';
import { useTabVisibility } from './useTabVisibility';
import { useNotifications } from './useNotifications';
import { NotificationItem } from '@/types/notifications';

export function useSocket() {
  const { data: session, status } = useSession();
  const { handleSocketNotification } = useNotifications();

  useTabVisibility();

  useEffect(() => {
    // Čekaj da se sesija učita
    if (status === 'loading') return;

    // Ako nema sesije, ne povezuj socket
    if (!session?.user?.id) {
      console.log('[WS] No userId from session, skipping socket connect.');
      return;
    }

    const userId = session.user.id;
    const restaurantId =
      session.user?.restaurantUsers[0]?.restaurantId || undefined;

    if (!restaurantId) {
      console.log(
        '[WS] No restaurantId from session, skipping socket connect.'
      );
      return;
    }

    const s = getSocket(userId, restaurantId);
    if (!s) return;

    const onConnect = () => {
      console.log(
        '[WS] Connected with userId:',
        userId,
        'restaurantId:',
        restaurantId
      );
    };

    const onHandleNotification = (msg: NotificationItem) => {
      switch (msg.type) {
        case 'order':
          onOrderNotification(msg);
          break;
        case 'reservation':
          onReservationNotification(msg);
          break;
        default:
          break;
      }
    };

    const onOrderNotification = (msg: NotificationItem) => {
      console.log('[WS] Order notification received:', msg);

      // Koristi hook umesto service
      handleSocketNotification({
        restaurantId,
        ...msg,
      });
    };

    const onReservationNotification = (msg: NotificationItem) => {
      console.log('[WS] Reservation notification received:', msg);

      // Koristi hook umesto service
      handleSocketNotification({
        restaurantId,
        ...msg,
      });
    };

    s.on('connect', onConnect);
    s.on('notification', onHandleNotification);

    s.connect();

    return () => {
      s.off('connect', onConnect);
      s.off('notification', onHandleNotification);
      s.disconnect();
      console.log('[WS] Socket disconnected cleanup.');
    };
  }, [session, status, handleSocketNotification]);
}
