'use client';

import { useEffect } from 'react';
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
import { toast } from 'sonner';
import { updateMenuItem } from '@/lib/api/menu'; // You'll need to implement this

const editProductSchema = z.object({
  price: z.string().min(1, 'Cena je obavezna'),
});

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  restaurantId: string;
  menuId: string;
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  restaurantId,
  menuId,
}: EditProductDialogProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof editProductSchema>>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      price: '',
    },
  });

  // Reset form when product changes or modal opens
  useEffect(() => {
    if (product && open) {
      form.reset({
        price: product?.price?.toString() || '',
      });
    }
  }, [product, open, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof editProductSchema>) => {
      return updateMenuItem(restaurantId, menuId, product.id, {
        price: parseFloat(data.price),
      });
    },
    onSuccess: () => {
      toast.success('Cena je uspešno ažurirana');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error: any) => {
      console.error('Greška pri ažuriranju cene:', error);
      toast.error('Greška pri ažuriranju cene');
    },
  });

  const onSubmit = (data: z.infer<typeof editProductSchema>) => {
    updateMutation.mutate(data);
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uredi proizvod</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {product && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">
                Proizvod
              </h4>
              <p className="font-semibold">{product.product?.name}</p>
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
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              {updateMutation.isPending ? 'Ažurira se...' : 'Ažuriraj proizvod'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
