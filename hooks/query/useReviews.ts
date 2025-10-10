import {
  fetchReviews,
  approveReview,
  fetchAllReviews,
} from '@/lib/api/reviews';
import { UserRole } from '@/types/user';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface UseReviewsParams {
  entityId?: string;
  entityType?: string;
  isOpen?: boolean;
}

export const useReviews = ({
  entityId,
  entityType,
  isOpen = true,
}: UseReviewsParams) => {
  const queryClient = useQueryClient();

  const session = useSession();

  const role: UserRole = session?.data?.user?.restaurantUsers[0]?.role;
  const isRoot = role === 'root';
  console.log(isRoot)

  const reviewsQuery = useInfiniteQuery({
    queryKey: ['reviews', entityId, entityType, isRoot ? 'root' : 'public'],
    queryFn: ({ pageParam = 1 }) => {
      // Root korisnik koristi drugu rutu
      if (isRoot) {
        const queryParamName =
          entityType === 'restaurant' ? 'restaurantId' : 'productId';
        return fetchAllReviews({
          params: {
            ...(entityId && { [queryParamName]: entityId }),
            page: pageParam,
            limit: 20,
          },
        });
      }

      // Obični korisnici koriste standardnu rutu
      return fetchReviews(entityId!, entityType!, {
        params: {
          page: pageParam,
          limit: 20,
        },
      });
    },
    enabled:
      !!(
        (!!entityId && !!entityType) ||
        (entityType && entityType === 'all')
      ) && isOpen && !!session?.data?.user,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.pagination.hasNextPage ? allPages.length + 1 : undefined;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (reviewId: string) => approveReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reviews'],
      });
      // Invalidate restaurant/product queries as well
      if (entityType === 'restaurant') {
        queryClient.invalidateQueries({
          queryKey: ['restaurants', entityId],
        });
      } else if (entityType === 'product') {
        queryClient.invalidateQueries({
          queryKey: ['products'],
        });
      }
    },
  });

  const reviews = reviewsQuery.data?.pages.flatMap((page) => page.data) || [];
  const totalCount = reviewsQuery.data?.pages[0]?.pagination?.totalCount || 0;

  return {
    reviews,
    totalCount,
    isLoading: reviewsQuery.isPending,
    error: reviewsQuery.error,
    approveReview: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    fetchNextPage: reviewsQuery.fetchNextPage,
    hasNextPage: reviewsQuery.hasNextPage,
    isFetchingNextPage: reviewsQuery.isFetchingNextPage,
  };
};
