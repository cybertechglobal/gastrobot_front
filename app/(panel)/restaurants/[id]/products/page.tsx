import { Suspense } from 'react';
import { fetchProducts } from '@/lib/api/products';
import { ProductsHeader } from '@/components/products/ProductsHeader';
import { ProductsList } from '@/components/products/ProductsList';
import { ProductsSkeleton } from '@/components/products/ProductsSkeleton';
import { fetchCategories } from '@/lib/api/category';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}

function getApiParams(
  filters: { search: string; category: string },
  page: number,
  limit: number = 10
) {
  const apiParams = {
    ...filters,
    page,
    limit,
  };

  // Transform 'all' values for API
  if (apiParams.category === 'all') {
    apiParams.category = '';
  }

  return apiParams;
}

async function ProductsData({
  restaurantId,
  initialValues,
  currentPage,
}: {
  restaurantId: string;
  initialValues: { search: string; category: string };
  currentPage: number;
}) {
  try {
    const apiParams = getApiParams(initialValues, currentPage, 10);

    const [products, categories] = await Promise.all([
      fetchProducts(restaurantId, {
        params: apiParams,
      }),
      fetchCategories(),
    ]);

    return (
      <div className="space-y-6">
        <ProductsHeader
          restaurantId={restaurantId}
          categories={categories}
          totalProducts={products.total}
          onSearchChange={() => {}}
          onCategoryChange={() => {}}
          filters={{ name: '', categoryId: '', page: 0 }}
        />
        <ProductsList
          products={products.data}
          total={products.total}
          currentPage={currentPage}
          restaurantId={restaurantId}
          categories={categories}
          onPageChange={() => {}}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Failed to load products. Please try again.
        </p>
      </div>
    );
  }
}

export default async function ProductsPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { id: restaurantId } = await params;

  const initialValues = {
    search: resolvedSearchParams.search || '',
    category: resolvedSearchParams.category || 'all',
  };

  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);

  const key = JSON.stringify(resolvedSearchParams);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Suspense key={key} fallback={<ProductsSkeleton />}>
        <ProductsData
          restaurantId={restaurantId}
          currentPage={currentPage}
          initialValues={initialValues}
        />
      </Suspense>
    </div>
  );
}
