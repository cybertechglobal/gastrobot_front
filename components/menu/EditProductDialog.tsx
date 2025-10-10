'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateMenuItem } from '@/lib/api/menu';
import {
  assignAddonGroupToMenuItem,
  unassignAddonGroupFromMenuItem,
} from '@/lib/api/addon';
import { AddonGroupSelector } from '../addons/AddonGroupSelector';
import { useMenuItem } from '@/hooks/query/useMenuItem';

const editProductSchema = z.object({
  price: z.string().min(1, 'Cena je obavezna'),
});

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItemId: string | undefined;
  restaurantId: string;
  menuId: string;
}

export function EditProductDialog({
  open,
  onOpenChange,
  menuItemId,
  restaurantId,
  menuId,
}: EditProductDialogProps) {
  const router = useRouter();
  const [selectedAddonGroupIds, setSelectedAddonGroupIds] = useState<string[]>(
    []
  );

  const form = useForm<z.infer<typeof editProductSchema>>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      price: '',
    },
  });

  // Fetch menu item details
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

  // Populate form when menu item data is loaded
  useEffect(() => {
    if (menuItem && open) {
      form.reset({
        price: menuItem.price?.toString() || '',
      });

      // Set initial addon group selection
      const currentAddonGroupIds =
        menuItem.menuItemAddons?.map((addon) => addon.addonGroup.id) || [];

      // Debug log to see what we're getting
      console.log('Menu Item Addons:', menuItem.menuItemAddons);
      console.log('Extracted IDs:', currentAddonGroupIds);

      setSelectedAddonGroupIds(currentAddonGroupIds);
    }
  }, [menuItem, open, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof editProductSchema>) => {
      // First, update the price
      await updateMenuItem(restaurantId, menuId, menuItemId!, {
        price: parseFloat(data.price),
      });

      // Get current addon groups
      const currentAddonIds =
        menuItem?.menuItemAddons?.map((a) => a.addonGroup.id) || [];

      // Find addons to add (in selectedAddonGroupIds but not in currentAddonIds)
      const addonsToAdd = selectedAddonGroupIds.filter(
        (id) => !currentAddonIds.includes(id)
      );

      // Find addons to remove (in currentAddonIds but not in selectedAddonGroupIds)
      const addonsToRemove = currentAddonIds.filter(
        (id: string) => !selectedAddonGroupIds.includes(id)
      );

      // Add new addon groups
      if (addonsToAdd.length > 0) {
        await Promise.all(
          addonsToAdd.map((addonGroupId, index) =>
            assignAddonGroupToMenuItem(addonGroupId, menuItemId!, {
              displayOrder: index,
            })
          )
        );
      }

      if (addonsToRemove.length > 0) {
        await Promise.all(
          addonsToRemove.map((addonGroupId) =>
            unassignAddonGroupFromMenuItem(addonGroupId, menuItemId!)
          )
        );
      }
    },
    onSuccess: () => {
      toast.success('Proizvod je uspešno ažuriran');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error: any) => {
      console.error('Greška pri ažuriranju proizvoda:', error);
      toast.error(error.message || 'Greška pri ažuriranju proizvoda');
    },
  });

  const onSubmit = (data: z.infer<typeof editProductSchema>) => {
    updateMutation.mutate(data);
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onOpenChange(false);
      form.reset();
      setSelectedAddonGroupIds([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Uredi stavku menija</DialogTitle>
        </DialogHeader>

        {isLoadingMenuItem ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">
              Učitavanje podataka...
            </span>
          </div>
        ) : menuItemError ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-destructive">
              Greška pri učitavanju podataka o proizvodu
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {menuItem && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Proizvod
                </h4>
                <p className="font-semibold">{menuItem.product?.name}</p>
                {menuItem.product?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {menuItem.product.description}
                  </p>
                )}
                {menuItem.product?.category && (
                  <p className="text-xs text-blue-600 font-medium mt-2">
                    {menuItem.product.category.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="price">Cena (RSD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...form.register('price')}
                disabled={updateMutation.isPending}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            <AddonGroupSelector
              restaurantId={restaurantId}
              selectedAddonGroupIds={selectedAddonGroupIds}
              onSelectionChange={setSelectedAddonGroupIds}
              disabled={updateMutation.isPending}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                Otkaži
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? 'Ažurira se...' : 'Ažuriraj stavku'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
