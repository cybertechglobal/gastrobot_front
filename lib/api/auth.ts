import { apiRequest } from '../client';

export async function login(email: string, password: string) {
  return apiRequest('auth/signin', 'POST', { email, password });
}

export const forgotPassword = async (email: string) => {
  return apiRequest('users/forgot-password', 'POST', { email });
};

export const resetPassword = async (token: string, password: string) => {
  return apiRequest('users/forgot-password/set', 'PATCH', {
    token,
    newPassword: password,
  });
};
