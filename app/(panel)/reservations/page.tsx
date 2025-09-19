import ReservationDashboard from '@/components/reservations/Reservations';
import { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Rezervacije | Gastrobot Panel',
  description: 'upravljaj rezervacijama',
};

const ReservationsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Učitavanje rezervacija...</p>
          </div>
        </div>
      }
    >
      <ReservationDashboard />
    </Suspense>
  );
};

export default ReservationsPage;
