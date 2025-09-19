// components/RegionsAndTables.tsx
import React, { JSX, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, MapPin, Search, List } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Region } from '@/types/region';
import { Table } from '@/types/table';
import { useRegions } from '@/hooks/query/useRegions';
import { useTables } from '@/hooks/query/useTables';
import { useRestaurantUsers } from '@/hooks/query/useRestaurantUsers';
import { StatsCards } from './RegionStatsCards';
import { AllTablesSection } from './tables/AllTables';
import { RegionDetails } from './RegionDetails';
import { EditRegionDialog } from './EditRegionDialog';
import { RegionsList } from './RegionList';
import { TableDialog } from './tables/TableDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RegionFormData {
  title: string;
  area: 'inside' | 'outside' | undefined;
}

export default function RegionsAndTables({
  restaurantId,
}: {
  restaurantId: string;
}): JSX.Element {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [newRegionTitle, setNewRegionTitle] = useState<string>('');
  const [newRegionArea, setNewRegionArea] = useState<string>('inside');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [showAllTables, setShowAllTables] = useState<boolean>(false);

  // Table dialog states
  const [tableDialogOpen, setTableDialogOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState<string>('');
  const [tableCapacity, setTableCapacity] = useState<string>('');

  // Use custom hooks
  const {
    regions,
    isLoading: regionsLoading,
    createRegion,
    updateRegion,
    assignTable,
    assignUser,
    removeTable,
    removeUser,
    mutations,
  } = useRegions(restaurantId);

  const {
    tables,
    isLoading: tablesLoading,
    createTable,
    updateTable,
    mutations: tableMutations,
  } = useTables(restaurantId);

  const { users, isLoading: usersLoading } = useRestaurantUsers(restaurantId);

  const isLoading = regionsLoading || tablesLoading || usersLoading;

  // Update selected region when regions change
  React.useEffect(() => {
    if (selectedRegion && regions.length > 0) {
      const updatedRegion = regions.find((r) => r.id === selectedRegion.id);
      if (
        updatedRegion &&
        JSON.stringify(updatedRegion) !== JSON.stringify(selectedRegion)
      ) {
        setSelectedRegion(updatedRegion);
      }
    }
  }, [regions, selectedRegion]);

  const handleCreateRegion = (): void => {
    createRegion({
      title: newRegionTitle.trim(),
      area: newRegionArea,
      restaurantId,
    });
    setNewRegionTitle('');
  };

  // Updated to handle form data from React Hook Form
  const handleUpdateRegion = (data: RegionFormData): void => {
    console.log(data)
    if (editingRegion) {
      updateRegion({
        id: editingRegion.id,
        title: data.title.trim(),
        ...(data.area && { area: data.area }),
      });
      setEditingRegion(null);
    }
  };

  const handleDeleteRegion = (): void => {
    setSelectedRegion(null);
  };

  const handleEditRegion = (region: Region): void => {
    setEditingRegion(region);
  };

  // Table management functions
  const openCreateTableDialog = (): void => {
    setEditingTable(null);
    setTableDialogOpen(true);
  };

  const openEditTableDialog = (table: Table): void => {
    setEditingTable(table);
    setTableDialogOpen(true);
  };

  const closeTableDialog = (): void => {
    setTableDialogOpen(false);
    setEditingTable(null);
    setTableName('');
    setTableCapacity('');
  };

  const handleTableSubmit = (): void => {
    if (editingTable) {
      // Update existing table
      updateTable({
        id: editingTable.id,
        name: tableName.trim(),
        capacity: parseInt(tableCapacity),
      });
    } else {
      // Create new table
      createTable({
        name: tableName.trim(),
        capacity: parseInt(tableCapacity),
        restaurantId,
      });
    }
    closeTableDialog();
  };

  const isTableDialogLoading = editingTable
    ? tableMutations.updateTable.isPending
    : tableMutations.createTable.isPending;

  return (
    <div className="max-w-7xl">
      {/* Title and Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            <MapPin className="h-8 w-8 text-yellow-500" />
            Stolovi i Regioni
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upravljajte regionima i stolovima
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards
        regions={regions}
        tables={tables}
        users={users}
        isLoading={isLoading}
      />

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Pretraži regione..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:flex gap-4">
          <Button
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            onClick={() => setShowAllTables(!showAllTables)}
          >
            <List className="h-4 w-4 mr-2" />
            {showAllTables ? 'Sakrij' : 'Prikaži'} stolove
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium">
                <Plus className="h-4 w-4 mr-2" />
                Novi Region
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">
                  Kreiraj novi region
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label
                    htmlFor="regionTitle"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Naziv regiona
                  </Label>
                  <Input
                    id="regionTitle"
                    placeholder="npr. Bašta, Terasa..."
                    value={newRegionTitle}
                    onChange={(e) => setNewRegionTitle(e.target.value)}
                    className="border-gray-300 dark:border-gray-600 mt-1 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="regionTitle"
                    className="text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Izaberi prostor
                  </Label>
                  <Select
                    value={newRegionArea}
                    onValueChange={(value) => setNewRegionArea(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Izaberi prostor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inside">Unutra</SelectItem>
                      <SelectItem value="outside">Napolje</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreateRegion}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={
                    mutations.createRegion.isPending || !newRegionTitle.trim()
                  }
                >
                  {mutations.createRegion.isPending
                    ? 'Kreiranje...'
                    : 'Kreiraj Region'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 col-span-2 md:col-span-1"
            onClick={openCreateTableDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novi Sto
          </Button>
        </div>
      </div>

      {/* All Tables List with Pagination */}
      {showAllTables && (
        <AllTablesSection
          tables={tables}
          regions={regions}
          isLoading={tablesLoading}
          onEditTable={openEditTableDialog}
          restaurantId={restaurantId}
        />
      )}

      {/* Content */}
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Lista regiona ({regions.length})
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista Regiona */}
        <div className="lg:col-span-2">
          <RegionsList
            regions={regions}
            isLoading={regionsLoading}
            searchQuery={searchQuery}
            selectedRegion={selectedRegion}
            restaurantId={restaurantId}
            onRegionSelect={setSelectedRegion}
            onEditRegion={handleEditRegion}
            onDeleteRegion={handleDeleteRegion}
          />
        </div>

        {/* Detalji Regiona */}
        <div>
          {selectedRegion ? (
            <RegionDetails
              region={selectedRegion}
              tables={tables}
              users={users}
              onAssignTable={assignTable}
              onAssignUser={assignUser}
              onRemoveTable={removeTable}
              onRemoveUser={removeUser}
            />
          ) : (
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <CardContent className="p-8 text-center">
                <MapPin className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Izaberite region da vidite detalje
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Region Dialog */}
      <EditRegionDialog
        isOpen={!!editingRegion}
        onClose={() => setEditingRegion(null)}
        regionTitle={editingRegion?.title || ''}
        regionArea={editingRegion?.area as 'inside' | 'outside' | undefined}
        onUpdate={handleUpdateRegion}
        isUpdating={mutations.updateRegion.isPending}
      />

      {/* Table Dialog (Create/Edit) */}
      <TableDialog
        isOpen={tableDialogOpen}
        onClose={closeTableDialog}
        table={editingTable}
        tableName={tableName}
        tableCapacity={tableCapacity}
        onNameChange={setTableName}
        onCapacityChange={setTableCapacity}
        onSubmit={handleTableSubmit}
        isLoading={isTableDialogLoading}
      />
    </div>
  );
}
