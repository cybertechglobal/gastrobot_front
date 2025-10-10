import { fetchProducts } from '@/lib/api/products';
import { cleanParams } from '@/lib/utils/cleanupUtils';
import { useQuery } from '@tanstack/react-query';

interface UseProductsParams {
  restaurantId: string;
  filters: {
    page?: number;
    name?: string;
    categoryId?: string;
  };
  limit?: number;
  enabled?: boolean;
}

export const useProducts = ({
  restaurantId,
  filters = {},
  limit,
  enabled = true,
}: UseProductsParams) => {
  const { page, name, categoryId } = filters;

  const queryKey = [
    'products',
    restaurantId,
    {
      page: page ?? null,
      name: name ?? '',
      categoryId: categoryId ?? null,
      limit,
    },
  ] as const;

  const productsQuery = useQuery({
    queryKey,
    queryFn: () => {
      // remove undefined / null / '' values
      const params = cleanParams({
        page: filters.page,
        limit,
        name: filters.name,
        categoryId: filters.categoryId,
      });

      return fetchProducts(restaurantId, { params });
    },
    staleTime: 3 * 60 * 1000,
    enabled
  });

  return {
    products: productsQuery.data,
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    refetch: productsQuery.refetch,
  };
};
