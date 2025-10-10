import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
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

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
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
        className={`${spaceGrotesk.variable} flex h-screen bg-background antialiased overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          enableSystem={false}
          defaultTheme="light"
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
