import { FetchOptions } from '@/types/global';
import { apiRequest } from '../client';
import { RestaurantUsersResponse } from '@/types/user';

export async function fetchRestaurantUsers(
  id: string,
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<RestaurantUsersResponse> {
  return apiRequest(`v1/restaurants/${id}/users`, 'GET', undefined, options);
}

export async function createUser(data: any) {
  console.log(data);
  return apiRequest('v1/users', 'POST', data, { isProtected: true });
}

export async function updateUser(id: string, data: any) {
  return apiRequest(`v1/users/${id}`, 'PUT', data, { isProtected: true });
}

export async function updateUserImage(data: FormData) {
  return apiRequest(`/users/profile-image`, 'PATCH', data, {
    isProtected: true,
  });
}

export async function updateUserPassword(data: any) {
  return apiRequest(`/users/change-password`, 'PATCH', data, {
    isProtected: true,
  });
}

export async function deleteUser(id: string) {
  return apiRequest(`v1/users/${id}`, 'DELETE', undefined, {
    isProtected: true,
  });
}

export async function verify(options: FetchOptions = {}) {
  return apiRequest(`v1/users/verify`, 'GET', undefined, options);
}

export async function resendVerification(data: any) {
  return apiRequest('v1/users/resend-verification', 'POST', data);
}
