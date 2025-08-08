import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  confirmReservation,
  fetchRestaurantReservations,
  rejectReservation,
} from '@/lib/api/reservations';
import { FilterFormData } from './FilterForm';
import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import { UserRole } from '@/types/user';

interface UseReservationFiltersProps {
  role: UserRole;
  resId?: string;
}

interface ReservationFilters extends FilterFormData {
  from?: string;
  to?: string;
}

const pendingParams = {
  status: 'pending',
  sortBy: 'reservationStart',
  sortOrder: 'DESC',
};

export const useReservationManagement = ({
  role,
  resId,
}: UseReservationFiltersProps) => {
  const queryClient = useQueryClient();
  const session = useSession();
  const [notifications, setNotifications] = useState<string[]>([]);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [filters, setFilters] = useState<ReservationFilters>({
    userName: '',
    reservationNumber: '',
    selectedDate: '',
    status: 'all',
  });

  const restaurantId =
    session?.data?.user?.restaurantUsers[0]?.restaurantId || resId || '';

  // Build query parameters for API
  const buildQueryParams = useCallback((filters: ReservationFilters) => {
    const params: any = {};

    if (filters.userName?.trim()) {
      params.userName = filters.userName.trim();
    }

    if (filters.reservationNumber?.trim()) {
      params.reservationNumber = filters.reservationNumber.trim();
    }

    if (filters.from && filters.to) {
      params.from = filters.from;
      params.to = filters.to;
    } else {
      const now = new Date();
      console.log(format(now, 'O')); // npr. "GMT+1"
      const today = new Date();
      const tomorrow = addDays(today, 1);

      params.from = startOfDay(today).toISOString();
      params.to = endOfDay(tomorrow).toISOString();
    }

    // Handle status filtering - if 'all', include both confirmed and rejected
    if (filters.status === 'all') {
      params.status = ['confirmed', 'rejected'];
    } else {
      params.status = filters.status;
    }

    return params;
  }, []);

  // Fetch pending reservations
  const {
    data: pendingData,
    isPending: isPendingLoading,
    error: pendingError,
  } = useQuery({
    queryKey: ['reservations', restaurantId, { ...pendingParams }],
    queryFn: () =>
      fetchRestaurantReservations(restaurantId, {
        params: pendingParams,
      }),
    enabled: !!restaurantId,
    staleTime: 10000, // Consider data stale after 10 seconds
    // refetchInterval: 30000, // Refetch every 30 seconds for pending
  });

  // Fetch processed reservations with filters
  const {
    data: processedData,
    isPending: isProcessedLoading,
    error: processedError,
  } = useQuery({
    queryKey: [
      'reservations',
      restaurantId,
      'processed',
      {
        ...buildQueryParams(filters),
        sortBy: 'reservationStart',
        sortOrder: 'ASC',
      },
    ],
    queryFn: () => {
      const params = {
        ...buildQueryParams(filters),
        sortBy: 'reservationStart',
        sortOrder: 'ASC',
      };

      return fetchRestaurantReservations(restaurantId, { params });
    },
    enabled: !!restaurantId,
    staleTime: 10000, // Consider data stale after 30 seconds
  });

  // Get data from API only
  const pendingReservationsFromAPI = useMemo(() => {
    return pendingData?.data || [];
  }, [pendingData]);

  const processedReservationsFromAPI = useMemo(() => {
    return processedData?.data || [];
  }, [processedData]);

  // Determine loading and error states
  const isLoading = isPendingLoading;
  const error = pendingError || processedError;

  // Separate pending and processed reservations
  const { pendingReservations, processedReservations } = useMemo(() => {
    // Pending reservations - already filtered by API
    const pending = pendingReservationsFromAPI;

    // Processed reservations - already filtered by API, apply additional client-side filtering
    const processed = processedReservationsFromAPI;

    return { pendingReservations: pending, processedReservations: processed };
  }, [pendingReservationsFromAPI, processedReservationsFromAPI]);

  // Mutation for updating reservation status
  const updateReservationMutation = useMutation({
    mutationFn: ({ type, id, body }: { type: string; id: string; body: any }) =>
      type === 'confirm'
        ? confirmReservation(restaurantId, id, body)
        : rejectReservation(restaurantId, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success('Rezervacija je uspešno ažurirana');
    },
    onError: () => {
      toast.error('Greska prilikom azuriranja rezervacije');
    },
  });

  // Action handlers
  const handleFiltersChange = useCallback((newFilters: ReservationFilters) => {
    setFilters(newFilters);
  }, []);

  const handleConfirmReservation = useCallback(
    (reservationId: string) => {
      if (role !== 'manager') return;

      const message = adminNotes[reservationId] || '';
      updateReservationMutation.mutate({
        type: 'confirm',
        id: reservationId,
        body: {
          message,
        },
      });

      setAdminNotes((prev) => ({ ...prev, [reservationId]: '' }));
    },
    [role, adminNotes, updateReservationMutation]
  );

  const handleRejectReservation = useCallback(
    (reservationId: string) => {
      if (role !== 'manager') return;

      const reason = adminNotes[reservationId] || '';
      updateReservationMutation.mutate({
        type: 'reject',
        id: reservationId,
        body: {
          reason,
        },
      });
      setAdminNotes((prev) => ({ ...prev, [reservationId]: '' }));
    },
    [role, adminNotes, updateReservationMutation]
  );

  const handleAdminNoteChange = useCallback(
    (reservationId: string, note: string) => {
      setAdminNotes((prev) => ({ ...prev, [reservationId]: note }));
    },
    []
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const refetchReservations = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
  }, [queryClient]);

  // Statistics
  const stats = useMemo(() => {
    const totalReservations =
      pendingReservationsFromAPI.length + processedReservationsFromAPI.length;
    return {
      totalReservations,
      totalPending: pendingReservations.length,
      totalConfirmed: processedReservations.filter(
        (r) => r.status === 'confirmed'
      ).length,
      totalRejected: processedReservations.filter(
        (r) => r.status === 'rejected'
      ).length,
    };
  }, [
    pendingReservationsFromAPI,
    processedReservationsFromAPI,
    pendingReservations,
    processedReservations,
  ]);

  return {
    // Data
    pendingReservations,
    processedReservations,
    allReservations: [
      ...pendingReservationsFromAPI,
      ...processedReservationsFromAPI,
    ],
    stats,

    // State
    filters,
    notifications,
    adminNotes,
    isLoading,
    isProcessedLoading,
    error,
    isUpdating: updateReservationMutation.isPending,

    // Actions
    handleFiltersChange,
    handleConfirmReservation,
    handleRejectReservation,
    handleAdminNoteChange,
    clearNotifications,
    refetchReservations,

    // Role info
    canEdit: role === 'manager',
  };
};
