'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import { fetchProducts } from '@/lib/api/products';
import { fetchCategories } from '@/lib/api/category';
import { fetchRestaurantIngredients } from '@/lib/api/ingredients';

import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsList } from '@/components/products/ProductsList';

export default function Products({ restaurantId }: { restaurantId: string }) {
  const { id } = useParams() as { id: string };

  const restaurantID = restaurantId || id;

  // Lokalno stanje za filtere
  const [filters, setFilters] = useState({
    name: '',
    categoryId: '',
    page: 1,
  });

  const limit = 15;

  // Query sa lokalnim filter stanjem
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['products', restaurantID, { ...filters, limit }],
    queryFn: () =>
      fetchProducts(restaurantID, {
        params: {
          page: filters.page,
          limit,
          name: filters.name,
          categoryId: filters.categoryId,
        },
      }),
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const {
    data: ingredients,
    isLoading: ingredientsLoading,
    error: ingredientsError,
  } = useQuery({
    queryKey: ['ingredients', restaurantID, { include: 'global' }],
    queryFn: () =>
      fetchRestaurantIngredients(restaurantID, {
        params: { include: 'global' },
      }),
  });

  // Handler funkcije za ažuriranje filtera
  const handleSearchChange = (name: string) => {
    setFilters((prev) => ({ ...prev, name, page: 1 })); // Reset page na 1
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters((prev) => ({ ...prev, categoryId, page: 1 })); // Reset page na 1
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({ name: '', categoryId: '', page: 1 });
  };

  // if (productsLoading || categoriesLoading || ingredientsLoading) {
  //   return <ProductsSkeleton />;
  // }

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
    <div className="container space-y-6">
      <ProductsHeader
        restaurantId={restaurantID}
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
        restaurantId={restaurantID}
        categories={categories || []}
        ingredients={ingredients?.data}
        isLoading={productsLoading || categoriesLoading || ingredientsLoading}
      />
    </div>
  );
}
