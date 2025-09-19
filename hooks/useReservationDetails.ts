// hooks/useReservationDetail.ts
import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Reservation } from '@/types/reservation';
import { fetchRestaurantReservationById } from '@/lib/api/reservations';
import { useSession } from 'next-auth/react';

interface UseReservationDetailReturn {
  selectedReservation: Reservation | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  openReservation: (reservationId: string) => void;
  closeReservation: () => void;
}

interface UseReservationDetailProps {
  resId?: string;
}

export const useReservationDetail = ({
  resId,
}: UseReservationDetailProps): UseReservationDetailReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();

  // Check if overlay should be open based on URL
  const reservationId = searchParams.get('reservationId');
  const isOpen = !!reservationId;

  console.log(reservationId)

  const restaurantId =
    session?.data?.user?.restaurantUsers[0]?.restaurantId || resId || '';

  // TanStack Query for fetching reservation from API
  const {
    data: selectedReservation,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['reservation', reservationId, restaurantId],
    queryFn: () => fetchRestaurantReservationById(reservationId!),
    enabled: !!reservationId && !!restaurantId,
    retry: 1,
  });

  // Open reservation (updates URL)
  const openReservation = useCallback(
    (reservationIdToOpen: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('reservationId', reservationIdToOpen);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Close reservation (removes from URL)
  const closeReservation = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('reservationId');
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  // Determine error state
  const error = fetchError
    ? fetchError instanceof Error
      ? fetchError.message
      : 'Failed to fetch reservation'
    : null;

  return {
    selectedReservation: selectedReservation || null,
    isOpen,
    isLoading,
    error,
    openReservation,
    closeReservation,
  };
};
