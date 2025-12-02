'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2, ChefHat, Layers, X, Upload, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createMenuItem, updateMenuItem } from '@/lib/api/menu';
import { createCombo, updateCombo } from '@/lib/api/combo';
import {
  assignAddonGroupToMenuItem,
  unassignAddonGroupFromMenuItem,
} from '@/lib/api/addon';
import { AddonGroupSelector } from '@/components/addons/AddonGroupSelector';
import Image from 'next/image';
import { useProducts } from '@/hooks/query/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { useMenuItem } from '@/hooks/query/useMenuItem';

const comboSchema = z
  .object({
    name: z.string().min(1, 'Naziv je obavezan'),
    productIds: z.array(z.string()).min(1, 'Izaberite bar jedan proizvod'),
    price: z.string().min(1, 'Cena je obavezna'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;

      const endDate = new Date(data.endDate);

      // If startDate exists, endDate must be after startDate
      if (data.startDate) {
        const startDate = new Date(data.startDate);
        return endDate > startDate;
      }

      // If no startDate, endDate must be after current time
      return endDate > new Date();
    },
    {
      message: 'Kraj akcije mora biti nakon početka akcije',
      path: ['endDate'],
    }
  );

interface AddEditComboDialogProps {
  restaurantId: string;
  menuId: string;
  menuItemId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddEditComboDialog({
  restaurantId,
  menuId,
  menuItemId,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: AddEditComboDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedAddonGroupIds, setSelectedAddonGroupIds] = useState<string[]>(
    []
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 600);

  const router = useRouter();

  const isEditMode = !!menuItemId;
  const dialogOpen =
    controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setDialogOpen = onOpenChange || setInternalOpen;

  const form = useForm<z.infer<typeof comboSchema>>({
    resolver: zodResolver(comboSchema),
    defaultValues: {
      name: '',
      productIds: [],
      price: '',
      startDate: '',
      endDate: '',
    },
  });

  // Fetch menu item details when editing
  const { data: menuItem, isLoading: isLoadingMenuItem } = useMenuItem({
    restaurantId,
    menuId,
    menuItemId,
    enabled: dialogOpen && isEditMode && !!menuItemId,
  });

  // Populate form when editing and data is loaded
  useEffect(() => {
    if (isEditMode && menuItem && dialogOpen) {
      form.setValue('name', menuItem.combo.name);
      form.setValue('price', menuItem.price.toString());

      const productIds = menuItem.combo.products?.map((p) => p.id) || [];
      form.setValue('productIds', productIds);
      setSelectedProducts(productIds);

      // Set date values - convert ISO string to datetime-local format
      if (menuItem.combo.startDate) {
        const startDateLocal = new Date(menuItem.combo.startDate)
          .toISOString()
          .slice(0, 16);
        form.setValue('startDate', startDateLocal);
      }
      if (menuItem.combo.endDate) {
        const endDateLocal = new Date(menuItem.combo.endDate)
          .toISOString()
          .slice(0, 16);
        form.setValue('endDate', endDateLocal);
      }

      // Set initial addon selection
      const addonIds =
        menuItem.menuItemAddons?.map((addon) => addon.addonGroup.id) || [];
      setSelectedAddonGroupIds(addonIds);

      // Set image preview
      if (menuItem.combo.imageUrl) {
        setImagePreview(menuItem.combo.imageUrl);
      }
    } else if (!isEditMode && dialogOpen) {
      form.reset();
      setSelectedProducts([]);
      setSelectedAddonGroupIds([]);
      setImagePreview(null);
      setSelectedImage(null);
    }
  }, [isEditMode, menuItem, dialogOpen, form]);

  useEffect(() => {
    if (dialogOpen) {
      setSearchInput('');
    }
  }, [dialogOpen]);

  const { products: productsResponse, isLoading: isLoadingProducts } =
    useProducts({
      restaurantId,
      filters: {
        name: debouncedSearch,
      },
      enabled: dialogOpen,
    });

  const products = productsResponse?.data || [];

  const createComboMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const combo = await createCombo(formData);
      return combo;
    },
  });

  const updateComboMutation = useMutation({
    mutationFn: async ({
      comboId,
      formData,
    }: {
      comboId: string;
      formData: FormData;
    }) => {
      const combo = await updateCombo(comboId, formData);
      return combo;
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: async ({
      comboId,
      price,
    }: {
      comboId: string;
      price: number;
    }) => {
      // Create menu item
      const menuItem = await createMenuItem(restaurantId, menuId, {
        comboId,
        price,
      });

      // Assign addon groups if any selected
      if (selectedAddonGroupIds.length > 0) {
        await Promise.all(
          selectedAddonGroupIds.map((addonGroupId, index) =>
            assignAddonGroupToMenuItem(addonGroupId, menuItemId!, {
              displayOrder: index,
            })
          )
        );
      }

      return menuItem;
    },
    onSuccess: () => {
      toast.success('Akcija je uspešno dodata u meni!');
      handleClose();
      router.refresh();
    },
    onError: (error: Error) => {
      console.error('Failed to create menu item:', error);
      toast.error(error.message || 'Greška pri dodavanju nove akcije.');
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({
      menuItemId,
      price,
    }: {
      menuItemId: string;
      price: number;
    }) => {
      // Update menu item price
      await updateMenuItem(restaurantId, menuId, menuItemId, { price });

      // Handle addon groups
      const currentAddonIds =
        menuItem?.menuItemAddons?.map((a) => a.addonGroup.id) || [];

      // Find addons to add
      const addonsToAdd = selectedAddonGroupIds.filter(
        (id) => !currentAddonIds.includes(id)
      );

      // Add new addon groups
      if (addonsToAdd.length > 0) {
        await Promise.all(
          addonsToAdd.map((addonGroupId, index) =>
            assignAddonGroupToMenuItem(addonGroupId, menuItemId, {
              displayOrder: index,
            })
          )
        );
      }

      const addonsToRemove = currentAddonIds.filter(
        (id: string) => !selectedAddonGroupIds.includes(id)
      );

      if (addonsToRemove.length > 0) {
        await Promise.all(
          addonsToRemove.map((addonGroupId) =>
            unassignAddonGroupFromMenuItem(addonGroupId, menuItemId!)
          )
        );
      }
    },
    onSuccess: () => {
      toast.success('Akcija je uspešno ažurirana!');
      handleClose();
      router.refresh();
    },
    onError: (error: Error) => {
      console.error('Failed to update menu item:', error);
      toast.error(error.message || 'Greška pri ažuriranju akcije.');
    },
  });

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSelection = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      form.setValue('productIds', newSelection);
      return newSelection;
    });
  };

  const handleClose = () => {
    setDialogOpen(false);
    form.reset();
    setSelectedProducts([]);
    setSelectedAddonGroupIds([]);
    setImagePreview(null);
    setSelectedImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: z.infer<typeof comboSchema>) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('price', data.price);

      data.productIds.forEach((productId) => {
        formData.append('products[]', productId);
      });

      // Convert datetime-local to ISO string
      if (data.startDate) {
        const startDateISO = new Date(data.startDate).toISOString();
        formData.append('startDate', startDateISO);
      }

      if (data.endDate) {
        const endDateISO = new Date(data.endDate).toISOString();
        formData.append('endDate', endDateISO);
      }

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      if (isEditMode && menuItem) {
        // Edit mode
        await updateComboMutation.mutateAsync({
          comboId: menuItem.combo.id,
          formData,
        });

        await updateMenuItemMutation.mutateAsync({
          menuItemId: menuItem.id,
          price: parseFloat(data.price),
        });
      } else {
        // Create mode
        const combo = await createComboMutation.mutateAsync(formData);

        await createMenuItemMutation.mutateAsync({
          comboId: combo.id,
          price: parseFloat(data.price),
        });
      }
    } catch (error) {
      console.error('Error with combo:', error);
      toast.error(
        isEditMode
          ? 'Greška pri ažuriranju akcije.'
          : 'Greška pri kreiranju nove akcije.'
      );
    }
  };

  const isPending =
    createComboMutation.isPending ||
    updateComboMutation.isPending ||
    createMenuItemMutation.isPending ||
    updateMenuItemMutation.isPending ||
    isLoadingMenuItem;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            {isEditMode ? 'Izmeni Kombinaciju' : 'Kreiraj Kombinaciju'}
          </DialogTitle>
        </DialogHeader>

        {isEditMode && isLoadingMenuItem ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Učitavanje podataka...
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Naziv */}
            <div className="space-y-2">
              <Label htmlFor="name">Naziv akcije *</Label>
              <Input
                id="name"
                placeholder="npr. Porodični meni, Roštilj za dvoje..."
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Slika */}
            <div className="space-y-2">
              <Label>Slika akcije (opciono)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById('image-upload')?.click()
                  }
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {imagePreview ? 'Promeni sliku' : 'Izaberi sliku'}
                </Button>
                {imagePreview && (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Pregled"
                      width={64}
                      height={64}
                      className="object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Izbor proizvoda */}
            <div className="space-y-3">
              <Label>Proizvodi u akciji *</Label>

              {/* Prikaz selektovanih proizvoda - uvek vidljivi */}
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                  {selectedProducts.map((productId) => {
                    // Pronađi u trenutnoj listi ili zadrži iz inicijalnih podataka
                    const product =
                      products.find((p) => p.id === productId) ||
                      menuItem?.combo.products?.find((p) => p.id === productId);

                    return product ? (
                      <div
                        key={productId}
                        className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-full text-sm border"
                      >
                        <span>{product.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleProduct(productId)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {/* Pretraga */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pretraži stavke..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Lista proizvoda za selekciju */}
              <div className="border rounded-lg max-h-72 overflow-y-auto">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Učitavanje proizvoda...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      {searchInput
                        ? 'Nema rezultata pretrage'
                        : 'Nema dostupnih proizvoda'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {products.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center gap-4 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProduct(product.id)}
                        />
                        <div className="flex items-center gap-3 flex-1">
                          {product?.imageUrl ? (
                            <div className="w-12 h-12 relative flex-shrink-0">
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 bg-gradient-to-br rounded from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center flex-shrink-0">
                              <ChefHat className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">
                              {product.name}
                            </h4>
                            {product.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {product.description}
                              </p>
                            )}
                            <span className="text-xs text-primary font-medium">
                              {product.category.name}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {form.formState.errors.productIds && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.productIds.message}
                </p>
              )}
            </div>

            {/* Cena */}
            <div className="space-y-2">
              <Label htmlFor="price">Cena (RSD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...form.register('price')}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            {/* Period trajanja akcije */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px bg-border flex-1" />
                <Label className="text-muted-foreground text-sm">
                  Period važenja akcije (opciono)
                </Label>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startDate">Početak akcije</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    {...form.register('startDate')}
                    className="w-full"
                  />
                  {form.formState.errors.startDate && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="endDate">Kraj akcije</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    min={
                      form.watch('startDate') ||
                      new Date().toISOString().slice(0, 16)
                    }
                    {...form.register('endDate')}
                    className="w-full"
                  />
                  {form.formState.errors.endDate && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Addon Groups */}
            <AddonGroupSelector
              restaurantId={restaurantId}
              selectedAddonGroupIds={selectedAddonGroupIds}
              onSelectionChange={setSelectedAddonGroupIds}
              disabled={isPending}
            />

            {/* Akcije */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isPending}
              >
                Otkaži
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isPending}
                className="flex-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditMode ? 'Ažuriranje...' : 'Kreiranje...'}
                  </>
                ) : isEditMode ? (
                  'Sačuvaj izmene'
                ) : (
                  'Kreiraj i dodaj u meni'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
