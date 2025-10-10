'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Package, Globe, Edit, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { deleteIngredient, fetchIngredients } from '@/lib/api/ingredients';
import IngredientModal from '../IngredientModal';
import { DeleteDialog } from '@/components/DeleteDialog';
import { Ingredient } from '@/types/ingredient';
import { useIngredientsPage } from '@/hooks/query/useIngredients';

interface RestaurantIngredientsProps {
  restaurantId: string;
  onAddIngredient?: () => void;
  onEditIngredient?: (ingredient: Ingredient) => void;
  onDeleteIngredient?: (ingredientId: string) => void;
}

const LIMIT = 20;

export default function RestaurantIngredients({
  restaurantId,
  onEditIngredient,
}: RestaurantIngredientsProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('restaurant');
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [globalPage, setGlobalPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  );

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch restaurant ingredients
  const {
    data: restaurantData,
    isLoading: restaurantLoading,
    error: restaurantError,
  } = useIngredientsPage(restaurantId, {
    page: restaurantPage,
    limit: LIMIT,
    name: debouncedSearchTerm,
  });

  // Fetch global ingredients
  const {
    data: globalData,
    isLoading: globalLoading,
    error: globalError,
  } = useQuery({
    queryKey: ['ingredients', { globalPage, debouncedSearchTerm }],
    queryFn: () =>
      fetchIngredients({
        params: {
          page: globalPage,
          limit: LIMIT,
          name: debouncedSearchTerm,
        },
      }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleRestaurantPageClick = (page: number) => {
    setRestaurantPage(page);
  };

  const handleGlobalPageClick = (page: number) => {
    setGlobalPage(page);
  };

  onEditIngredient = (ing) => {
    setEditingIngredient(ing);
    setIsAddModalOpen(true);
  };

  const handleCloseForm = () => {
    setEditingIngredient(null);
    setIsAddModalOpen(false);
  };

  // Reset to page 1 when search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Reset pages when search changes
    setRestaurantPage(1);
    setGlobalPage(1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate total pages
  const restaurantTotalPages = Math.ceil((restaurantData?.total || 0) / LIMIT);
  const globalTotalPages = Math.ceil((globalData?.total || 0) / LIMIT);

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  );

  const PaginationComponent = ({
    currentPage,
    totalPages,
    onPageClick,
  }: {
    currentPage: number;
    totalPages: number;
    onPageClick: (page: number) => void;
  }) => {
    // Pagination helper function
    const getVisiblePages = () => {
      const pages = [];
      const showEllipsis = totalPages > 7;

      if (!showEllipsis) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push('ellipsis1');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          pages.push(1);
          pages.push('ellipsis1');
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('ellipsis1');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('ellipsis2');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6">
        <Pagination className="mx-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageClick(currentPage - 1)}
                className={
                  currentPage === 1
                    ? 'pointer-events-none opacity-50'
                    : 'hover:bg-slate-100 cursor-pointer'
                }
              />
            </PaginationItem>

            {getVisiblePages().map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis1' || page === 'ellipsis2' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => onPageClick(page as number)}
                    isActive={currentPage === page}
                    className={
                      currentPage === page
                        ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                        : 'hover:bg-slate-100 cursor-pointer'
                    }
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  currentPage < totalPages && onPageClick(currentPage + 1)
                }
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'hover:bg-slate-100 cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Lista sastojaka
            </h1>
            <p className="text-muted-foreground">
              Upravljaj sastojcima restorana i pregledaj globalne opcije
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Pretraži po imenu..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="restaurant" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Restoran ({restaurantData?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Globalni ({globalData?.total || 0})
            </TabsTrigger>
          </TabsList>

          {activeTab === 'restaurant' && (
            <Button variant="default" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj sastojak
            </Button>
          )}
        </div>

        {/* Restaurant Ingredients */}
        <TabsContent value="restaurant" className="space-y-4">
          {restaurantError && (
            <Alert variant="destructive">
              <AlertDescription>
                Neuspešno učitavanje sastojaka restorana. Molimo pokušajte
                ponovo.
              </AlertDescription>
            </Alert>
          )}

          {restaurantLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="text-sm text-muted-foreground flex justify-between">
                Prikazano {(restaurantPage - 1) * LIMIT + 1}-
                {Math.min(restaurantPage * LIMIT, restaurantData?.total || 0)}{' '}
                od {restaurantData?.total || 0} sastojaka
                <span className="ml-4">
                  Stranica {restaurantPage} od {restaurantTotalPages}
                </span>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ime sastojka</TableHead>
                      <TableHead>Datum kreiranja</TableHead>
                      <TableHead className="text-right">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!restaurantData?.data ||
                    restaurantData.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12">
                          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Nema pronađenih sastojaka
                          </h3>
                          <p className="text-muted-foreground">
                            {searchTerm
                              ? 'Pokušajte da promenite kriterijume pretrage.'
                              : 'Počnite dodavanjem sastojaka u vaš restoran.'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      restaurantData.data.map((ingredient) => (
                        <TableRow key={ingredient.id}>
                          <TableCell className="font-medium">
                            {ingredient.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(ingredient.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditIngredient?.(ingredient)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <DeleteDialog
                                trigger={
                                  <Button
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive-900"
                                    size="icon"
                                  >
                                    <Trash size={16} />
                                  </Button>
                                }
                                description="Ova akcija je nepovratna. Sastojak će biti trajno obrisan iz sistema."
                                successMessage="Sastojak je uspešno obrisan"
                                errorMessage="Greška prilikom brisanja sastojka"
                                mutationOptions={{
                                  mutationFn: () =>
                                    deleteIngredient(ingredient.id),
                                  onSuccess: () => {
                                    queryClient.invalidateQueries({
                                      queryKey: ['ingredients'],
                                    });
                                  },
                                }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <PaginationComponent
                currentPage={restaurantPage}
                totalPages={restaurantTotalPages}
                onPageClick={handleRestaurantPageClick}
              />
            </>
          )}
        </TabsContent>

        {/* Global Ingredients */}
        <TabsContent value="global" className="space-y-4">
          {globalError && (
            <Alert variant="destructive">
              <AlertDescription>
                Neuspešno učitavanje globalnih sastojaka. Molimo pokušajte
                ponovo.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/30 border border-border/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">
                  Globalni sastojci
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pregledajte sastojke dostupne globalno. Ovi sastojci se
                  održavaju od strane platforme.
                </p>
              </div>
            </div>
          </div>

          {globalLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="text-sm text-muted-foreground flex justify-between">
                Prikazano {(globalPage - 1) * LIMIT + 1}-
                {Math.min(globalPage * LIMIT, globalData?.total || 0)} od{' '}
                {globalData?.total || 0} sastojaka
                <span className="ml-4">
                  Stranica {globalPage} od {globalTotalPages}
                </span>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ime sastojka</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!globalData?.data || globalData.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={1} className="text-center py-12">
                          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Nema pronađenih globalnih sastojaka
                          </h3>
                          <p className="text-muted-foreground">
                            {searchTerm
                              ? 'Pokušajte da promenite kriterijume pretrage.'
                              : 'Globalni sastojci trenutno nisu dostupni.'}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      globalData.data.map((ingredient) => (
                        <TableRow key={ingredient.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center justify-between gap-2">
                              {ingredient.name}
                              <Badge variant="outline" className="text-xs">
                                <Globe className="w-3 h-3 mr-1" />
                                Global
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <PaginationComponent
                currentPage={globalPage}
                totalPages={globalTotalPages}
                onPageClick={handleGlobalPageClick}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      <IngredientModal
        restaurantId={restaurantId}
        ingredient={editingIngredient}
        isOpen={isAddModalOpen}
        onClose={handleCloseForm}
        isClient
      />
    </div>
  );
}
