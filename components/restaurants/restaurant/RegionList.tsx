// components/RegionsList.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash, Edit3, Utensils, Users } from 'lucide-react';
import { Region } from '@/types/region';
import { UserDetail } from '@/types/user';
import { RegionsListSkeleton } from './RegionsSkeleton';
import { DeleteDialog } from '@/components/DeleteDialog';
import { deleteRegion } from '@/lib/api/regions';
import { useQueryClient } from '@tanstack/react-query';

interface RegionsListProps {
  regions: Region[];
  isLoading: boolean;
  searchQuery: string;
  selectedRegion: Region | null;
  restaurantId: string;
  onRegionSelect: (region: Region) => void;
  onEditRegion: (region: Region) => void;
  onDeleteRegion: () => void;
}

export const RegionsList: React.FC<RegionsListProps> = ({
  regions,
  isLoading,
  searchQuery,
  selectedRegion,
  restaurantId,
  onRegionSelect,
  onEditRegion,
  onDeleteRegion,
}) => {
  const queryClient = useQueryClient();
  const REGION_KEY = ['regions', restaurantId];

  const getUserInitials = (user: UserDetail): string => {
    return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
  };

  const getUserFullName = (user: UserDetail): string => {
    return `${user.firstname} ${user.lastname}`;
  };

  if (isLoading) {
    return <RegionsListSkeleton />;
  }

  const filteredRegions = regions.filter((region) =>
    region.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {filteredRegions.map((region) => (
        <Card
          key={region.id}
          className={`border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
            selectedRegion?.id === region.id
              ? 'ring-2 ring-primary/70 border-primary/40'
              : ''
          }`}
          onClick={() => onRegionSelect(region)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {region.title}
                </h3>
                {region.area && (
                  <p className="text-sm text-gray-500">
                    ({region.area === 'outside' ? 'Napolje' : 'Unutra'})
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditRegion(region);
                  }}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <DeleteDialog
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-destructive bg-white"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  }
                  description="Region će biti trajno obrisan."
                  successMessage="Region je uspešno obrisan!"
                  errorMessage="Greška pri brisanju regiona"
                  mutationOptions={{
                    mutationFn: () => deleteRegion(region.id),
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: REGION_KEY });
                      queryClient.invalidateQueries({
                        queryKey: ['tables', restaurantId],
                      });

                      onDeleteRegion();
                    },
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {region.tables?.length} stolova
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {region.users?.length} konobar(a)
                </span>
              </div>
            </div>

            {/* Lista konobara */}
            {region.users && region.users.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Konobari:
                </p>
                <div className="flex flex-wrap gap-2">
                  {region.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1"
                    >
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-medium text-white">
                        {getUserInitials(user)}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getUserFullName(user)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
