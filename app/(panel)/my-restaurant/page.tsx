import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchMenus } from '@/lib/api/menu';
import { fetchRestaurantById } from '@/lib/api/restaurants';
import RestaurantProfile from '@/components/restaurants/restaurant/Profile';
import { ApiError } from '@/lib/error';
import { RestaurantSkeleton } from '@/components/restaurants/restaurant/RestaurantSkeleton';
import { auth } from '@/auth';
import React from 'react'

export async function generateMetadata() {
  try {
    const session = await auth();

    const id = session?.user?.restaurantUsers[0]?.restaurantId ?? '';

    const restaurant = await fetchRestaurantById(id);
    return {
      title: `${restaurant.name} | Gastrobot Panel`,
      description: restaurant.description,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      title: 'Restaurant Not Found | Gastrobot Panel',
      description: 'The requested restaurant could not be found.',
    };
  }
}

async function RestaurantData({ restaurantId }: { restaurantId: string }) {
  try {
    const [restaurant, menus] = await Promise.all([
      fetchRestaurantById(restaurantId),
      fetchMenus(restaurantId),
    ]);

    return (
      <div className="w-full p-3 sm:p-7">
        <RestaurantProfile restaurant={restaurant} menus={menus} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching restaurant:', error);

    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Failed to load restaurant. Please try again.
        </p>
      </div>
    );
  }
}

export default async function RestaurantPage() {
  const session = await auth();

  const id = session?.user?.restaurantUsers[0]?.restaurantId ?? '';

  return (
    <div className="flex items-start">
      <Suspense fallback={<RestaurantSkeleton />}>
        <RestaurantData restaurantId={id} />
      </Suspense>
    </div>
  );
}
