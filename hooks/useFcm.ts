'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { getMessagingIfSupported } from '@/lib/firebase';
import { useSession } from 'next-auth/react';
import { useNotifications } from './useNotifications';

async function ensureServiceWorker() {
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );
    console.log('[FCM] SW registered:', reg.scope);
    return reg;
  }
  return null;
}

export function useFcm(options: { auto?: boolean } = { auto: false }) {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const { status } = useSession();
  const { handleFCMNotification } = useNotifications();

  // Guard da backend registraciju ne pošaljemo više puta za isti token
  const lastSentTokenRef = useRef<string | null>(null);
  const sendingRef = useRef(false);

  const registerTokenToBackend = useCallback(async (t: string) => {
    if (!t) return;
    if (sendingRef.current) {
      console.log('[FCM] Skipping: already sending...');
      return;
    }
    if (lastSentTokenRef.current === t) {
      console.log('[FCM] Skipping: token already sent:', t);
      return;
    }

    sendingRef.current = true;
    try {
      console.log('[FCM] Sending token to backend:', t);
      const res = await fetch('/api/proxy/notifications/register-token', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t }),
      });
      console.log('[FCM] Backend response status:', res.status);
      if (res.ok) {
        lastSentTokenRef.current = t;
      }
    } catch (err) {
      console.error('[FCM] Failed to register token with backend:', err);
    } finally {
      sendingRef.current = false;
    }
  }, []);

  const requestPermissionAndToken = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window))
      return null;

    let perm = Notification.permission;
    if (perm === 'default' || perm === 'denied')
      perm = await Notification.requestPermission();
    setPermission(perm);
    console.log('[FCM] Permission:', perm);
    if (perm !== 'granted') return null;

    await ensureServiceWorker();
    const messaging = await getMessagingIfSupported();
    if (!messaging) return null;

    try {
      const t = await getToken(messaging);
      if (t) {
        console.log('[FCM] Token obtained:', t);
        setToken(t);
      } else {
        console.warn('[FCM] No token obtained.');
      }
      return t;
    } catch (e) {
      console.error('[FCM] getToken error:', e);
      return null;
    }
  }, []);

  // Jedan centralni efekat koji šalje token backendu kad se promeni
  useEffect(() => {
    if (token) registerTokenToBackend(token);
  }, [token, registerTokenToBackend]);

  // Automatski pokušaj na mount
  useEffect(() => {
    if (options.auto && status === 'authenticated') requestPermissionAndToken();
  }, [options.auto, requestPermissionAndToken, status]);

  // Foreground poruke - integrisano sa notification service
  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const messaging = await getMessagingIfSupported();
      if (!messaging) return;
      unsub = onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message:', payload);

        // Koristi hook umesto service
        handleFCMNotification(payload);
      });
    })();
    return () => unsub?.();
  }, [handleFCMNotification]);

  const deleteLocalFcmToken = useCallback(async () => {
    const messaging = await getMessagingIfSupported();
    if (messaging) {
      try {
        await deleteToken(messaging);
        console.log('[FCM] Local token deleted');
      } catch (e) {
        console.error('[FCM] deleteToken error:', e);
      }
    }
    setToken(null);
    lastSentTokenRef.current = null;
  }, []);

  return { token, permission, requestPermissionAndToken, deleteLocalFcmToken };
}
