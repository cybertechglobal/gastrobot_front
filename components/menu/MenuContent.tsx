'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Plus,
  Edit,
  Trash,
  Package,
  ChefHat,
  Layers,
  Tag,
  Calendar,
} from 'lucide-react';
import { AddProductDialog } from './AddProductDialog';
import { EditProductDialog } from './EditProductDialog';
import { DeleteDialog } from '../DeleteDialog';
import { useRouter } from 'next/navigation';
import { removeMenuItem } from '@/lib/api/menu';
import { MenuItemDetailsDialog } from './MenuItemsDialog';
import { Menu, MenuItem } from '@/types/menu';
import Image from 'next/image';
import { deleteCombo } from '@/lib/api/combo';
import { AddEditComboDialog } from './AddEditComboboxDialog';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';

interface MenuContentProps {
  menu: Menu;
  restaurantId: string;
  menuId: string;
}

export function MenuContent({ menu, restaurantId, menuId }: MenuContentProps) {
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [editComboOpen, setEditComboOpen] = useState(false);
  const [removeMenuItemDialog, setRemoveMenuItemDialog] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<MenuItem | null>(null);
  const [itemType, setItemType] = useState<'combo' | 'product' | ''>('');

  const router = useRouter();

  const categories =
    menu?.categories?.filter((c) => c.id !== 'combo-category') || [];
  const combo = menu?.categories
    ? menu.categories.find((c) => c.id === 'combo-category')
    : null;

  const handleEditProduct = (product: MenuItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedProduct(product);
    setEditProductOpen(true);
  };

  const handleEditCombo = (product: MenuItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedProduct(product);
    setEditComboOpen(true);
  };

  const handleViewDetails = (product: MenuItem) => {
    setSelectedProduct(product);
    setDetailsOpen(true);
  };

  const onRemoveProduct = (
    product: MenuItem,
    type: 'combo' | 'product' | '',
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }
    setRemoveMenuItemDialog(true);
    setProductToDelete(product);
    setItemType(type);
  };

  const onClose = () => {
    setRemoveMenuItemDialog(false);
    setEditProductOpen(false);
    setDetailsOpen(false);
    setEditComboOpen(false);
    setSelectedProduct(null);
  };

  if (categories.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <ChefHat className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-background border-2 border-border rounded-full flex items-center justify-center">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-center">
              Kreiraj svoj meni
            </h3>
            <p className="text-muted-foreground text-center mb-8 text-sm leading-relaxed">
              Započni kreiranje svog menija dodavanjem kategorija i proizvoda.
              Tvoji gosti će moći da pregledaju sve što nudiš.
            </p>

            <div className="flex gap-3">
              <AddProductDialog
                restaurantId={restaurantId}
                menuId={menuId}
                trigger={
                  <Button size="lg" className="shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj proizvod
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Combo sekcija */}
      <Card className="p-0 overflow-hidden shadow-sm border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="p-2 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-md font-semibold uppercase flex items-center gap-2">
                  akcije
                  <Tag size={14} />
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Kreiraj kombinovane ponude
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-background/80 shadow-sm text-xs px-2 py-1"
              >
                {combo?.menuItems?.length || 0}
              </Badge>
              <AddEditComboDialog
                restaurantId={restaurantId}
                menuId={menuId}
                trigger={
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 shadow-sm"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {combo ? (
            <div className="divide-y divide-border/50">
              {combo.menuItems.map((item) => (
                <div
                  key={item.id}
                  className="group hover:bg-muted/30 transition-all duration-200"
                >
                  <div
                    className="p-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => handleViewDetails(item)}
                  >
                    <div className="relative flex-shrink-0 cursor-pointer">
                      {item.combo?.imageUrl ? (
                        <div className="w-16 h-16 relative">
                          <Image
                            src={item.combo?.imageUrl}
                            alt={item.combo.name}
                            fill
                            className="object-cover rounded-lg shadow-sm border"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                            {item.combo.name}
                          </h4>

                          <p className="text-sm text-muted-foreground mt-1">
                            {item.combo.products?.length || 0} proizvoda
                          </p>

                          {/* Prikaz perioda važenja akcije */}
                          {(item.combo.startDate || item.combo.endDate) && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {item.combo.startDate &&
                                  format(
                                    new Date(item.combo.startDate),
                                    'dd.MM.yyyy HH:mm',
                                    { locale: sr }
                                  )}
                                {item.combo.startDate && item.combo.endDate && (
                                  <span className="mx-1">-</span>
                                )}
                                {item.combo.endDate &&
                                  format(
                                    new Date(item.combo.endDate),
                                    'dd.MM.yyyy HH:mm',
                                    { locale: sr }
                                  )}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary/80 border-primary/20 font-medium h-6 px-2"
                          >
                            {item.price} RSD
                          </Badge>

                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={(e) => handleEditCombo(item, e)}
                                className="cursor-pointer text-sm"
                              >
                                <Edit className="h-3 w-3 mr-2" />
                                Uredi
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer text-sm"
                                onClick={(e) =>
                                  onRemoveProduct(item, 'combo', e)
                                }
                              >
                                <Trash className="h-3 w-3 mr-2 text-destructive" />
                                Ukloni
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Nemaš nijednu akciju. Kreiraj prvu!
              </p>
              <AddEditComboDialog
                restaurantId={restaurantId}
                menuId={menuId}
                trigger={
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-2" />
                    Dodaj
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kategorije */}
      {categories?.map((category) => (
        <Card
          key={category.id}
          className="p-0 overflow-hidden shadow-sm border-0 bg-gradient-to-br from-background to-muted/20"
        >
          <CardHeader className="p-2 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-md font-semibold">
                    {category.name?.toUpperCase()}
                  </CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-background/80 shadow-sm text-xs px-2 py-1"
                >
                  {category.menuItems?.length || 0}
                </Badge>
                <AddProductDialog
                  restaurantId={restaurantId}
                  menuId={menuId}
                  preselectedCategory={{ name: category.name, id: category.id }}
                  trigger={
                    <Button size="sm" variant="outline" className="h-8 px-3">
                      <Plus className="h-3 w-3" />
                    </Button>
                  }
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {category.menuItems && category.menuItems.length > 0 ? (
              <div className="divide-y divide-border/50">
                {category.menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="group hover:bg-muted/30 transition-all duration-200"
                  >
                    <div
                      className="p-4 flex items-center gap-4 cursor-pointer"
                      onClick={() => handleViewDetails(item)}
                    >
                      <div className="relative flex-shrink-0 cursor-pointer">
                        {item.product.imageUrl ? (
                          <div className="w-16 h-16 relative">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded-lg shadow-sm border"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                              {item.product.name}
                            </h4>
                            {item.product.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {item.product.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary/80 border-primary/20 font-medium h-6 px-2"
                            >
                              {item.price} RSD
                            </Badge>

                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={(e) => handleEditProduct(item, e)}
                                  className="cursor-pointer text-sm"
                                >
                                  <Edit className="h-3 w-3 mr-2" />
                                  Uredi
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive cursor-pointer text-sm"
                                  onClick={(e) =>
                                    onRemoveProduct(item, 'product', e)
                                  }
                                >
                                  <Trash className="h-3 w-3 mr-2 text-destructive" />
                                  Ukloni
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-muted/20">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-base mb-2">Nema proizvoda</h4>
                <p className="text-muted-foreground mb-4 text-sm">
                  Dodaj prvi proizvod u ovu kategoriju
                </p>
                <AddProductDialog
                  restaurantId={restaurantId}
                  menuId={menuId}
                  preselectedCategory={{ name: category.name, id: category.id }}
                  trigger={
                    <Button size="sm" variant="outline" className="h-8">
                      <Plus className="h-3 w-3 mr-2" />
                      Dodaj
                    </Button>
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <EditProductDialog
        open={editProductOpen}
        onOpenChange={onClose}
        menuItemId={selectedProduct?.id}
        restaurantId={restaurantId}
        menuId={menuId}
      />

      <AddEditComboDialog
        open={editComboOpen}
        onOpenChange={onClose}
        menuItemId={selectedProduct?.id}
        restaurantId={restaurantId}
        menuId={menuId}
      />

      {detailsOpen && (
        <MenuItemDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          menuItemId={selectedProduct?.id}
          restaurantId={restaurantId}
          menuId={menuId}
        />
      )}

      <DeleteDialog
        trigger={<></>}
        open={removeMenuItemDialog}
        onOpenChange={onClose}
        description={`Da li ste sigurni da želite da uklonite ${
          itemType === 'product'
            ? productToDelete?.product?.name
            : productToDelete?.combo.name
        }? Proizvod će biti uklonjen iz menu-a.`}
        successMessage="Stavka je uspešno uklonjena"
        errorMessage="Greška prilikom brisanja stavke"
        mutationOptions={{
          mutationFn: () =>
            itemType === 'product'
              ? removeMenuItem(restaurantId, menuId, productToDelete?.id)
              : deleteCombo(productToDelete?.combo?.id),
          onSuccess: () => {
            setProductToDelete(null);
            router.refresh();
          },
        }}
      />
    </div>
  );
}
