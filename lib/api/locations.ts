import { FetchOptions } from '@/types/global';
import { apiRequest } from '../client';
import { City } from '@/types/city';

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

export async function fetchCities(
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<City[]> {
  return apiRequest('city', 'GET', undefined, options);
}

export async function createCity(data: { name: string; zipcode: string }) {
  return apiRequest('city', 'POST', data, { isProtected: true });
}

export async function updateCity(
  id: string,
  data: { name: string; zipcode: string }
) {
  return apiRequest(`city/${id}`, 'PATCH', data, { isProtected: true });
}

export async function deleteCity(id: string) {
  return apiRequest(`city/${id}`, 'DELETE', undefined, {
    isProtected: true,
  });
}
