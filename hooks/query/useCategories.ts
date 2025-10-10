import { fetchCategories } from '@/lib/api/category';
import { useQuery } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000;

interface UseCategoriesParams {
  enabled?: boolean;
  staleTime?: number;
  queryKeyExtra?: unknown;
}

export const useCategories = ({
  enabled = true,
  staleTime = STALE_TIME,
  queryKeyExtra = null,
}: UseCategoriesParams = {}) => {
  const query = useQuery({
    queryKey: ['categories', queryKeyExtra] as const,
    queryFn: fetchCategories,
    enabled,
    staleTime,
  });

  return {
    categories: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
