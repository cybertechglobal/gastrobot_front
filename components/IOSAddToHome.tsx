'use client';
import { isIOS, isSafari } from '@/lib/utils/ios';
import { useEffect, useState } from 'react';

export function IOSAddToHome() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const shouldShow =
      isIOS() && isSafari() && !(window.navigator as any).standalone;
    setShow(shouldShow);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl shadow-lg px-4 py-3 bg-background border w-[min(560px,92vw)]">
      <div className="text-sm">
        <div className="font-medium mb-1">Dodaj na početni ekran</div>
        <div className="opacity-70">
          Otvori <b>Share</b> meni (ikona kvadrata sa strelicom), pa izaberi{' '}
          <b>Add to Home Screen</b>.
        </div>
      </div>
    </div>
  );
}
