import { useQuery } from '@tanstack/react-query';
import { fetchRestaurantIngredients } from '@/lib/api/ingredients';
import { cleanParams } from '@/lib/utils/cleanupUtils';

const STALE_TIME = 5 * 60 * 1000;

type IngredientsFilters = {
  include?: 'global' | 'restaurant' | string;
  page?: number;
  limit?: number;
  name?: string;
};

interface UseIngredientsParams {
  restaurantId: string;
  filters?: IngredientsFilters;
  enabled?: boolean;
  staleTimeMs?: number;
  keepPreviousData?: boolean;
}

export function useIngredients({
  restaurantId,
  filters = {},
  enabled = true,
  staleTimeMs = STALE_TIME,
}: UseIngredientsParams) {
  const { include, page, limit, name } = filters;

  // Stabilan key bez undefined
  const keyObj = {
    include: include ?? null,
    page: page ?? null,
    limit: limit ?? null,
    name: name ?? '',
  } as const;

  return useQuery({
    queryKey: ['ingredients', restaurantId, keyObj] as const,
    queryFn: () => {
      const params = cleanParams({ include, page, limit, name });
      return fetchRestaurantIngredients(restaurantId, { params });
    },
    enabled,
    staleTime: staleTimeMs,
  });
}

// Samo globalni sastojci (include=global)
export function useGlobalIngredients(
  restaurantId: string,
  opts?: {
    enabled?: boolean;
    staleTimeMs?: number;
  }
) {
  return useIngredients({
    restaurantId,
    filters: { include: 'global' },
    enabled: opts?.enabled ?? true,
    staleTimeMs: opts?.staleTimeMs ?? STALE_TIME,
  });
}

// Paginirana lista (page/limit/name…)
export function useIngredientsPage(
  restaurantId: string,
  params: {
    page?: number;
    limit?: number;
    name?: string;
    include?: IngredientsFilters['include'];
    enabled?: boolean;
    staleTimeMs?: number;
  }
) {
  const { enabled = true, staleTimeMs, ...filters } = params;
  return useIngredients({
    restaurantId,
    filters,
    enabled,
    staleTimeMs,
  });
}

// Search
export function useIngredientsSearch(
  restaurantId: string,
  opts: {
    search: string;
    include?: IngredientsFilters['include']; // npr. 'global'
    enabledWhen?: boolean; // npr. debouncedSearchValue.length > 0
    staleTimeMs?: number;
  }
) {
  const { search, include, enabledWhen = true, staleTimeMs } = opts;
  return useIngredients({
    restaurantId,
    filters: { name: search, include },
    enabled: enabledWhen,
    staleTimeMs,
  });
}
