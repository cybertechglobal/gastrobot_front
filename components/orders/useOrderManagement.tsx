import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  confirmOrder,
  fetchRestaurantOrders,
  rejectOrder,
} from '@/lib/api/orders';
import { endOfDay, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import { UserRole } from '@/types/user';
import { OrderFilterFormData } from './OrderFilterForm';

interface UseOrderManagementProps {
  role: UserRole;
  resId?: string;
}

interface OrderFilters extends OrderFilterFormData {
  from?: string;
  to?: string;
}

const pendingParams = {
  status: 'pending',
  sortBy: 'createdAt',
  sortOrder: 'ASC',
};

export const useOrderManagement = ({
  role,
  resId,
}: UseOrderManagementProps) => {
  const queryClient = useQueryClient();
  const session = useSession();
  const [notifications, setNotifications] = useState<string[]>([]);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [filters, setFilters] = useState<OrderFilters>({
    orderNumber: '',
    tableNum: '',
    selectedDate: '',
    status: 'all',
  });

  const restaurantId =
    session?.data?.user?.restaurantUsers[0]?.restaurantId || resId || '';

  // Build query parameters for API
  const buildQueryParams = useCallback((filters: OrderFilters) => {
    const params: any = {};

    if (filters.orderNumber?.trim()) {
      params.orderNumber = filters.orderNumber.trim();
    }

    if (filters.tableNum?.trim()) {
      params.tableNum = filters.tableNum.trim();
    }

    if (filters.from && filters.to) {
      params.from = filters.from;
      params.to = filters.to;
    } else {
      const today = new Date();

      params.from = startOfDay(today).toISOString();
      params.to = endOfDay(today).toISOString();
    }

    // Handle status filtering - if 'all', include both confirmed and rejected
    if (filters.status === 'all') {
      params.status = ['confirmed', 'rejected'];
    } else {
      params.status = filters.status;
    }

    return params;
  }, []);

  // Fetch pending orders
  const {
    data: pendingData,
    isPending: isPendingLoading,
    error: pendingError,
  } = useQuery({
    queryKey: ['orders', restaurantId, { ...pendingParams }],
    queryFn: () =>
      fetchRestaurantOrders(restaurantId, {
        params: pendingParams,
      }),
    enabled: !!restaurantId,
    staleTime: 10000, // Consider data stale after 10 seconds
    // refetchInterval: 30000, // Refetch every 30 seconds for pending
  });

  // Fetch processed orders with filters
  const {
    data: processedData,
    isPending: isProcessedLoading,
    error: processedError,
  } = useQuery({
    queryKey: [
      'orders',
      restaurantId,
      'processed',
      {
        ...buildQueryParams(filters),
        sortBy: 'createdAt',
        sortOrder: 'ASC',
      },
    ],
    queryFn: () => {
      const params = {
        ...buildQueryParams(filters),
        sortBy: 'createdAt',
        sortOrder: 'ASC',
      };

      return fetchRestaurantOrders(restaurantId, { params });
    },
    enabled: !!restaurantId,
    staleTime: 10000, // Consider data stale after 30 seconds
  });

  // Get data from API only
  const pendingOrdersFromAPI = useMemo(() => {
    return pendingData?.data || [];
  }, [pendingData]);

  const processedOrdersFromAPI = useMemo(() => {
    return processedData?.data || [];
  }, [processedData]);

  // Determine loading and error states
  const isLoading = isPendingLoading;
  const error = pendingError || processedError;

  // Separate pending and processed orders
  const { pendingOrders, processedOrders } = useMemo(() => {
    // Pending orders - already filtered by API
    const pending = pendingOrdersFromAPI;

    // Processed orders - already filtered by API, apply additional client-side filtering
    const processed = processedOrdersFromAPI;

    return { pendingOrders: pending, processedOrders: processed };
  }, [pendingOrdersFromAPI, processedOrdersFromAPI]);

  // Mutation for updating order status
  const updateOrderMutation = useMutation({
    mutationFn: ({
      type,
      id,
      body,
    }: {
      type: string;
      id: string;
      body?: any;
    }) =>
      type === 'confirm'
        ? confirmOrder(restaurantId, id)
        : rejectOrder(restaurantId, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Porudžbina je uspešno ažurirana');
    },
    onError: () => {
      toast.error('Greška prilikom ažuriranja porudžbine');
    },
  });

  // Action handlers
  const handleFiltersChange = useCallback((newFilters: OrderFilters) => {
    setFilters(newFilters);
  }, []);

  const handleConfirmOrder = useCallback(
    (orderId: string) => {
      if (role !== 'waiter') return;

      updateOrderMutation.mutate({
        type: 'confirm',
        id: orderId,
      });

      setAdminNotes((prev) => ({ ...prev, [orderId]: '' }));
    },
    [role, adminNotes, updateOrderMutation]
  );

  const handleRejectOrder = useCallback(
    (orderId: string) => {
      if (role !== 'waiter') return;

      const reason = adminNotes[orderId] || '';
      updateOrderMutation.mutate({
        type: 'reject',
        id: orderId,
        body: {
          reason,
        },
      });
      setAdminNotes((prev) => ({ ...prev, [orderId]: '' }));
    },
    [role, adminNotes, updateOrderMutation]
  );

  const handleAdminNoteChange = useCallback((orderId: string, note: string) => {
    setAdminNotes((prev) => ({ ...prev, [orderId]: note }));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const refetchOrders = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [queryClient]);

  // Statistics
  const stats = useMemo(() => {
    const totalOrders = pendingData?.total || 0 + processedOrdersFromAPI.length;
    return {
      totalOrders,
      totalPending: pendingData?.total,
      totalConfirmed: processedOrders.filter((r) => r.status === 'confirmed')
        .length,
      totalRejected: processedOrders.filter((r) => r.status === 'rejected')
        .length,
    };
  }, [processedOrdersFromAPI.length, pendingData?.total, processedOrders]);

  return {
    // Data
    pendingOrders,
    processedOrders,
    allOrders: [...pendingOrdersFromAPI, ...processedOrdersFromAPI],
    stats,

    // State
    filters,
    notifications,
    adminNotes,
    isLoading,
    isProcessedLoading,
    error,
    isUpdating: updateOrderMutation.isPending,

    // Actions
    handleFiltersChange,
    handleConfirmOrder,
    handleRejectOrder,
    handleAdminNoteChange,
    clearNotifications,
    refetchOrders,

    // Role info
    canEdit: role === 'waiter',
  };
};
