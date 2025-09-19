import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import RealtimeClient from '@/components/notifications/RealtimeClient';
import { NotificationPermission } from '@/components/notifications/NotificationsSetup';
import RegisterSW from '@/components/RegisterSW';
import InstallPrompt from '@/components/InstallPrompt';
import { IOSAddToHome } from '@/components/IOSAddToHome';

export const metadata: Metadata = {
  title: 'Gastrobot Panel',
  description: 'Panel za upravljanje restoranom',
  manifest: '/manifest.webmanifest',
  // appleWebApp: { capable: true, statusBarStyle: 'default' },
};

const dmSans = DM_Sans({
  subsets: ['latin'], // pick the subsets you need
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans', // (optional) for CSS‐variable usage
  display: 'swap', // recommended for performance/SEO
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body
        className={`${dmSans.className} flex h-screen bg-background antialiased overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <ReactQueryProvider>
              <RegisterSW />
              <InstallPrompt />
              <IOSAddToHome />
              {children}
              <Toaster richColors position="bottom-center" />
              <NotificationPermission />
              <RealtimeClient />
            </ReactQueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
