import { Suspense } from 'react';
import { IngredientsListSkeleton } from '@/components/ingredients/IngredientsListSkeleton';
import { fetchIngredients } from '@/lib/api/ingredients';
import Ingredients from '@/components/ingredients/Ingredients';
import IngredientsFilters from '@/components/ingredients/IngredientsFilters';

export const metadata = {
  title: 'Sastojci | Gastrobot Panel',
  description: 'Panel za upravljanje sastojcima',
};

interface IngredientsPageProps {
  searchParams: Promise<{
    page?: string;
    name?: string;
  }>;
}

function getApiParams(
  filters: { name: string },
  page: number,
  limit: number = 1
) {
  const apiParams = {
    ...filters,
    page,
    limit,
  };

  return apiParams;
}

async function IngredientsData({
  initialValues,
  currentPage,
}: {
  initialValues: { name: string };
  currentPage: number;
}) {
  try {
    const apiParams = getApiParams(initialValues, currentPage, 10);

    const response = await fetchIngredients({ params: apiParams });

    return (
      <Ingredients
        allIngredients={response.data}
        initialFilters={initialValues}
        totalCount={response.total}
        currentPage={currentPage}
        itemsPerPage={10}
      />
    );
  } catch (error) {
    console.error('Error loading ingredients:', error);

    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Failed to load ingredients. Please try again.
        </p>
      </div>
    );
  }
}

export default async function IngredientsPage({
  searchParams,
}: IngredientsPageProps) {
  const resolvedSearchParams = await searchParams;

  const initialValues = {
    name: resolvedSearchParams.name || '',
  };

  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);

  const key = JSON.stringify(resolvedSearchParams);

  return (
    <div className="p-6 md:p-8">
      <IngredientsFilters initialFilters={initialValues} />

      <Suspense key={key} fallback={<IngredientsListSkeleton />}>
        <IngredientsData
          initialValues={initialValues}
          currentPage={currentPage}
        />
      </Suspense>
    </div>
  );
}
