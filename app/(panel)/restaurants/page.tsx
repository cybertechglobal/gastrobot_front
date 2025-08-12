// app/restaurants/page.tsx
import { Suspense } from 'react';
import MainFilters from '@/components/restaurants/MainFilters';
import { RestaurantsListSkeleton } from '@/components/restaurants/RestaurantsListSkeleton';
import { fetchRestaurants } from '@/lib/api/restaurants';
import Restaurants from '@/components/restaurants/Restaurants';
import { Metadata } from 'next';

export async function generateMetadata({
  searchParams,
}: RestaurantsPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;

  const titleParts: string[] = ['Restorani'];
  const descriptionParts: string[] = ['Panel za upravljanje restoranima'];

  // Dodaj grad u title
  if (resolvedParams.city && resolvedParams.city !== 'all') {
    titleParts.push(`u ${resolvedParams.city}`);
    descriptionParts.push(`u gradu ${resolvedParams.city}`);
  }

  // Dodaj status
  if (resolvedParams.status && resolvedParams.status !== 'all') {
    const statusText =
      resolvedParams.status === 'active'
        ? 'aktivni'
        : resolvedParams.status === 'inactive'
        ? 'neaktivni'
        : resolvedParams.status;
    titleParts.push(`(${statusText})`);
    descriptionParts.push(`sa statusom ${statusText}`);
  }

  // Dodaj ime restorana
  if (resolvedParams.name) {
    titleParts.push(`- pretraga: "${resolvedParams.name}"`);
    descriptionParts.push(
      `koja odgovaraju pretragama "${resolvedParams.name}"`
    );
  }

  // Dodaj broj stranice ako nije prva
  const page = parseInt(resolvedParams.page || '1', 10);
  if (page > 1) {
    titleParts.push(`- Stranica ${page}`);
  }

  const title = `${titleParts.join(' ')} | Gastrobot Panel`;
  const description = descriptionParts.join(' ') + '.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

interface RestaurantsPageProps {
  searchParams: Promise<{
    page?: string;
    city: string;
    status: string;
    name: string;
  }>;
}

// Funkcija koja priprema parametre za API poziv
function getApiParams(
  filters: { city: string; status: string; name: string },
  page: number,
  limit: number = 10
) {
  const apiParams = {
    ...filters,
    page,
    limit,
  };

  // Transform 'all' values for API
  if (apiParams.status === 'all') {
    apiParams.status = 'all'; // ili '' ako API očekuje prazan string za sve statuse
  }
  if (apiParams.city === 'all') {
    apiParams.city = ''; // ukloni city filter ako je 'all'
  }

  return apiParams;
}

async function RestaurantData({
  initialValues,
  currentPage,
}: {
  initialValues: { city: string; status: string; name: string };
  currentPage: number;
}) {
  try {
    // Koristi getApiParams da pripremiš sve parametre za API
    const apiParams = getApiParams(initialValues, currentPage, 10);

    const response = await fetchRestaurants({ params: apiParams });

    return (
      <Restaurants
        allRestaurants={response.data}
        initialFilters={initialValues}
        totalCount={response.total}
        currentPage={currentPage}
        itemsPerPage={10}
      />
    );
  } catch (error) {
    console.error('Error loading restaurants:', error);

    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Failed to load restaurants. Please try again.
        </p>
      </div>
    );
  }
}

export default async function RestaurantsPage({
  searchParams,
}: RestaurantsPageProps) {
  const resolvedSearchParams = await searchParams;

  const initialValues = {
    city: resolvedSearchParams.city || 'all',
    status: resolvedSearchParams.status || 'all',
    name: resolvedSearchParams.name || '',
  };

  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);

  const key = JSON.stringify(resolvedSearchParams);

  return (
    <div className="p-6 md:p-8">
      <MainFilters initialFilters={initialValues} />

      <Suspense key={key} fallback={<RestaurantsListSkeleton />}>
        <RestaurantData
          initialValues={initialValues}
          currentPage={currentPage}
        />
      </Suspense>
    </div>
  );
}
