import OrderDashboard from '@/components/orders/Orders';
import { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Porudzbine | Gastrobot Panel',
  description: 'upravljaj porudzbinama',
};

const OrdersPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Učitavanje porudžbina...</p>
          </div>
        </div>
      }
    >
      <OrderDashboard />
    </Suspense>
  );
};

export default OrdersPage;
