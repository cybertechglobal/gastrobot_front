// hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { fetchRestaurantUsers } from '@/lib/api/users';
import { RestaurantUser } from '@/types/user';

export const useRestaurantUsers = (restaurantId: string) => {
  const USERS_KEY = ['restaurant-users', restaurantId, { role: 'waiter' }];

  const usersQuery = useQuery({
    queryKey: USERS_KEY,
    queryFn: () =>
      fetchRestaurantUsers(restaurantId, {
        isProtected: true,
        params: {
          role: 'waiter',
        },
      }),
  });

  return {
    users: (usersQuery.data?.data || []) as RestaurantUser[],
    isLoading: usersQuery.isLoading,
  };
};
