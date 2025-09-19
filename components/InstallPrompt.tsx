// 'use client';
// import React, { useEffect, useState } from 'react';

// const InstallPrompt = () => {
//   const [isIOS, setIsIOS] = useState(false);
//   const [isStandalone, setIsStandalone] = useState(false);
//   const [deferredPrompt, setDeferredPrompt] = useState(null);
//   const [isDismissed, setIsDismissed] = useState(false);

//   useEffect(() => {
//     setIsIOS(
//       /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
//     );
//     setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

//     // Proveri da li je korisnik već odbacio poruku
//     const dismissed = localStorage.getItem('installPromptDismissed');
//     setIsDismissed(dismissed === 'true');
//   }, []);

//   useEffect(() => {
//     const handler = (e) => {
//       e.preventDefault();
//       setDeferredPrompt(e);
//       console.log('Install prompt ready');
//     };
//     window.addEventListener('beforeinstallprompt', handler);
//     return () => window.removeEventListener('beforeinstallprompt', handler);
//   }, []);

//   const handleInstallClick = async () => {
//     if (deferredPrompt) {
//       deferredPrompt.prompt();
//       const choiceResult = await deferredPrompt.userChoice;
//       if (choiceResult.outcome === 'accepted') {
//         console.log('User accepted the install prompt');
//         // Sakri prompt nakon uspešne instalacije
//         handleDismiss();
//       } else {
//         console.log('User dismissed the install prompt');
//       }
//       setDeferredPrompt(null);
//     }
//   };

//   // Funkcija za restart listening-a (opciono za debug)
//   const checkInstallability = () => {
//     // Možeš dodati logiku da ponovo proveriš uslove
//     console.log('Checking PWA installability...');
//     console.log('Current deferredPrompt:', deferredPrompt);
//     console.log('Is standalone:', isStandalone);

//     // Browser će automatski pozvati beforeinstallprompt kada uslovi budu ispunjeni
//   };

//   const handleDismiss = () => {
//     // Sačuvaj u localStorage da je korisnik odbacio poruku
//     localStorage.setItem('installPromptDismissed', 'true');
//     setIsDismissed(true);
//   };

//   // Ne prikazuj ako je:
//   // 1. Aplikacija već instalirana (standalone mode)
//   // 2. Korisnik je već odbacio poruku
//   if (isStandalone || isDismissed) {
//     return null;
//   }

//   return (
//     <div style={{
//       position: 'relative',
//       padding: '16px',
//       border: '1px solid #ccc',
//       borderRadius: '8px',
//       backgroundColor: '#f9f9f9',
//       margin: '10px 0'
//     }}>
//       {/* X dugme za zatvaranje */}
//       <button
//         onClick={handleDismiss}
//         style={{
//           position: 'absolute',
//           top: '8px',
//           right: '8px',
//           background: 'none',
//           border: 'none',
//           fontSize: '18px',
//           cursor: 'pointer',
//           color: '#666'
//         }}
//         aria-label="Dismiss install prompt"
//       >
//         ✕
//       </button>

//       <h3 style={{ marginTop: '0' }}>Install App</h3>

//       {!isIOS && (
//         <div>
//           <button
//             onClick={handleInstallClick}
//             disabled={!deferredPrompt}
//             style={{
//               padding: '10px 20px',
//               backgroundColor: deferredPrompt ? '#007bff' : '#ccc',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: deferredPrompt ? 'pointer' : 'not-allowed',
//               marginRight: '10px'
//             }}
//           >
//             {deferredPrompt ? 'Add to Home Screen' : 'Checking availability...'}
//           </button>

//           {/* Debug dugme - možeš ukloniti u produkciji */}
//           <button
//             onClick={checkInstallability}
//             style={{
//               padding: '8px 16px',
//               backgroundColor: '#6c757d',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               fontSize: '12px'
//             }}
//           >
//             Check Status
//           </button>

//           {!deferredPrompt && (
//             <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
//               PWA install will be available when conditions are met (HTTPS, manifest, service worker)
//             </p>
//           )}
//         </div>
//       )}

//       {isIOS && (
//         <p>
//           To install this app on your iOS device, tap the share button
//           <span role="img" aria-label="share icon">
//             {' '}
//             ⎋{' '}
//           </span>
//           and then &quot;Add to Home Screen&quot;
//           <span role="img" aria-label="plus icon">
//             {' '}
//             ➕{' '}
//           </span>
//           .
//         </p>
//       )}
//     </div>
//   );
// };

// export default InstallPrompt;

// components/InstallPrompt.tsx
// components/InstallPrompt.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const SNOOZE_KEY = 'pwa_install_snooze_until';
const SNOOZE_MS = 2 * 24 * 60 * 60 * 1000; // 2 dana

function getSnoozeUntil(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(SNOOZE_KEY);
  return raw ? Number(raw) : 0;
}

function setSnooze(daysMs: number) {
  if (typeof window === 'undefined') return;
  const until = Date.now() + daysMs;
  localStorage.setItem(SNOOZE_KEY, String(until));
}

function clearSnooze() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SNOOZE_KEY);
}

export default function InstallPrompt() {
  const { canInstall, promptInstall, isInstalled } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  // Odredi da li je snoozovano
  const isSnoozed = useCallback(() => {
    const until = getSnoozeUntil();
    return until > Date.now();
  }, []);

  useEffect(() => {
    // Prikaži samo ako:
    // - app nije instalirana
    // - moze da se instalira (beforeinstallprompt je stigao)
    // - nije snoozovano
    const shouldShow = !isInstalled && canInstall && !isSnoozed();
    setVisible(shouldShow);
  }, [canInstall, isInstalled, isSnoozed]);

  // Ako se app instalira, očisti snooze (da ne ostane “zaključano”)
  useEffect(() => {
    if (isInstalled) clearSnooze();
  }, [isInstalled]);

  const handleLater = () => {
    setSnooze(SNOOZE_MS);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl shadow-lg px-4 py-3 bg-background border w-[min(560px,92vw)]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          <div className="font-medium">Instaliraj ovu web aplikaciju</div>
          {/* <div className="opacity-70">
            Brže učitavanje i fullscreen doživljaj.
          </div> */}
        </div>
        <div className="flex gap-2">
          <button onClick={handleLater} className="px-3 py-2 rounded-lg border">
            Kasnije
          </button>
          <button
            onClick={promptInstall}
            className="px-3 py-2 rounded-lg border bg-primary text-primary-foreground"
          >
            Instaliraj
          </button>
        </div>
      </div>
    </div>
  );
}
