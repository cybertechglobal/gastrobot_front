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
import {
  Package,
  ChefHat,
  X,
  Loader2,
  AlertCircle,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProductIngredients } from '@/lib/api/ingredients';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useMenuItem } from '@/hooks/query/useMenuItem';

interface MenuItemDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItemId: string | undefined;
  restaurantId: string;
  menuId: string;
}

export function MenuItemDetailsDialog({
  open,
  onOpenChange,
  menuItemId,
  restaurantId,
  menuId,
}: MenuItemDetailsProps) {
  const {
    data: menuItem,
    isLoading: isLoadingMenuItem,
    error: menuItemError,
  } = useMenuItem({
    restaurantId,
    menuId,
    menuItemId,
    enabled: open && !!menuItemId && !!restaurantId && !!menuId,
  });

  const isCombo = !!menuItem?.combo;
  const productId = menuItem?.product?.id;

  // Fetch ingredients only for regular products (not combos)
  const {
    data: ingredients,
    isLoading: isLoadingIngredients,
    error: ingredientsError,
  } = useQuery({
    queryKey: ['ingredients', restaurantId, productId],
    queryFn: () => fetchProductIngredients(restaurantId, productId!),
    enabled: !!(open && productId && !isCombo),
  });

  if (isLoadingMenuItem) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Učitavanje detalja...
            </span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (menuItemError || !menuItem) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive">
              Greška pri učitavanju detalja proizvoda
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { product, combo, menuItemAddons } = menuItem;
  const hasAddons = menuItemAddons && menuItemAddons.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl max-h-[90vh] p-0 overflow-y-auto"
      >
        <div className="relative">
          {/* Hero Section with Image */}
          <div className="relative h-64 bg-gradient-to-br from-primary/10 to-secondary/10">
            {isCombo ? (
              combo?.imageUrl ? (
                <Image
                  src={combo.imageUrl}
                  alt={combo.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
                    <Layers className="h-12 w-12 text-primary" />
                  </div>
                </div>
              )
            ) : product?.imageUrl ? (
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

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-background/80 hover:bg-background"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Combo Badge */}
            {isCombo && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-primary/90 text-white px-3 py-1">
                  <Layers className="h-3 w-3 mr-1" />
                  Akcija
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <ScrollArea className="max-h-[calc(90vh-16rem)]">
            <div className="p-6">
              <DialogHeader className="space-y-4 pb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex flex-col items-start">
                    <DialogTitle className="text-2xl font-bold text-left">
                      {isCombo ? combo.name : product.name}
                    </DialogTitle>
                    {!isCombo && product.description && (
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {product.description}
                      </p>
                    )}
                    {isCombo && (
                      <p className="text-muted-foreground text-base leading-relaxed">
                        Kombinovana ponuda sa {combo.products?.length || 0}{' '}
                        proizvoda
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary/90 border-primary/20 font-semibold text-md px-4 py-2"
                  >
                    {menuItem.price} RSD
                  </Badge>
                </div>
              </DialogHeader>

              <Separator className="my-6" />

              {/* Combo Products Section */}
              {isCombo ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      Proizvodi u akciji
                    </h3>
                  </div>

                  {combo.products && combo.products.length > 0 ? (
                    <div className="space-y-3">
                      {combo.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {product.imageUrl ? (
                              <div className="w-16 h-16 relative">
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded flex items-center justify-center">
                                <ChefHat className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">
                              {product.name}
                            </h4>
                            {product.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nema proizvoda u ovoj akciji</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Regular Product Ingredients Section */
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Sastojci</h3>
                  </div>

                  {isLoadingIngredients ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">
                        Učitavanje sastojaka...
                      </span>
                    </div>
                  ) : ingredientsError ? (
                    <div className="flex items-center gap-2 py-4 px-4 bg-destructive/10 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <span className="text-destructive">
                        {ingredientsError.message}
                      </span>
                    </div>
                  ) : ingredients && ingredients.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nema definisanih sastojaka</p>
                    </div>
                  )}
                </div>
              )}

              {/* Addons Section - Available for both combos and regular products */}
              {hasAddons && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Dostupni dodaci</h3>
                      <Badge variant="secondary" className="ml-auto">
                        {menuItemAddons.length}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {menuItemAddons.map((addonGroup) => (
                        <Card
                          key={addonGroup.id}
                          className="overflow-hidden border-l-4 border-l-primary/50"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Addon Group Header */}
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-semibold text-base">
                                    {addonGroup.addonGroup.name}
                                  </h4>
                                  <div className="flex gap-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Min: {addonGroup.addonGroup.minSelection}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Max: {addonGroup.addonGroup.maxSelection}
                                    </Badge>
                                  </div>
                                </div>
                                {addonGroup.addonGroup.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {addonGroup.addonGroup.description}
                                  </p>
                                )}
                              </div>

                              {/* Addon Options */}
                              {addonGroup.addonGroup.addonOptions &&
                                Array.isArray(
                                  addonGroup.addonGroup.addonOptions
                                ) &&
                                addonGroup.addonGroup.addonOptions.length >
                                  0 && (
                                  <div className="space-y-2 pt-2 border-t">
                                    {addonGroup.addonGroup.addonOptions.map(
                                      (option) => (
                                        <div
                                          key={option.id}
                                          className={`flex items-start justify-between p-2 rounded-md transition-colors ${
                                            option.isAvailable
                                              ? 'bg-muted/30 hover:bg-muted/50'
                                              : 'bg-destructive/5 opacity-60'
                                          }`}
                                        >
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium">
                                                {option.name}
                                              </span>
                                              {!option.isAvailable && (
                                                <Badge
                                                  variant="destructive"
                                                  className="text-xs"
                                                >
                                                  Nedostupno
                                                </Badge>
                                              )}
                                            </div>
                                            {option.description && (
                                              <p className="text-xs text-muted-foreground mt-1">
                                                {option.description}
                                              </p>
                                            )}
                                          </div>
                                          <span className="text-sm font-semibold text-primary whitespace-nowrap ml-3">
                                            +
                                            {parseFloat(option.price).toFixed(
                                              2
                                            )}{' '}
                                            RSD
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator className="my-6" />

              {/* Additional Info */}
              <div className="space-y-3 text-sm text-muted-foreground">
                {isCombo
                  ? combo.createdAt && (
                      <div className="flex justify-between">
                        <span>Kreirano:</span>
                        <span>
                          {new Date(combo.createdAt).toLocaleDateString(
                            'sr-RS'
                          )}
                        </span>
                      </div>
                    )
                  : product.createdAt && (
                      <div className="flex justify-between">
                        <span>Dodato:</span>
                        <span>
                          {new Date(product.createdAt).toLocaleDateString(
                            'sr-RS'
                          )}
                        </span>
                      </div>
                    )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
