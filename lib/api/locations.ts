import { FetchOptions } from '@/types/global';
import { apiRequest } from '../client';

export async function fetchLocations(
  options: FetchOptions & { isProtected?: boolean } = {}
) {
  return apiRequest('v1/locations', 'GET', undefined, options);
}

export async function createLocation(data: any) {
  return apiRequest('v1/locations', 'POST', data, { isProtected: true });
}

export async function updateLocation(id: string, data: any) {
  return apiRequest(`v1/locations/${id}`, 'PUT', data, { isProtected: true });
}

export async function deleteLocation(id: string) {
  return apiRequest(`v1/locations/${id}`, 'DELETE', undefined, {
    isProtected: true,
  });
}
