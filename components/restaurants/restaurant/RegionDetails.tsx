// components/RegionDetails.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Utensils, Users, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Region } from '@/types/region';
import { Table } from '@/types/table';
import { RestaurantUser, UserDetail } from '@/types/user';

interface RegionDetailsProps {
  region: Region;
  tables: Table[];
  users: RestaurantUser[];
  onAssignTable: (data: { tableId: string; regionId: string }) => void;
  onAssignUser: (data: { userId: string; regionId: string }) => void;
  onRemoveTable: (data: { tableId: string; regionId: string }) => void;
  onRemoveUser: (data: { userId: string; regionId: string }) => void;
}

export const RegionDetails: React.FC<RegionDetailsProps> = ({
  region,
  tables,
  users,
  onAssignTable,
  onAssignUser,
  onRemoveTable,
  onRemoveUser,
}) => {
  const getUserInitials = (user: UserDetail): string => {
    return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
  };

  const getUserFullName = (user: UserDetail): string => {
    return `${user.firstname} ${user.lastname}`;
  };

  const getAvailableTables = (): Table[] => {
    return tables.filter((table) => !table.regionId || table.regionId === '');
  };

  const isUserAssignedToRegion = (userId: string): boolean => {
    return region.users ? region.users.some((u) => u.id === userId) : false;
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <CardHeader className="border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          {region.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Stolovi */}
        <div>
          <div className="flex items-center justify-between mb-3 mx-3">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-900 dark:text-white">
              <Utensils className="h-4 w-4" />
              Stolovi ({region.tables?.length})
            </h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-300 dark:border-none bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">
                    Dodeli sto u region
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-4">
                  {getAvailableTables().map((table) => (
                    <div
                      key={table.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {table.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          ({table.capacity} mesta)
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                        onClick={() => {
                          onAssignTable({
                            tableId: table.id,
                            regionId: region.id,
                          });
                        }}
                      >
                        Dodeli
                      </Button>
                    </div>
                  ))}
                  {getAvailableTables().length === 0 && (
                    <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                      Nema dostupnih stolova
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {region.tables?.map((table) => (
              <div
                key={table.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {table.name}
                  </span>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {table.capacity} mesta
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-600 hover:text-red-700 dark:hover:text-white bg-white dark:bg-transparent"
                  onClick={() =>
                    onRemoveTable({
                      tableId: table.id,
                      regionId: region.id,
                    })
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {region.tables?.length === 0 && (
              <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                Nema stolova u ovom regionu
              </p>
            )}
          </div>
        </div>

        {/* Konobari */}
        <div>
          <div className="flex items-center justify-between mb-3 mx-3">
            <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="h-4 w-4" />
              Konobari ({region.users?.length})
            </h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-300 dark:border-none bg-white dark:bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">
                    Dodeli konobara u region
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-4">
                  {users.map((user) => {
                    const isAssigned = isUserAssignedToRegion(user.user.id);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                            {getUserInitials(user.user)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {getUserFullName(user.user)}
                            </span>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {user.user.email}
                            </div>
                          </div>
                        </div>
                        {isAssigned ? (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                            <Check className="h-4 w-4" />
                            <span className="text-sm">Dodeljen</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-black"
                            onClick={() => {
                              onAssignUser({
                                userId: user.user.id,
                                regionId: region.id,
                              });
                            }}
                          >
                            Dodeli
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {users.length === 0 && (
                    <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                      Nema dostupnih konobara
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {region.users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                    {getUserInitials(user)}
                  </div>
                  <div>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {getUserFullName(user)}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-600 hover:text-red-700 dark:hover:text-white bg-white dark:bg-transparent"
                  onClick={() =>
                    onRemoveUser({
                      userId: user.id,
                      regionId: region.id,
                    })
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {region.users?.length === 0 && (
              <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                Nema konobara u ovom regionu
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
