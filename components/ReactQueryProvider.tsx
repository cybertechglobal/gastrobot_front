// components/ReactQueryProvider.tsx
'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from './ui/sidebar';

export default function ReactQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 0,
          },
        },
      })
  );

  return (
    <SidebarProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SidebarProvider>
  );
}
