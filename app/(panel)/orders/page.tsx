import OrderDashboard from '@/components/orders/Orders'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: 'Porudzbine | Gastrobot Panel',
  description: 'upravljaj porudzbinama',
};

const OrdersPage = () => {
  return (
    <OrderDashboard />
  )
}

export default OrdersPage