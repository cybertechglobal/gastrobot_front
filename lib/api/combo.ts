import { Combobox } from '@/types/menu';
import { apiRequest } from '../client';

export async function createCombo(data: FormData): Promise<Combobox> {
  return apiRequest('combos', 'POST', data, { isProtected: true });
}

export async function fetchCombos(
  restaurantId: string
): Promise<{ data: Combobox[] }> {
  return apiRequest(`combos/restaurant/${restaurantId}`, 'GET', undefined, {
    isProtected: true,
  });
}

export async function updateCombo(
  comboId: string,
  data: FormData
): Promise<Combobox> {
  return apiRequest(`combos/${comboId}`, 'PATCH', data, {
    isProtected: true,
  });
}

export async function deleteCombo(comboId: string | undefined): Promise<void> {
  return apiRequest(`combos/${comboId}`, 'DELETE', undefined, {
    isProtected: true,
  });
}
