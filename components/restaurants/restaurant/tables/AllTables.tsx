// components/AllTablesSection.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { List, MoreVertical, Edit, Trash } from 'lucide-react';
import { Table } from '@/types/table';
import { Region } from '@/types/region';
import { TablesGridSkeleton } from '../RegionsSkeleton';
import { DeleteDialog } from '@/components/DeleteDialog';
import { deleteRestaurantTable } from '@/lib/api/tables';
import { useQueryClient } from '@tanstack/react-query';

interface AllTablesSectionProps {
  tables: Table[];
  regions: Region[];
  isLoading: boolean;
  onEditTable?: (table: Table) => void;
  restaurantId: string;
}

export const AllTablesSection: React.FC<AllTablesSectionProps> = ({
  tables,
  regions,
  isLoading,
  onEditTable,
  restaurantId,
}) => {
  const queryClient = useQueryClient();
  const TABLE_KEY = ['tables', restaurantId];

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const tablesPerPage = 12; // 4 columns × 3 rows

  // Pagination calculations
  const totalPages = Math.ceil(tables.length / tablesPerPage);
  const startIndex = (currentPage - 1) * tablesPerPage;
  const endIndex = startIndex + tablesPerPage;
  const currentTables = tables.slice(startIndex, endIndex);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleEditTable = (table: Table): void => {
    if (onEditTable) {
      onEditTable(table);
    }
  };

  const handleDeleteClick = (table: Table): void => {
    setTableToDelete(table);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = (): void => {
    setDeleteDialogOpen(false);
    setTableToDelete(null);
  };

  const getVisiblePages = (): (number | string)[] => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, 'ellipsis1');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('ellipsis2', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Reset pagination when tables change or component mounts
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [tables.length, totalPages, currentPage]);

  const getTableRegion = (tableId: string): Region | undefined => {
    return regions.find((region) =>
      region.tables
        ? region.tables.some((table) => table.id === tableId)
        : false
    );
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <List className="h-5 w-5" />
            Učitavanje stolova...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TablesGridSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <List className="h-5 w-5" />
              Svi stolovi ({tables.length})
            </CardTitle>
            {totalPages > 1 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Stranica {currentPage} od {totalPages}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentTables.map((table) => {
              const region = getTableRegion(table.id);
              return (
                <div
                  key={table.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 relative group"
                >
                  {/* Action Menu */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onClick={() => handleEditTable(table)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Izmeni
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(table)}
                          className="cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Obriši
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between mb-2 pr-8">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {table.name}
                    </h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {table.capacity} mesta
                    </span>
                  </div>
                  {region ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 dark:bg-green-600 text-green-800 dark:text-white border-green-200 dark:border-green-500"
                    >
                      {region.title}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-orange-300 dark:border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-transparent"
                    >
                      Nedodeljen
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        handlePageChange(currentPage - 1);
                      }
                    }}
                    className={
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  />
                </PaginationItem>

                {getVisiblePages().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis1' || page === 'ellipsis2' ? (
                      <PaginationEllipsis className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <PaginationLink
                        onClick={() => handlePageChange(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
                        handlePageChange(currentPage + 1);
                      }
                    }}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        trigger={<></>}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        description={`Da li ste sigurni da želite da obrišete sto ${tableToDelete?.name}?`}
        successMessage="Sto je uspešno obrisan!"
        errorMessage="Greška pri brisanju stola"
        mutationOptions={{
          mutationFn: () => deleteRestaurantTable(tableToDelete?.id),
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TABLE_KEY });
            handleDeleteCancel();
          },
        }}
      />
    </>
  );
};
