// components/StatsCards.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, Utensils } from 'lucide-react';
import { Region } from '@/types/region';
import { Table } from '@/types/table';
import { RestaurantUser } from '@/types/user';
import { StatsCardSkeleton } from './RegionsSkeleton';

interface StatsCardsProps {
  regions: Region[];
  tables: Table[];
  users: RestaurantUser[];
  isLoading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  regions,
  tables,
  users,
  isLoading,
}) => {
  const getUnassignedTables = (): number => {
    return tables.filter((table) => !table.regionId || table.regionId === '')
      .length;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ukupno regiona
              </p>
              <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                {regions.length}
              </p>
            </div>
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Ukupno stolova
              </p>
              <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                {tables.length}
              </p>
            </div>
            <Utensils className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Nedodeljeni stolovi
              </p>
              <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                {getUnassignedTables()}
              </p>
            </div>
            <Utensils className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Konobari
              </p>
              <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                {users.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
