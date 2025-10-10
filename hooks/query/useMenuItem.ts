import { useQuery } from '@tanstack/react-query';
import { fetchMenuItemById } from '@/lib/api/menu';

const STALE_TIME = 1 * 60 * 1000;

interface UseMenuItemParams {
  restaurantId: string;
  menuId: string;
  menuItemId?: string;
  enabled?: boolean;
  staleTime?: number;
}

export function useMenuItem({
  restaurantId,
  menuId,
  menuItemId,
  enabled = true,
  staleTime = STALE_TIME,
}: UseMenuItemParams) {
  return useQuery({
    queryKey: ['menuItem', restaurantId, menuId, menuItemId],
    queryFn: () => fetchMenuItemById(restaurantId, menuId, menuItemId!),
    enabled: enabled && !!menuItemId,
    staleTime,
  });
}
