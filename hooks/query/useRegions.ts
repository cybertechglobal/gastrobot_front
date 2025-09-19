// hooks/useRegions.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  assignTableToRegion,
  assignUserToRegion,
  createRegion,
  deleteRegion,
  fetchRegionsByRestaurant,
  removeTableFromRegion,
  removeUserFromRegion,
  updateRegion,
} from '@/lib/api/regions';
import { Region } from '@/types/region';

export const useRegions = (restaurantId: string) => {
  const queryClient = useQueryClient();
  const REGION_KEY = ['regions', restaurantId];

  const regionsQuery = useQuery<Region[]>({
    queryKey: REGION_KEY,
    queryFn: () => fetchRegionsByRestaurant(restaurantId),
  });

  const createRegionMutation = useMutation({
    mutationFn: createRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
      toast.success('Region je uspešno kreiran!');
    },
    onError: () => {
      toast.error('Greška pri kreiranju regiona');
    },
  });

  const updateRegionMutation = useMutation({
    mutationFn: ({
      id,
      title,
      area,
    }: {
      id: string;
      title: string;
      area?: 'inside' | 'outside' | undefined;
    }) => updateRegion(id, { title, area }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
      toast.success('Region je uspešno ažuriran!');
    },
    onError: () => {
      toast.error('Greška pri ažuriranju regiona');
    },
  });

  const deleteRegionMutation = useMutation({
    mutationFn: deleteRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
      queryClient.invalidateQueries({ queryKey: ['tables', restaurantId] });
      toast.success('Region je uspešno obrisan!');
    },
    onError: () => {
      toast.error('Greška pri brisanju regiona');
    },
  });

  const assignTableMutation = useMutation({
    mutationFn: (data: { tableId: string; regionId: string }) =>
      assignTableToRegion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
      queryClient.invalidateQueries({ queryKey: ['tables', restaurantId] });
      toast.success('Sto je uspešno dodeljen regionu!');
    },
    onError: () => {
      toast.error('Greška pri dodeljivanju stola');
    },
  });

  const assignUserMutation = useMutation({
    mutationFn: (data: { userId: string; regionId: string }) =>
      assignUserToRegion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
      toast.success('Konobar je uspešno dodeljen regionu!');
    },
    onError: () => {
      toast.error('Greška pri dodeljivanju konobara');
    },
  });

  const removeTableMutation = useMutation({
    mutationFn: (data: { tableId: string; regionId: string }) =>
      removeTableFromRegion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
      queryClient.invalidateQueries({ queryKey: ['tables', restaurantId] });
      toast.success('Sto je uspešno uklonjen iz regiona!');
    },
    onError: () => {
      toast.error('Greška pri uklanjanju stola');
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: (data: { userId: string; regionId: string }) =>
      removeUserFromRegion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
      toast.success('Konobar je uspešno uklonjen iz regiona!');
    },
    onError: () => {
      toast.error('Greška pri uklanjanju konobara');
    },
  });

  return {
    regions: regionsQuery.data || [],
    isLoading: regionsQuery.isLoading,
    createRegion: createRegionMutation.mutate,
    updateRegion: updateRegionMutation.mutate,
    deleteRegion: deleteRegionMutation.mutate,
    assignTable: assignTableMutation.mutate,
    assignUser: assignUserMutation.mutate,
    removeTable: removeTableMutation.mutate,
    removeUser: removeUserMutation.mutate,
    mutations: {
      createRegion: createRegionMutation,
      updateRegion: updateRegionMutation,
      deleteRegion: deleteRegionMutation,
      assignTable: assignTableMutation,
      assignUser: assignUserMutation,
      removeTable: removeTableMutation,
      removeUser: removeUserMutation,
    },
  };
};
