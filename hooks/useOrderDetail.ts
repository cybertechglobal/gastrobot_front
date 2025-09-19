// hooks/useOrderDetail.ts
import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Order } from '@/types/order';
import { fetchRestaurantOrderById } from '@/lib/api/orders';
import { useSession } from 'next-auth/react';

interface UseOrderDetailReturn {
  selectedOrder: Order | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  openOrder: (orderId: string) => void;
  closeOrder: () => void;
}

interface UseOrderDetailProps {
  resId?: string;
}

export const useOrderDetail = ({
  resId,
}: UseOrderDetailProps): UseOrderDetailReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();

  // Check if overlay should be open based on URL
  const orderId = searchParams.get('orderId');
  const isOpen = !!orderId;

  const restaurantId =
    session?.data?.user?.restaurantUsers[0]?.restaurantId || resId || '';

  // TanStack Query for fetching order from API
  const {
    data: selectedOrder,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['order', orderId, restaurantId],
    queryFn: () => fetchRestaurantOrderById(restaurantId!, orderId!),
    enabled: !!orderId && !!restaurantId,
    retry: 1,
  });

  // Open order (updates URL)
  const openOrder = useCallback(
    (orderIdToOpen: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('orderId', orderIdToOpen);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Close order (removes from URL)
  const closeOrder = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('orderId');
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  // Determine error state
  const error = fetchError
    ? fetchError instanceof Error
      ? fetchError.message
      : 'Failed to fetch order'
    : null;

  return {
    selectedOrder: selectedOrder || null,
    isOpen,
    isLoading,
    error,
    openOrder,
    closeOrder,
  };
};
