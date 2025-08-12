import ReservationDashboard from '@/components/reservations/Reservations';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Rezervacije | Gastrobot Panel',
  description: 'upravljaj rezervacijama',
};

const ReservationsPage = () => {
  return <ReservationDashboard />;
};

export default ReservationsPage;
