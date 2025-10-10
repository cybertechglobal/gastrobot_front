'use client';
import { isIOS, isSafari } from '@/lib/utils/ios';
import { useEffect, useState, useCallback } from 'react';

const IOS_SNOOZE_KEY = 'ios_add_to_home_snooze_until';
const IOS_SNOOZE_MS = 5 * 24 * 60 * 60 * 1000; // 5 dana

function getIOSSnoozeUntil(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(IOS_SNOOZE_KEY);
  return raw ? Number(raw) : 0;
}

function setIOSSnooze(daysMs: number) {
  if (typeof window === 'undefined') return;
  const until = Date.now() + daysMs;
  localStorage.setItem(IOS_SNOOZE_KEY, String(until));
}

export function IOSAddToHome() {
  const [show, setShow] = useState(false);

  const isSnoozed = useCallback(() => {
    const until = getIOSSnoozeUntil();
    return until > Date.now();
  }, []);

  useEffect(() => {
    const shouldShow =
      isIOS() &&
      isSafari() &&
      !(window.navigator as any).standalone &&
      !isSnoozed();
    setShow(shouldShow);
  }, [isSnoozed]);

  const handleDismiss = () => {
    setIOSSnooze(IOS_SNOOZE_MS);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl shadow-lg px-4 py-3 bg-background border w-[min(560px,92vw)]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm flex-1">
          <div className="font-medium mb-1">Dodaj na početni ekran</div>
          <div className="opacity-70">
            Otvori <b>Share</b> meni (ikona kvadrata sa strelicom), pa izaberi{' '}
            <b>Add to Home Screen</b>.
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-lg leading-none opacity-60 hover:opacity-100 transition-opacity -mt-1"
          aria-label="Zatvori"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
