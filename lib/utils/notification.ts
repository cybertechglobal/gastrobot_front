// lib/utils/notifications.ts (ili dodaj u postojeći fajl)

import { NotificationItem } from '@/types/notifications';
import { format } from 'date-fns';
import { srLatn } from 'date-fns/locale';

export const formatNotificationBody = (
  body: NotificationItem['body']
): string => {
  if (!Array.isArray(body) || body.length === 0) {
    return 'Nova notifikacija';
  }

  const totalItems = body.reduce((sum, item) => sum + (item?.quantity || 0), 0);

  if (body.length === 1) {
    return `${body[0].quantity}x ${body[0].productName}`;
  } else if (body.length <= 3) {
    return body
      .map((item) => `${item.quantity}x ${item.productName}`)
      .join(', ');
  } else {
    const firstTwo = body
      .slice(0, 2)
      .map((item) => `${item.quantity}x ${item.productName}`)
      .join(', ');
    return `${firstTwo} i još ${body.length - 2} stavki (ukupno ${totalItems})`;
  }
};

export const formatReservationBody = (body: any) => {
  if (typeof body === 'object' && body !== null) {
    const { people, reservation, table, time } = body;

    // Formatiranje vremena pomoću date-fns
    const formatTime = (isoString: string) => {
      const date = new Date(isoString);
      return format(date, 'HH:mm, dd.MM.yyyy', { locale: srLatn });
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
};
