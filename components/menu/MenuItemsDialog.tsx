'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, ChefHat, X, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProductIngredients } from '@/lib/api/ingredients';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { MenuItem } from '@/types/menu';

interface MenuItemDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem: MenuItem | null;
  restaurantId: string;
  productId: string | undefined;
}

export function MenuItemDetailsDialog({
  open,
  onOpenChange,
  menuItem,
  restaurantId,
  productId,
}: MenuItemDetailsProps) {
  const {
    data: ingredients,
    isPending: loading,
    error,
  } = useQuery({
    queryKey: ['ingredients', restaurantId, productId],
    queryFn: () => fetchProductIngredients(restaurantId, productId!),
    enabled: !!(open && productId),
  });

  if (!menuItem) return null;

  const { product } = menuItem;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl max-h-[90vh] p-0 overflow-hidden"
      >
        <div className="relative">
          {/* Hero Section with Image */}
          <div className="relative h-64 bg-gradient-to-br from-primary/10 to-secondary/10">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Overlay for unavailable items */}
            {/* {menuItem.isAvailable === false && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Trenutno nedostupno
                </Badge>
              </div>
            )} */}

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-background/80 hover:bg-background"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <DialogHeader className="space-y-4 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex flex-col items-start">
                  <DialogTitle className="text-2xl font-bold text-left">
                    {product.name}
                  </DialogTitle>
                  {product.description && (
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 font-semibold text-md px-4 py-2"
                >
                  {menuItem.price} RSD
                </Badge>
              </div>
            </DialogHeader>

            <Separator className="my-6" />

            {/* Ingredients Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Sastojci</h3>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">
                    Učitavanje sastojaka...
                  </span>
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 py-4 px-4 bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <span className="text-destructive">{error.message}</span>
                </div>
              ) : ingredients.length > 0 ? (
                <ScrollArea className="max-h-48">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ingredients.map((ingredient) => (
                      <div
                        key={ingredient.ingredient.id}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border"
                      >
                        <span className="font-sm text-sm">
                          {ingredient?.ingredient?.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {ingredient.quantity} {ingredient.unit}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nema definisanih sastojaka</p>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Additional Info */}
            <div className="space-y-3 text-sm text-muted-foreground">
              {product.createdAt && (
                <div className="flex justify-between">
                  <span>Dodato:</span>
                  <span>
                    {new Date(product.createdAt).toLocaleDateString('sr-RS')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
