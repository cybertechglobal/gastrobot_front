import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchMenuById } from '@/lib/api/menu';
import { MenuHeader } from '@/components/menu/MenuHeader';
import { MenuContent } from '@/components/menu/MenuContent';
import { MenuSkeleton } from '@/components/menu/MenuSkeleton';
import { ApiError } from '@/lib/error';

interface PageProps {
  params: Promise<{
    id: string;
    menuId: string;
  }>;
}

async function MenuData({
  restaurantId,
  menuId,
}: {
  restaurantId: string;
  menuId: string;
}) {
  try {
    const menu = await fetchMenuById(restaurantId, menuId);

    return (
      <div className="space-y-6">
        <MenuHeader menu={menu} restaurantId={restaurantId} menuId={menuId} />
        <MenuContent menu={menu} restaurantId={restaurantId} menuId={menuId} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching menu:', error);

    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Failed to load menu. Please try again.
        </p>
      </div>
    );
  }
}

export default async function MenuPage({ params }: PageProps) {
  const { id, menuId } = await params;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Suspense fallback={<MenuSkeleton />}>
        <MenuData restaurantId={id} menuId={menuId} />
      </Suspense>
    </div>
  );
}
