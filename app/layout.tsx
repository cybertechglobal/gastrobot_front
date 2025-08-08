import './globals.css';
import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import ReactQueryProvider from '@/components/ReactQueryProvider';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Admin • Lista restorana',
  description: 'Admin panel za upravljanje restoranima',
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
              {children}
              <Toaster richColors position="bottom-center" />
            </ReactQueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
