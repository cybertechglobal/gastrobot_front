// hooks/useTables.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createRestaurantTable,
  deleteRestaurantTable,
  fetchRestaurantTables,
  updateRestaurantTable,
} from '@/lib/api/tables';
import { Table } from '@/types/table';

export const useTables = (restaurantId: string) => {
  const queryClient = useQueryClient();
  const TABLE_KEY = ['tables', restaurantId];

  const tablesQuery = useQuery<Table[]>({
    queryKey: TABLE_KEY,
    queryFn: () => fetchRestaurantTables(restaurantId),
  });

  const createTableMutation = useMutation({
    mutationFn: ({
      restaurantId,
      ...rest
    }: {
      restaurantId: string;
      capacity: number;
      name: string;
    }) => createRestaurantTable(restaurantId, [{ ...rest }]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLE_KEY });
      toast.success('Sto je uspešno kreiran!');
    },
    onError: () => {
      toast.error('Greška pri kreiranju stola');
    },
  });

  const updateTableMutation = useMutation({
    mutationFn: ({
      id,
      name,
      capacity,
    }: {
      id: string;
      name: string;
      capacity: number;
    }) => updateRestaurantTable(id, { name, capacity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLE_KEY });
      toast.success('Sto je uspešno ažuriran!');
    },
    onError: () => {
      toast.error('Greška pri ažuriranju stola');
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: (tableId: string) => deleteRestaurantTable(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLE_KEY });
      toast.success('Sto je uspešno obrisan!');
    },
    onError: () => {
      toast.error('Greška pri brisanju stola');
    },
  });

  return {
    tables: tablesQuery.data || [],
    isLoading: tablesQuery.isLoading,
    createTable: createTableMutation.mutate,
    updateTable: updateTableMutation.mutate,
    deleteTable: deleteTableMutation.mutate,
    mutations: {
      createTable: createTableMutation,
      updateTable: updateTableMutation,
      deleteTable: deleteTableMutation,
    },
  };
};
