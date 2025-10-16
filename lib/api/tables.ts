// lib/api/tables.ts
import { FetchOptions } from '@/types/global';
import { apiRequest } from '../client';
import { QrCode, Table } from '@/types/table';

export type TablePayload = {
  name: string;
  capacity: number;
};

// GET /restaurants/{restaurantId}/tables
export async function fetchRestaurantTables(
  restaurantId: string,
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<Table[]> {
  return apiRequest<Table[]>(
    `restaurants/${restaurantId}/tables`,
    'GET',
    undefined,
    { ...options, isProtected: true }
  );
}

// POST /restaurants/{restaurantId}/tables
export async function createRestaurantTable(
  restaurantId: string,
  data: TablePayload[]
): Promise<Table> {
  return apiRequest<Table>(`restaurants/${restaurantId}/tables`, 'POST', data, {
    isProtected: true,
  });
}

export async function updateRestaurantTable(
  tableId: string,
  data: TablePayload
): Promise<any> {
  return apiRequest<any>(`tables/${tableId}`, 'PATCH', data, {
    isProtected: true,
  });
}

export async function deleteRestaurantTable(
  tableId: string | undefined
): Promise<void> {
  return apiRequest<void>(`tables/${tableId}`, 'DELETE', undefined, {
    isProtected: true,
  });
}

export const generateQRCode = async (tableId: string): Promise<QrCode> => {
  return apiRequest<QrCode>(
    `qr-code`,
    'POST',
    { tableId },
    {
      isProtected: true,
    }
  );
};
