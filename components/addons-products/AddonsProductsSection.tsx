'use client';

import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, ShoppingBag } from 'lucide-react';
import Products from '../products/Products';
import Addons from '../addons/Addons';

export default function AddonsProductsSection({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const { id } = useParams() as { id: string };

  const restaurantID = restaurantId || id;

  return (
    <div className="container space-y-6">
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Proizvodi
          </TabsTrigger>
          <TabsTrigger value="addons" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Dodaci
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6 mt-6">
          <Products restaurantId={restaurantID} />
        </TabsContent>

        <TabsContent value="addons" className="space-y-6 mt-6">
          <Addons restaurantId={restaurantID} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
