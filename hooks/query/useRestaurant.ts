import { fetchRestaurantById } from '@/lib/api/restaurants';
import { useQuery } from '@tanstack/react-query';

interface UseRestaurantParams {
  restaurantId: string;
  enabled?: boolean;
}

export const useRestaurant = ({
  restaurantId,
  enabled = true,
}: UseRestaurantParams) => {
  const addonsQuery = useQuery({
    queryKey: ['restaurants', restaurantId],
    queryFn: () => fetchRestaurantById(restaurantId),
    staleTime: 1 * 60 * 1000,
    enabled,
  });

  return {
    data: addonsQuery.data,
    isLoading: addonsQuery.isPending,
    error: addonsQuery.error,
  };
};
