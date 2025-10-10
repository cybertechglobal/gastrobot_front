'use client';

import { useState } from 'react';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsList } from '@/components/products/ProductsList';
import { useProducts } from '@/hooks/query/useProducts';
import { useGlobalIngredients } from '@/hooks/query/useIngredients';
import { useCategories } from '@/hooks/query/useCategories';

export default function Products({ restaurantId }: { restaurantId: string }) {
  // Lokalno stanje za filtere proizvoda
  const [filters, setFilters] = useState({
    name: '',
    categoryId: '',
    page: 1,
  });

  const limit = 15;

  const {
    products,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts({ restaurantId, limit, filters });

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    data: ingredients,
    isLoading: ingredientsLoading,
    error: ingredientsError,
  } = useGlobalIngredients(restaurantId);

  // Handler funkcije za ažuriranje filtera
  const handleSearchChange = (name: string) => {
    setFilters((prev) => ({ ...prev, name, page: 1 }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters((prev) => ({ ...prev, categoryId, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({ name: '', categoryId: '', page: 1 });
  };

  if (productsError || categoriesError || ingredientsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Failed to load data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <>
      <ProductsHeader
        restaurantId={restaurantId}
        categories={categories || []}
        totalProducts={products?.total || 0}
        ingredients={ingredients?.data}
        filters={filters}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onClearFilters={clearFilters}
        isLoading={productsLoading}
      />
      <ProductsList
        products={products?.data || []}
        total={products?.total || 0}
        currentPage={filters.page}
        onPageChange={handlePageChange}
        restaurantId={restaurantId}
        categories={categories || []}
        ingredients={ingredients?.data}
        isLoading={productsLoading || categoriesLoading || ingredientsLoading}
      />
    </>
  );
}
