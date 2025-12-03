import { FetchOptions } from '@/types/global';
import { apiRequest } from '../client';
import { Restaurant, RestaurantsResponse } from '@/types/restaurant';

export async function fetchRestaurants(
  options: FetchOptions & { isProtected?: boolean } = {}
): Promise<RestaurantsResponse> {
  return apiRequest<RestaurantsResponse>(
    'v1/restaurants',
    'GET',
    undefined,
    options
  );
}

export async function fetchRestaurantById(id: string): Promise<Restaurant> {
  return apiRequest<Restaurant>(`v1/restaurants/${id}`, 'GET', undefined, {
    isProtected: true,
  });
}

export async function createRestaurant(data: any) {
  return apiRequest('v1/restaurants', 'POST', data, { isProtected: true });
}

export async function updateRestaurant(id: string, data: any) {
  return apiRequest(`v1/restaurants/${id}`, 'PUT', data, { isProtected: true });
}

export async function updateRestaurantLogo(id: string, data: FormData) {
  return apiRequest(`v1/restaurants/${id}/logo`, 'PUT', data, {
    isProtected: true,
  });
}

export async function deleteRestaurant(id: string) {
  return apiRequest(`v1/restaurants/${id}`, 'DELETE', undefined, {
    isProtected: true,
  });
}

export async function fetchRestaurantSettings(id: string): Promise<any> {
  return apiRequest<Restaurant>(
    `v1/restaurants/${id}/settings`,
    'GET',
    undefined,
    {
      isProtected: true,
    }
  );
}

export async function updateRestaurantSettings(id: string, data: any) {
  return apiRequest(`v1/restaurants/${id}/settings`, 'PUT', data, {
    isProtected: true,
  });
}

export async function publishRestaurantToAssistant(id: string) {
  return apiRequest(`assistants/publish/${id}`, 'PATCH', undefined, {
    isProtected: true,
  });
}

// // Public route (hits backend directly)
// const publicData = await apiRequest('public/endpoint', 'GET');

// // Protected route (hits Next.js /api/proxy, which forwards to backend)
// const protectedData = await apiRequest('protected/endpoint', 'GET', undefined, { isProtected: true });

// // POST with JSON
// const response = await apiRequest('users', 'POST', { name: 'John' }, { isProtected: true });

// // POST with FormData
// const formData = new FormData();
// formData.append('file', file);
// const uploadResponse = await apiRequest('upload', 'POST', formData, { isProtected: true });

// import { apiRequest } from '@/lib/client';
// import { ApiError } from '@/lib/error';
// import { toast } from "sonner"

// try {
//   const data = await apiRequest('protected/endpoint', 'GET', undefined, { isProtected: true });
//   console.log(data);
// } catch (err) {
//   if (err instanceof ApiError) {
//     toast.error(`Error ${err.status}: ${err.message}`);
//   } else {
//     toast.error('Unexpected error');
//   }
// }

// ! U server komponenti zovemo ovako
// import { getAllUsersViaProxy } from '@/lib/api/users';

// export default async function UsersPage() {
//   const users = await getAllUsersViaProxy();

//   return (
//     <div>
//       {users.map((user: any) => (
//         <div key={user.id}>{user.name}</div>
//       ))}
//     </div>
//   );
// }
