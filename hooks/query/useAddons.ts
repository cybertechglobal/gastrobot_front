import { fetchAddonGroups } from '@/lib/api/addon';
import { useQuery } from '@tanstack/react-query';

interface UseAddonsParams {
  restaurantId: string;
  enabled?: boolean;
}

export const useAddons = ({
  restaurantId,
  enabled = true,
}: UseAddonsParams) => {
  const addonsQuery = useQuery({
    queryKey: ['addonGroups', restaurantId],
    queryFn: () => fetchAddonGroups(restaurantId),
    staleTime: 5 * 60 * 1000,
    enabled,
  });

  return {
    addonGroups: addonsQuery.data,
    isLoading: addonsQuery.isLoading,
    error: addonsQuery.error,
  };
};
