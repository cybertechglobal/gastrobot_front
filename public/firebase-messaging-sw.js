/* global self, importScripts */
importScripts(
  'https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: 'AIzaSyDA4c2nQrJM4XkfWUB397x8Uk63N3ugl6Y',
  authDomain: 'gastrobot-5bc84.firebaseapp.com',
  projectId: 'gastrobot-5bc84',
  storageBucket: 'gastrobot-5bc84.firebasestorage.app',
  messagingSenderId: '977838903383',
  appId: '1:977838903383:web:4e98ed74bcbec1158e5312',
  measurementId: 'G-FN97QSKL8E',
});

function formatOrderBody(body) {
  console.log('[FCM-SW] Raw body:', body, typeof body);

  // Ako je body string, pokušaj da ga parsiraš
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      console.log('[FCM-SW] Parsed body:', parsed);
      if (Array.isArray(parsed)) {
        return formatOrderArray(parsed);
      }
      return body;
    } catch (error) {
      console.log('[FCM-SW] Failed to parse body as JSON:', error);
      return body;
    }
  }

  // Ako je body array, direktno formatuj
  if (Array.isArray(body)) {
    return formatOrderArray(body);
  }

  return 'Novi order';
}

function formatOrderArray(products) {
  console.log('[FCM-SW] Formatting products:', products);

  if (!Array.isArray(products) || products.length === 0) {
    return 'Novi order';
  }

  const totalItems = products.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  if (products.length === 1) {
    // Jedan proizvod
    return `${products[0].quantity}x ${products[0].productName}`;
  } else if (products.length <= 3) {
    // Do 3 proizvoda - prikaži sve
    return products
      .map((item) => `${item.quantity}x ${item.productName}`)
      .join(', ');
  } else {
    // Više od 3 proizvoda - prikaži prva 2 + "i još X"
    const firstTwo = products
      .slice(0, 2)
      .map((item) => `${item.quantity}x ${item.productName}`)
      .join(', ');
    return `${firstTwo} i još ${
      products.length - 2
    } stavki (ukupno ${totalItems})`;
  }
}

function formatReservationBody(body) {
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      return formatReservationObject(parsed);
    } catch {
      return body;
    }
  }

  if (typeof body === 'object' && body !== null) {
    return formatReservationObject(body);
  }

  return 'Nova rezervacija';
}

function formatReservationObject(reservation) {
  const { people, reservation: reservationName, table, time } = reservation;

  // Jednostavno formatiranje vremena (bez date-fns)
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes}, ${day}.${month}.${year}`;
  };

  let reservationText = '';

  if (people) {
    const peopleText = people === 1 ? 'osoba' : people < 5 ? 'osobe' : 'osoba';
    reservationText += `${people} ${peopleText}`;
  }

  if (time) {
    const formattedTime = formatTime(time);
    reservationText += reservationText ? ` - ${formattedTime}` : formattedTime;
  }

  if (table && table !== 'N/A') {
    reservationText += ` (Sto ${table})`;
  }

  if (reservationName) {
    reservationText += ` [${reservationName}]`;
  }

  return reservationText || 'Nova rezervacija';
}

// Pozadina: kad je tab zatvoren ili u backgroundu
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[FCM-SW] Background message received:', payload);

  const type = payload.data?.type;
  const title =
    type === 'reservation'
      ? 'Nova Rezervacija'
      : payload.data?.title ||
        payload.notification?.title ||
        'Nova notifikacija';
  const body =
    payload.data?.body ||
    payload.notification?.body ||
    'Imate novu notifikaciju';
  const icon = payload.notification?.icon || '/web-app-manifest-192x192.png';

  // Formatiraj body na osnovu tipa
  let formattedBody = body;

  try {
    if (type === 'order') {
      formattedBody = formatOrderBody(body);
    } else if (type === 'reservation') {
      formattedBody = formatReservationBody(body);
    }
  } catch (error) {
    console.log('[FCM-SW] Error formatting body:', error);
  }

  const notificationTitle = `${title}`;

  const notificationOptions = {
    body: formattedBody,
    icon: icon,
    badge: '/web-app-manifest-192x192.png',
    data: {
      ...payload.data,
      timestamp: Date.now(),
    },
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[FCM-SW] Notification clicked:', event.notification);
  event.notification.close();

  const data = event.notification.data || {};
  let url = '/';

  // ISPRAVKA: Koristi redirect parametar za middleware
  if (data.type === 'order' && data.entityId) {
    const targetUrl = `/orders?orderId=${data.entityId}`;
    url = `/?redirect=${encodeURIComponent(targetUrl)}`;
  } else if (data.type === 'reservation' && data.entityId) {
    const targetUrl = `/reservations?reservationId=${data.entityId}`;
    url = `/?redirect=${encodeURIComponent(targetUrl)}`;
  }

  console.log('[FCM-SW] Opening URL:', url);

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Pokušaj da fokusiraš postojeći tab sa istim origin-om
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => client.navigate(url));
        }
      }
      // Ako nije, otvori novi tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
