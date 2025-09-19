import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/store/notificationStore';
import { toast } from 'sonner';
import { NotificationItem } from '@/types/notifications';
import { useRouter } from 'next/navigation';
import { markNotificationAsRead } from '@/lib/api/notifications';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioInitialized = useRef(false);
  const router = useRouter();

  // Inicijalizuj audio
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio('/sounds/notification.wav');
      audioRef.current.volume = 0.5;
      audioRef.current.preload = 'auto';
    }
  }, []);

  // Inicijalizuj audio na prvi user interaction
  const initializeAudio = useCallback(() => {
    if (!isAudioInitialized.current && audioRef.current) {
      // "Preload" audio sa tišinom da bi browser dozvolio puštanje
      audioRef.current.muted = true;
      audioRef.current
        .play()
        .then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
          audioRef.current!.muted = false;
          isAudioInitialized.current = true;
          console.log('[Notifications] Audio initialized');
        })
        .catch(() => {
          console.log('[Notifications] Could not initialize audio');
        });
    }
  }, []);

  // Dodaj event listenere za prvi user interaction
  useEffect(() => {
    const events = ['click', 'keydown', 'touchstart'];

    events.forEach((event) => {
      document.addEventListener(event, initializeAudio, { once: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, initializeAudio);
      });
    };
  }, [initializeAudio]);

  const invalidateQueries = useCallback(
    (type: string) => {
      if (type === 'order') {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      } else if (type === 'reservation') {
        queryClient.invalidateQueries({ queryKey: ['reservations'] });
      }

      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    [queryClient]
  );

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      try {
        await markNotificationAsRead(id);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [queryClient]
  );

  const handleNotificationClick = useCallback(
    (notification: any, isPushNotification: boolean = false) => {
      if (!notification.isSeen) {
        handleMarkAsRead(notification.id);
      }

      // Navigate based on type
      if (notification.type === 'order') {
        const orderUrl = `/orders?orderId=${notification.entityId}`;

        if (isPushNotification) {
          // Za push notifikacije - otvori novi tab/window sa redirect parametrima
          const pushUrl = `${
            window.location.origin
          }/?redirect=${encodeURIComponent(orderUrl)}`;
          window.open(pushUrl, '_blank');
        } else {
          // Za toast notifikacije - normalan router push
          router.push(orderUrl);
        }
      } else if (notification.type === 'reservation') {
        console.log('Navigate to reservation:', notification);
        console.log('Navigate to reservation:', window.location.origin);
        const reservationUrl = `/reservations?reservationId=${notification.entityId}`;

        if (isPushNotification) {
          // Za push notifikacije - otvori novi tab/window sa redirect parametrima
          const pushUrl = `${
            window.location.origin
          }/?redirect=${encodeURIComponent(reservationUrl)}`;
          window.open(pushUrl, '_blank');
        } else {
          // Za toast notifikacije - normalan router push
          router.push(reservationUrl);
        }
      }
    },
    [handleMarkAsRead, router]
  );

  const playNotificationSound = useCallback(async () => {
    if (audioRef.current && isAudioInitialized.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }
    }
  }, []);

  // Funkcija za formatiranje order proizvoda
  const formatOrderBody = useCallback((body: any) => {
    if (Array.isArray(body)) {
      const totalItems = body.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );

      if (body.length === 1) {
        // Jedan proizvod
        return `${body[0].quantity}x ${body[0].productName}`;
      } else if (body.length <= 3) {
        // Do 3 proizvoda - prikaži sve
        return body
          .map((item: any) => `${item.quantity}x ${item.productName}`)
          .join(', ');
      } else {
        // Više od 3 proizvoda - prikaži prva 2 + "i još X"
        const firstTwo = body
          .slice(0, 2)
          .map((item: any) => `${item.quantity}x ${item.productName}`)
          .join(', ');
        return `${firstTwo} i još ${
          body.length - 2
        } stavki (ukupno ${totalItems})`;
      }
    }

    // Fallback za string ili ostalo
    return typeof body === 'string' ? body : 'Novi order';
  }, []);

  const formatReservationBody = useCallback((body: any) => {
    if (typeof body === 'object' && body !== null) {
      const { people, reservation, table, time } = body;

      // Formatiranje vremena pomoću date-fns
      const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return format(date, 'HH:mm, dd.MM.yyyy', { locale: sr });
      };

      // Kreiranje osnovnog teksta rezervacije
      let reservationText = '';

      if (people) {
        reservationText += `${people} ${
          people === 1 ? 'osoba' : people < 5 ? 'osobe' : 'osoba'
        }`;
      }

      if (time) {
        const formattedTime = formatTime(time);
        reservationText += reservationText
          ? ` - ${formattedTime}`
          : formattedTime;
      }

      if (table && table !== 'N/A') {
        reservationText += ` (Sto ${table})`;
      }

      if (reservation) {
        reservationText += ` [${reservation}]`;
      }

      return reservationText || 'Nova rezervacija';
    }

    // Fallback za string ili ostalo
    return typeof body === 'string' ? body : 'Nova rezervacija';
  }, []);

  const handleSocketNotification = useCallback(
    async (
      data: NotificationItem & {
        restaurantId: string;
      }
    ) => {
      const { isTabFocused, soundEnabled } = useNotificationStore.getState();

      console.log(
        '[useNotifications] Handling socket notification, tab focused:',
        isTabFocused
      );

      // Invalidiraj queries
      invalidateQueries(data.type);

      // Pusti zvuk ako je omogućen
      if (soundEnabled) {
        await playNotificationSound();
      }

      // Formatiraj poruku na osnovu tipa
      let displayMessage = '';
      if (data.type === 'order') {
        displayMessage = formatOrderBody(data.body);
      } else if (data.type === 'reservation') {
        displayMessage = formatReservationBody(data.body);
      }

      const titleWithTable =
        data.type === 'order' ? `${data.title}` : 'Nova Rezervacija';

      if (isTabFocused) {
        // Tab je fokusiran - prikaži toast
        toast(titleWithTable, {
          description: displayMessage,
          action: {
            label: 'Pogledaj',
            onClick: () => handleNotificationClick(data),
          },
          duration: data.type === 'order' ? 16000 : 15000, // Order duže traje
        });
      } else {
        // Tab NIJE fokusiran - prikaži browser push notifikaciju
        if (Notification.permission === 'granted') {
          const notification = new Notification(titleWithTable, {
            body: displayMessage,
            icon: '/favicon.ico',
            silent: true,
            requireInteraction: false,
          });

          notification.onclick = () => {
            window.focus();
            handleNotificationClick(data, true);
            notification.close();
          };
        }
      }
    },
    [
      invalidateQueries,
      playNotificationSound,
      formatOrderBody,
      formatReservationBody,
      handleNotificationClick,
    ]
  );

  const handleFCMNotification = useCallback(
    async (payload: any) => {
      const { isTabFocused, soundEnabled } = useNotificationStore.getState();

      console.log('[useNotifications] Handling FCM notification:', payload);

      // FCM podaci mogu biti u data objektu
      const title =
        payload.data?.title ||
        payload.notification?.title ||
        'Nova notifikacija';
      const body = payload.data?.body || payload.notification?.body || '';
      const type = payload.data?.type || 'order';

      // Formatiraj body - pokušaj da parsiraš JSON string
      let formattedBody = body;
      try {
        const parsedBody = JSON.parse(body);
        if (Array.isArray(parsedBody)) {
          formattedBody = formatOrderBody(parsedBody);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Body nije JSON, ostavi kao string
        formattedBody =
          body || (type === 'order' ? 'Novi order' : 'Nova rezervacija');
      }

      // Title već sadrži table info, ne dodavaj duplo
      const finalTitle = title;

      const data = {
        type,
        title: finalTitle,
        body: formattedBody,
        data: payload.data,
        restaurantId: payload.data?.restaurantId || '',
      };

      // Invalidiraj queries
      invalidateQueries(type);

      // Pusti zvuk ako je omogućen i tab je fokusiran
      if (soundEnabled && isTabFocused) {
        await playNotificationSound();
      }

      // Prikaži toast samo ako je tab fokusiran
      if (isTabFocused) {
        toast(finalTitle, {
          description: formattedBody,
          action: {
            label: 'Pogledaj',
            onClick: () => handleNotificationClick(data),
          },
          duration: type === 'order' ? 6000 : 5000,
        });
      }

      console.log('[useNotifications] FCM notification processed');
    },
    [
      invalidateQueries,
      formatOrderBody,
      playNotificationSound,
      handleNotificationClick,
    ]
  );

  return {
    handleSocketNotification,
    handleFCMNotification,
    initializeAudio,
  };
};
