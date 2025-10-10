'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Trash,
  Package,
  ChefHat,
  Star,
  Clock,
  Utensils,
} from 'lucide-react';
import Image from 'next/image';
import { DeleteDialog } from '../DeleteDialog';
import { deleteProduct } from '@/lib/api/products';
import { useQueryClient } from '@tanstack/react-query';
import { CreateProductDialog } from './CreateProductDialog';
import { ProductsSkeleton } from './ProductsSkeleton';
import { Product } from '@/types/product';
import StarRating from '../StarRating';
import { ReviewsPopupTrigger } from '../reviews/ReviewsPopupTrigger';

interface ProductsListProps {
  products: Product[];
  total: number;
  currentPage: number;
  restaurantId: string;
  categories: any[];
  itemsPerPage?: number;
  ingredients?: any[] | undefined;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ProductsList({
  products,
  total,
  currentPage,
  restaurantId,
  categories,
  itemsPerPage = 15,
  ingredients,
  onPageChange,
  isLoading,
}: ProductsListProps) {
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [deleteProductOpen, setDeleteProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const qc = useQueryClient();

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditProductOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setDeleteProductOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(total / itemsPerPage);

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const handleEditProductChange = (state: boolean) => {
    setEditProductOpen(state);
    if (!state) setSelectedProduct(null);
  };

  if (isLoading) {
    return <ProductsSkeleton />;
  }

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

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
          <Package className="h-12 w-12 text-slate-400" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-600 mb-3">
          Proizvodi nisu pronadjeni
        </h3>
        {/* <p className="text-slate-500 text-center max-w-md leading-relaxed">
          Izgleda da još uvek niste dodali nijedan proizvod. Kreirajte svoj prvi
          proizvod kako biste započeli sa jelovnikom.
        </p> */}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="group p-0 overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Product Image */}
                <div className="lg:w-48 h-48 lg:h-auto relative overflow-hidden">
                  {product.imageUrl ? (
                    <div className="relative w-full h-full overflow-hidden">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 1024px) 100vw, 192px"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                      <ChefHat className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}

                  {/* Overlay badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isRecommended && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Preporuceno
                      </Badge>
                    )}
                    {product.category && (
                      <Badge
                        variant="secondary"
                        className="bg-white/90 text-slate-700 border-0 backdrop-blur-sm"
                      >
                        <Utensils className="h-3 w-3 mr-1" />
                        {product.category.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 p-4 lg:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>
                            Azurirano: {formatDate(product.updatedAt)}
                          </span>

                          <ReviewsPopupTrigger
                            entityId={product.id}
                            entityType="product"
                            restaurantId={restaurantId}
                            averageRating={
                              product?.reviewable?.averageRating || 0
                            }
                          >
                            <StarRating
                              rating={product?.reviewable?.averageRating || 0}
                              showLabel={false}
                            />
                          </ReviewsPopupTrigger>
                        </div>
                      </div>

                      {product.description && (
                        <p className="text-slate-600 leading-relaxed mb-6 max-w-2xl">
                          {product.description}
                        </p>
                      )}

                      {/* Ingredients Section */}
                      {product.productIngredients &&
                        product.productIngredients.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Sastojci ({product.productIngredients.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {product.productIngredients.map(
                                (productIngredient) => (
                                  <Badge
                                    key={productIngredient.id}
                                    variant="outline"
                                    // className="bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                                  >
                                    {productIngredient.ingredient.name}
                                    <span className="ml-1.5 text-xs text-slate-500">
                                      {productIngredient.quantity}
                                      {productIngredient.unit}
                                    </span>
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="transition-opacity h-10 w-10 hover:bg-slate-100"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            handleEditProduct(product);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-3" />
                          Izmeni Proizvod
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                        >
                          <Trash className="h-4 w-4 mr-3" />
                          Obrisi Proizvod
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination className="mx-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    currentPage > 1 && handlePageClick(currentPage - 1)
                  }
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
                      onClick={() => handlePageClick(page as number)}
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
                    currentPage < totalPages && handlePageClick(currentPage + 1)
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
      )}

      {/* Dialogs */}
      {editProductOpen && (
        <CreateProductDialog
          open={editProductOpen}
          onOpenChange={handleEditProductChange}
          restaurantId={restaurantId}
          categories={categories}
          ingredients={ingredients}
          product={selectedProduct}
        />
      )}

      {deleteProductOpen && (
        <DeleteDialog
          trigger={<></>}
          open={deleteProductOpen}
          onOpenChange={setDeleteProductOpen}
          description={`Da li ste sigurni da želite da obrišete ${selectedProduct?.name}? Ova radnja je nepovratna. Proizvod će takođe biti uklonjen iz svih jelovnika.`}
          successMessage="Proizvod je uspešno obrisan"
          errorMessage="Greška prilikom brisanja proizvoda"
          mutationOptions={{
            mutationFn: () => deleteProduct(restaurantId, selectedProduct?.id),
            onSuccess: () => {
              qc.invalidateQueries({ queryKey: ['products'] });
            },
          }}
        />
      )}
    </div>
  );
}
