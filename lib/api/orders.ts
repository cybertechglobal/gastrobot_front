import { FetchOptions } from '@/types/global';
import { apiRequest } from '../client';
import { Order, OrdersResponse } from '@/types/order';

export async function fetchRestaurantOrders(
  id: string,
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<OrdersResponse> {
  return apiRequest<OrdersResponse>(
    `v1/restaurants/${id}/orders`,
    'GET',
    undefined,
    {
      ...options,
      isProtected: true,
    }
  );
}

export async function fetchRestaurantOrderById(
  id: string,
  orderId: string
): Promise<Order> {
  return apiRequest<Order>(
    `v1/restaurants/${id}/orders/${orderId}`,
    'GET',
    undefined,
    {
      isProtected: true,
    }
  );
}

export async function rejectOrder(id: string, orderId: string, data: any) {
  return apiRequest(
    `v1/restaurants/${id}/orders/${orderId}/reject`,
    'PUT',
    data,
    { isProtected: true }
  );
}

export async function confirmOrder(id: string, orderId: string) {
  return apiRequest(
    `v1/restaurants/${id}/orders/${orderId}/confirm`,
    'PUT',
    undefined,
    { isProtected: true }
  );
}
