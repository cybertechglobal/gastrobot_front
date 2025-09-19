// hooks/usePWAInstall.ts
'use client';

import { useEffect, useState, useCallback } from 'react';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BIPEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Chromium: hvatanje beforeinstallprompt
  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BIPEvent);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', onBIP as any);

    // App je već instalirana?
    const media = window.matchMedia('(display-mode: standalone)');
    const handleDM = () =>
      setIsInstalled(media.matches || (navigator as any).standalone === true);
    handleDM();
    media.addEventListener?.('change', handleDM);

    // Global event kad se instalira
    const onInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP as any);
      window.removeEventListener('appinstalled', onInstalled);
      media.removeEventListener?.('change', handleDM);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    // Po izboru možeš logovati analytics…
    setDeferredPrompt(null);
    setCanInstall(false);
  }, [deferredPrompt]);

  return { canInstall, promptInstall, isInstalled };
}
