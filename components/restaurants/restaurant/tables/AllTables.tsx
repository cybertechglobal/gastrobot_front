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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  List,
  MoreVertical,
  Edit,
  Trash,
  QrCode,
  Download,
  Loader2,
  RefreshCw,
  Users,
  MapPin,
} from 'lucide-react';
import { Table } from '@/types/table';
import { Region } from '@/types/region';
import { TablesGridSkeleton } from '../RegionsSkeleton';
import { DeleteDialog } from '@/components/DeleteDialog';
import { deleteRestaurantTable, generateQRCode } from '@/lib/api/tables';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import JSZip from 'jszip';

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
  const [qrDialogOpen, setQrDialogOpen] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const tablesPerPage = 12;

  // Mutation za generisanje QR koda
  const qrMutation = useMutation({
    mutationFn: generateQRCode,
    onSuccess: (data) => {
      setQrCodeUrl(data?.imageUrl);
      queryClient.invalidateQueries({ queryKey: TABLE_KEY });
    },
  });

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

  const handleOpenQRDialog = (table: Table): void => {
    setSelectedTable(table);
    setQrDialogOpen(true);

    if (table.qrCode?.imageUrl) {
      setQrCodeUrl(table.qrCode.imageUrl);
    } else {
      setQrCodeUrl('');
      qrMutation.mutate(table.id);
    }
  };

  const handleRegenerateQR = (): void => {
    if (selectedTable) {
      setQrCodeUrl('');
      qrMutation.mutate(selectedTable.id);
    }
  };

  const handleDownloadQR = async (tableName: string): Promise<void> => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${tableName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Greška pri preuzimanju QR koda:', error);
      alert('Greška pri preuzimanju QR koda');
    }
  };

  const handleDownloadAllQR = async (): Promise<void> => {
    const tablesWithQR = tables.filter((table) => table.qrCode?.imageUrl);

    if (tablesWithQR.length === 0) {
      alert(
        'Nema dostupnih QR kodova za preuzimanje. Generišite QR kodove prvo.'
      );
      return;
    }

    try {
      const zip = new JSZip();

      const downloadPromises = tablesWithQR.map(async (table) => {
        try {
          const response = await fetch(table.qrCode.imageUrl);
          const blob = await response.blob();
          zip.file(`qr-${table.name}.png`, blob);
        } catch (error) {
          console.error(
            `Greška pri preuzimanju QR koda za sto ${table.name}:`,
            error
          );
        }
      });

      await Promise.all(downloadPromises);

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `qr-kodovi-stolovi-${
        new Date().toISOString().split('T')[0]
      }.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Greška pri preuzimanju QR kodova:', error);
      alert('Greška pri preuzimanju QR kodova');
    }
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
      <div>
        <div className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <List className="h-5 w-5" />
              Svi stolovi ({tables.length})
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleDownloadAllQR}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={!tables.some((t) => t.qrCode?.imageUrl)}
              >
                <Download className="h-4 w-4" />
                Preuzmi sve QR kodove
              </Button>
              {totalPages > 1 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Stranica {currentPage} od {totalPages}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="py-3 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentTables.map((table) => {
              const region = getTableRegion(table.id);
              const hasQRCode = !!table.qrCode?.imageUrl;

              return (
                <div
                  key={table.id}
                  className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg overflow-hidden"
                >
                  {/* Action Menu */}
                  <div className="absolute top-3 right-3 z-10">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => handleEditTable(table)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Izmeni
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenQRDialog(table)}
                          className="cursor-pointer"
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          QR kod
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

                  <div className="p-5">
                    {/* Table Name & Icon */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xl text-gray-900 dark:text-white truncate">
                          {table.name}
                        </h4>
                        <div className="flex items-center gap-1 mt-1 text-gray-600 dark:text-gray-400">
                          <Users className="h-3.5 w-3.5" />
                          <span className="text-sm font-medium">
                            {table.capacity} mesta
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Region Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      {region ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-medium"
                        >
                          {region.title}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 font-medium"
                        >
                          Nedodeljen
                        </Badge>
                      )}
                    </div>

                    {/* QR Code Action */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={() => handleOpenQRDialog(table)}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 h-9 ${
                          hasQRCode
                            ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <QrCode className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {hasQRCode ? 'Prikaži QR kod' : 'Generiši QR kod'}
                        </span>
                      </Button>
                    </div>
                  </div>
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
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR kod za sto {selectedTable?.name}
            </DialogTitle>
            <DialogDescription>
              Skenirajte ovaj kod da vidite meni za sto {selectedTable?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-6">
            {qrMutation.isPending ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Generisanje QR koda...</p>
              </div>
            ) : qrMutation.isError ? (
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 mb-2">
                  Greška pri generisanju QR koda
                </p>
                <Button
                  onClick={() => qrMutation.mutate(selectedTable?.id || '')}
                  variant="outline"
                  size="sm"
                >
                  Pokušaj ponovo
                </Button>
              </div>
            ) : qrCodeUrl ? (
              <>
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
                  <img
                    src={qrCodeUrl}
                    alt={`QR kod za sto ${selectedTable?.name}`}
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <div className="flex flex-col w-full gap-2 mt-6">
                  <Button
                    onClick={() =>
                      handleDownloadQR(selectedTable?.name || 'sto')
                    }
                    className="w-full"
                    variant="default"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Preuzmi QR kod
                  </Button>
                  <Button
                    onClick={handleRegenerateQR}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generiši ponovo
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

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
