import { apiRequest } from '../client';

export async function login(email: string, password: string) {
  return apiRequest('auth/signin', 'POST', { email, password });
}
